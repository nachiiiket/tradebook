from datetime import date

from rest_framework.response import Response
from rest_framework.views import APIView

from .engine import (
    compute_calendar_pnl,
    compute_day_of_week_analysis,
    compute_monthly_pnl,
    compute_overview,
    compute_rr_distribution,
    compute_session_breakdown,
    compute_strategy_breakdown,
    compute_symbol_breakdown,
    compute_weekly_pnl,
    get_filtered_trades,
)


class DashboardAnalyticsView(APIView):
    def get(self, request):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        strategy_id = request.query_params.get("strategy")

        trades = get_filtered_trades(request.user, date_from, date_to, strategy_id)

        today = date.today()
        year = int(request.query_params.get("year", today.year))
        month = int(request.query_params.get("month", today.month))

        return Response(
            {
                "overview": compute_overview(trades),
                "calendar": compute_calendar_pnl(trades, year, month),
                "monthly": compute_monthly_pnl(trades, year),
                "weekly": compute_weekly_pnl(trades),
                "sessions": compute_session_breakdown(trades),
                "strategies": compute_strategy_breakdown(trades, user=request.user),
                "day_of_week": compute_day_of_week_analysis(trades),
                "symbols": compute_symbol_breakdown(trades),
                "rr_distribution": compute_rr_distribution(trades),
            }
        )


class CalendarView(APIView):
    def get(self, request):
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month))
        strategy_id = request.query_params.get("strategy")

        trades = get_filtered_trades(request.user, strategy_id=strategy_id)
        return Response(compute_calendar_pnl(trades, year, month))


class MonthlyView(APIView):
    def get(self, request):
        year = request.query_params.get("year")
        strategy_id = request.query_params.get("strategy")
        trades = get_filtered_trades(request.user, strategy_id=strategy_id)
        return Response(compute_monthly_pnl(trades, int(year) if year else None))


class WeeklyView(APIView):
    def get(self, request):
        weeks = int(request.query_params.get("weeks", 12))
        strategy_id = request.query_params.get("strategy")
        trades = get_filtered_trades(request.user, strategy_id=strategy_id)
        return Response(compute_weekly_pnl(trades, weeks))


class SessionView(APIView):
    def get(self, request):
        strategy_id = request.query_params.get("strategy")
        trades = get_filtered_trades(request.user, strategy_id=strategy_id)
        return Response(compute_session_breakdown(trades))


class StrategyAnalyticsView(APIView):
    def get(self, request):
        strategy_id = request.query_params.get("strategy")
        trades = get_filtered_trades(request.user, strategy_id=strategy_id)
        return Response(compute_strategy_breakdown(trades, user=request.user))
