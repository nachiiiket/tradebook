from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_view(_request):
    return JsonResponse({"status": "ok", "service": "tradebook-api"})


urlpatterns = [
    path("api/auth/", include("accounts.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/ai/", include("ai_agent.urls")),
    path("api/", include("journal.urls")),
    path("api/health", health_view),
    path("admin/", admin.site.urls),
]
