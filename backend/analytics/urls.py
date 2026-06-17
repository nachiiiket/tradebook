from django.urls import path

from .views import (
    CalendarView,
    DashboardAnalyticsView,
    MonthlyView,
    SessionView,
    StrategyAnalyticsView,
    WeeklyView,
)

urlpatterns = [
    path("dashboard", DashboardAnalyticsView.as_view(), name="analytics-dashboard"),
    path("calendar", CalendarView.as_view(), name="analytics-calendar"),
    path("monthly", MonthlyView.as_view(), name="analytics-monthly"),
    path("weekly", WeeklyView.as_view(), name="analytics-weekly"),
    path("sessions", SessionView.as_view(), name="analytics-sessions"),
    path("strategies", StrategyAnalyticsView.as_view(), name="analytics-strategies"),
]
