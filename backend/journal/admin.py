from django.contrib import admin

from .models import Strategy, Trade, TradeImage


class TradeImageInline(admin.TabularInline):
    model = TradeImage
    extra = 0
    readonly_fields = ("file_size", "width", "height", "created_at")


@admin.register(Strategy)
class StrategyAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "user__email")


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ("symbol", "user", "direction", "result", "pnl", "trade_date", "strategy")
    list_filter = ("result", "direction", "session")
    search_fields = ("symbol", "user__email", "notes")
    inlines = [TradeImageInline]


@admin.register(TradeImage)
class TradeImageAdmin(admin.ModelAdmin):
    list_display = ("trade", "caption", "file_size", "width", "height", "created_at")
    readonly_fields = ("image_data",)
