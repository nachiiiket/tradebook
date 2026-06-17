from calendar import monthrange
from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Avg, Count, Max, Min, Q, Sum
from django.db.models.functions import ExtractWeekDay, TruncMonth, TruncWeek

from journal.models import Trade


def _decimal(val):
    if val is None:
        return Decimal("0")
    return Decimal(str(val))


def get_filtered_trades(user, date_from=None, date_to=None, strategy_id=None):
    qs = Trade.objects.filter(user=user)
    if date_from:
        qs = qs.filter(trade_date__gte=date_from)
    if date_to:
        qs = qs.filter(trade_date__lte=date_to)
    if strategy_id:
        qs = qs.filter(strategy_id=strategy_id)
    return qs


def compute_overview(trades):
    total = trades.count()
    wins = trades.filter(result="win").count()
    losses = trades.filter(result="loss").count()
    breakevens = trades.filter(result="breakeven").count()

    total_pnl = _decimal(trades.aggregate(s=Sum("pnl"))["s"])
    avg_pnl = _decimal(trades.aggregate(a=Avg("pnl"))["a"]) if total else Decimal("0")
    avg_rr = _decimal(trades.aggregate(a=Avg("rr_ratio"))["a"]) if total else Decimal("0")

    win_pnl = _decimal(trades.filter(result="win").aggregate(s=Sum("pnl"))["s"])
    loss_pnl = abs(_decimal(trades.filter(result="loss").aggregate(s=Sum("pnl"))["s"]))
    profit_factor = float(win_pnl / loss_pnl) if loss_pnl > 0 else (float(win_pnl) if win_pnl > 0 else 0)

    win_rate = round((wins / total) * 100, 2) if total else 0
    loss_rate = round((losses / total) * 100, 2) if total else 0

    best_trade = trades.order_by("-pnl").first()
    worst_trade = trades.order_by("pnl").first()

    streak = _compute_streak(trades.order_by("trade_date", "created_at"))

    return {
        "total_trades": total,
        "wins": wins,
        "losses": losses,
        "breakevens": breakevens,
        "win_rate": win_rate,
        "loss_rate": loss_rate,
        "total_pnl": float(total_pnl),
        "avg_pnl": float(avg_pnl),
        "avg_rr": float(avg_rr),
        "profit_factor": round(profit_factor, 2),
        "best_trade": {"symbol": best_trade.symbol, "pnl": float(best_trade.pnl)} if best_trade else None,
        "worst_trade": {"symbol": worst_trade.symbol, "pnl": float(worst_trade.pnl)} if worst_trade else None,
        "current_streak": streak,
    }


def _compute_streak(trades_ordered):
    streak_type = None
    count = 0
    for trade in reversed(list(trades_ordered)):
        if trade.result == "breakeven":
            continue
        if streak_type is None:
            streak_type = trade.result
            count = 1
        elif trade.result == streak_type:
            count += 1
        else:
            break
    return {"type": streak_type, "count": count}


def compute_calendar_pnl(trades, year, month):
    _, days_in_month = monthrange(year, month)
    daily = defaultdict(lambda: {"pnl": Decimal("0"), "trades": 0, "wins": 0, "losses": 0})

    month_trades = trades.filter(trade_date__year=year, trade_date__month=month)
    for trade in month_trades:
        key = trade.trade_date.isoformat()
        daily[key]["pnl"] += _decimal(trade.pnl)
        daily[key]["trades"] += 1
        if trade.result == "win":
            daily[key]["wins"] += 1
        elif trade.result == "loss":
            daily[key]["losses"] += 1

    calendar = []
    for day in range(1, days_in_month + 1):
        d = date(year, month, day)
        key = d.isoformat()
        data = daily[key]
        calendar.append(
            {
                "date": key,
                "day": day,
                "weekday": d.strftime("%A"),
                "pnl": float(data["pnl"]),
                "trades": data["trades"],
                "wins": data["wins"],
                "losses": data["losses"],
            }
        )

    month_pnl = sum(c["pnl"] for c in calendar)
    return {"year": year, "month": month, "month_pnl": month_pnl, "days": calendar}


def compute_monthly_pnl(trades, year=None):
    qs = trades
    if year:
        qs = qs.filter(trade_date__year=year)

    monthly = (
        qs.annotate(month=TruncMonth("trade_date"))
        .values("month")
        .annotate(
            pnl=Sum("pnl"),
            trades=Count("id"),
            wins=Count("id", filter=Q(result="win")),
            losses=Count("id", filter=Q(result="loss")),
        )
        .order_by("month")
    )

    return [
        {
            "month": item["month"].strftime("%Y-%m"),
            "month_label": item["month"].strftime("%B %Y"),
            "pnl": float(item["pnl"] or 0),
            "trades": item["trades"],
            "wins": item["wins"],
            "losses": item["losses"],
            "win_rate": round((item["wins"] / item["trades"]) * 100, 2) if item["trades"] else 0,
        }
        for item in monthly
    ]


def compute_weekly_pnl(trades, weeks=12):
    cutoff = date.today() - timedelta(weeks=weeks)
    qs = trades.filter(trade_date__gte=cutoff)

    weekly = (
        qs.annotate(week=TruncWeek("trade_date"))
        .values("week")
        .annotate(
            pnl=Sum("pnl"),
            trades=Count("id"),
            wins=Count("id", filter=Q(result="win")),
            losses=Count("id", filter=Q(result="loss")),
        )
        .order_by("week")
    )

    return [
        {
            "week_start": item["week"].strftime("%Y-%m-%d"),
            "pnl": float(item["pnl"] or 0),
            "trades": item["trades"],
            "wins": item["wins"],
            "losses": item["losses"],
        }
        for item in weekly
    ]


def compute_session_breakdown(trades):
    sessions = trades.values("session").annotate(
        pnl=Sum("pnl"),
        trades=Count("id"),
        wins=Count("id", filter=Q(result="win")),
        losses=Count("id", filter=Q(result="loss")),
        avg_rr=Avg("rr_ratio"),
    )

    return [
        {
            "session": item["session"],
            "pnl": float(item["pnl"] or 0),
            "trades": item["trades"],
            "wins": item["wins"],
            "losses": item["losses"],
            "win_rate": round((item["wins"] / item["trades"]) * 100, 2) if item["trades"] else 0,
            "avg_rr": float(item["avg_rr"] or 0),
        }
        for item in sessions
    ]


def compute_strategy_breakdown(trades, user=None):
    from journal.models import Strategy

    if user is None and trades.exists():
        user = trades.first().user
    if user is None:
        return []

    strategies = Strategy.objects.filter(user=user)
    result = []

    for strategy in strategies:
        s_trades = trades.filter(strategy=strategy)
        total = s_trades.count()
        wins = s_trades.filter(result="win").count()
        result.append(
            {
                "strategy_id": strategy.id,
                "strategy_name": strategy.name,
                "color": strategy.color,
                "pnl": float(_decimal(s_trades.aggregate(s=Sum("pnl"))["s"])),
                "trades": total,
                "wins": wins,
                "losses": s_trades.filter(result="loss").count(),
                "win_rate": round((wins / total) * 100, 2) if total else 0,
                "avg_rr": float(_decimal(s_trades.aggregate(a=Avg("rr_ratio"))["a"])),
            }
        )

    no_strategy = trades.filter(strategy__isnull=True)
    if no_strategy.exists():
        total = no_strategy.count()
        wins = no_strategy.filter(result="win").count()
        result.append(
            {
                "strategy_id": None,
                "strategy_name": "No Strategy",
                "color": "#94a3b8",
                "pnl": float(_decimal(no_strategy.aggregate(s=Sum("pnl"))["s"])),
                "trades": total,
                "wins": wins,
                "losses": no_strategy.filter(result="loss").count(),
                "win_rate": round((wins / total) * 100, 2) if total else 0,
                "avg_rr": float(_decimal(no_strategy.aggregate(a=Avg("rr_ratio"))["a"])),
            }
        )

    return sorted(result, key=lambda x: x["pnl"], reverse=True)


def compute_day_of_week_analysis(trades):
    days = (
        trades.annotate(weekday=ExtractWeekDay("trade_date"))
        .values("weekday")
        .annotate(
            pnl=Sum("pnl"),
            trades=Count("id"),
            wins=Count("id", filter=Q(result="win")),
        )
        .order_by("weekday")
    )

    day_names = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return [
        {
            "weekday": item["weekday"],
            "day_name": day_names[item["weekday"]],
            "pnl": float(item["pnl"] or 0),
            "trades": item["trades"],
            "wins": item["wins"],
            "win_rate": round((item["wins"] / item["trades"]) * 100, 2) if item["trades"] else 0,
        }
        for item in days
    ]


def compute_symbol_breakdown(trades, limit=10):
    symbols = (
        trades.values("symbol")
        .annotate(
            pnl=Sum("pnl"),
            trades=Count("id"),
            wins=Count("id", filter=Q(result="win")),
        )
        .order_by("-trades")[:limit]
    )

    return [
        {
            "symbol": item["symbol"],
            "pnl": float(item["pnl"] or 0),
            "trades": item["trades"],
            "wins": item["wins"],
            "win_rate": round((item["wins"] / item["trades"]) * 100, 2) if item["trades"] else 0,
        }
        for item in symbols
    ]


def compute_rr_distribution(trades):
    buckets = {"negative": 0, "0_to_1": 0, "1_to_2": 0, "2_to_3": 0, "3_plus": 0}
    for trade in trades.exclude(rr_ratio__isnull=True):
        rr = float(trade.rr_ratio)
        if rr < 0:
            buckets["negative"] += 1
        elif rr < 1:
            buckets["0_to_1"] += 1
        elif rr < 2:
            buckets["1_to_2"] += 1
        elif rr < 3:
            buckets["2_to_3"] += 1
        else:
            buckets["3_plus"] += 1
    return buckets
