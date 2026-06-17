from django.urls import path

from .views import PortfolioCoachView, TradeAnalysisView

urlpatterns = [
    path("analyze-trade", TradeAnalysisView.as_view(), name="ai-analyze-trade"),
    path("portfolio-coach", PortfolioCoachView.as_view(), name="ai-portfolio-coach"),
]
