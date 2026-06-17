from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import StrategyViewSet, TradeViewSet

router = DefaultRouter()
router.register("strategies", StrategyViewSet, basename="strategy")
router.register("trades", TradeViewSet, basename="trade")

urlpatterns = [
    path("", include(router.urls)),
]
