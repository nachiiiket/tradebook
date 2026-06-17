import json

from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from journal.models import Trade


def _build_trade_context(trade):
    return {
        "symbol": trade.symbol,
        "direction": trade.direction,
        "result": trade.result,
        "pnl": float(trade.pnl),
        "rr_ratio": float(trade.rr_ratio) if trade.rr_ratio else None,
        "planned_rr": float(trade.planned_rr) if trade.planned_rr else None,
        "session": trade.session,
        "timeframe": trade.timeframe,
        "timeframe_confluences": trade.timeframe_confluences,
        "confluences": trade.confluences,
        "notes": trade.notes,
        "emotional_state": trade.emotional_state,
        "mistakes": trade.mistakes,
        "lessons_learned": trade.lessons_learned,
        "strategy": trade.strategy.name if trade.strategy else None,
        "trade_date": str(trade.trade_date),
    }


def _build_user_stats(user, limit=30):
    recent = Trade.objects.filter(user=user).order_by("-trade_date")[:limit]
    total = recent.count()
    wins = recent.filter(result="win").count()
    return {
        "recent_trade_count": total,
        "recent_win_rate": round((wins / total) * 100, 2) if total else 0,
        "recent_pnl": float(sum(float(t.pnl) for t in recent)),
    }


def _call_openai(system_prompt, user_prompt):
    if not settings.OPENAI_API_KEY:
        return None

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=1500,
        )
        return response.choices[0].message.content
    except Exception:
        return None


def _fallback_analysis(trade, stats):
    suggestions = []
    if trade.result == "loss":
        suggestions.append("Review whether you followed your planned stop loss and entry criteria.")
        if trade.mistakes:
            suggestions.append(f"Address documented mistake: {trade.mistakes[:200]}")
        else:
            suggestions.append("Document what went wrong — unclear post-trade notes make improvement harder.")
    elif trade.result == "win":
        suggestions.append("Confirm the win matched your plan (not luck). Note which confluences were present.")
        if trade.planned_rr and trade.rr_ratio and float(trade.rr_ratio) < float(trade.planned_rr):
            suggestions.append("You exited early vs planned RR — consider trailing rules or partial exits.")

    if trade.emotional_state:
        suggestions.append(f"Emotional state was '{trade.emotional_state}' — track if this correlates with losses.")

    if stats["recent_win_rate"] < 50 and stats["recent_trade_count"] >= 5:
        suggestions.append("Recent win rate is below 50%. Reduce size and trade only A+ setups until edge returns.")

    return {
        "summary": f"Analysis for {trade.symbol} ({trade.result.upper()}) on {trade.trade_date}.",
        "strengths": [c for c in (trade.confluences or [])[:3]] or ["Complete confluence tagging to unlock pattern insights."],
        "weaknesses": [trade.mistakes] if trade.mistakes else ["No mistakes logged — add honest post-trade review."],
        "improvements": suggestions,
        "risk_notes": [
            f"RR achieved: {trade.rr_ratio or 'N/A'}",
            f"Session: {trade.get_session_display()}",
        ],
        "ai_powered": False,
    }


class TradeAnalysisView(APIView):
    def post(self, request):
        trade_id = request.data.get("trade_id")
        if not trade_id:
            return Response({"error": "trade_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            trade = Trade.objects.select_related("strategy").get(pk=trade_id, user=request.user)
        except Trade.DoesNotExist:
            return Response({"error": "Trade not found"}, status=status.HTTP_404_NOT_FOUND)

        stats = _build_user_stats(request.user)
        trade_ctx = _build_trade_context(trade)

        system_prompt = """You are an expert trading coach and performance analyst.
Analyze the trader's journal entry and provide actionable, specific feedback.
Be direct but supportive. Focus on process over outcome.
Respond ONLY with valid JSON in this exact structure:
{
  "summary": "2-3 sentence overview",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improvements": ["specific actionable improvement 1", "improvement 2", "improvement 3"],
  "risk_notes": ["risk observation 1", "risk observation 2"],
  "pattern_insight": "one insight about their trading patterns based on stats"
}"""

        user_prompt = f"""Trade details:
{json.dumps(trade_ctx, indent=2)}

Trader recent stats:
{json.dumps(stats, indent=2)}

Analyze this trade and suggest concrete improvements for the trader's edge and psychology."""

        ai_response = _call_openai(system_prompt, user_prompt)

        if ai_response:
            try:
                cleaned = ai_response.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
                result = json.loads(cleaned)
                result["ai_powered"] = True
                return Response(result)
            except json.JSONDecodeError:
                return Response(
                    {
                        "summary": ai_response[:500],
                        "strengths": [],
                        "weaknesses": [],
                        "improvements": [ai_response],
                        "risk_notes": [],
                        "ai_powered": True,
                    }
                )

        return Response(_fallback_analysis(trade, stats))


class PortfolioCoachView(APIView):
    def post(self, request):
        trades = Trade.objects.filter(user=request.user).order_by("-trade_date")[:50]
        if not trades.exists():
            return Response(
                {
                    "summary": "No trades yet. Start journaling to unlock AI coaching.",
                    "recommendations": ["Log your first trade with notes and confluences."],
                    "ai_powered": False,
                }
            )

        trade_summaries = [_build_trade_context(t) for t in trades[:20]]
        stats = _build_user_stats(request.user, limit=50)

        system_prompt = """You are a trading performance coach reviewing a trader's journal.
Identify patterns, recurring mistakes, and high-edge setups.
Respond ONLY with valid JSON:
{
  "summary": "portfolio-level overview",
  "top_patterns": ["pattern 1", "pattern 2"],
  "recommendations": ["action 1", "action 2", "action 3"],
  "focus_areas": ["area 1", "area 2"]
}"""

        user_prompt = f"""Recent trades:
{json.dumps(trade_summaries, indent=2)}

Stats:
{json.dumps(stats, indent=2)}"""

        ai_response = _call_openai(system_prompt, user_prompt)

        if ai_response:
            try:
                cleaned = ai_response.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
                result = json.loads(cleaned)
                result["ai_powered"] = True
                return Response(result)
            except json.JSONDecodeError:
                return Response({"summary": ai_response, "recommendations": [], "ai_powered": True})

        wins = trades.filter(result="win").count()
        total = trades.count()
        return Response(
            {
                "summary": f"You have {total} recent trades with {round((wins/total)*100,1)}% win rate.",
                "top_patterns": ["Add more confluence tags to detect patterns automatically."],
                "recommendations": [
                    "Review losing trades for common session or emotional triggers.",
                    "Track planned vs actual RR on every trade.",
                    "Set a max daily loss and respect it.",
                ],
                "focus_areas": ["Journaling consistency", "Risk management"],
                "ai_powered": False,
            }
        )
