from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Strategy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="strategies")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#6366f1")
    rules = models.TextField(blank=True, help_text="Entry/exit rules for this strategy")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        unique_together = [["user", "name"]]

    def __str__(self):
        return self.name


class Trade(models.Model):
    class Direction(models.TextChoices):
        LONG = "long", "Long"
        SHORT = "short", "Short"

    class Result(models.TextChoices):
        WIN = "win", "Win"
        LOSS = "loss", "Loss"
        BREAKEVEN = "breakeven", "Breakeven"

    class Session(models.TextChoices):
        ASIA = "asia", "Asia"
        LONDON = "london", "London"
        NEW_YORK = "new_york", "New York"
        OVERLAP = "overlap", "Overlap"
        OTHER = "other", "Other"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trades")
    strategy = models.ForeignKey(
        Strategy, on_delete=models.SET_NULL, null=True, blank=True, related_name="trades"
    )
    symbol = models.CharField(max_length=50)
    direction = models.CharField(max_length=10, choices=Direction.choices)
    entry_price = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    exit_price = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    stop_loss = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    take_profit = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    position_size = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    result = models.CharField(max_length=10, choices=Result.choices)
    rr_ratio = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    planned_rr = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    pnl = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    pnl_percent = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    trade_date = models.DateField()
    trade_time = models.TimeField(null=True, blank=True)
    session = models.CharField(max_length=20, choices=Session.choices, default=Session.OTHER)
    timeframe = models.CharField(max_length=20, blank=True, help_text="Primary timeframe e.g. 15m, 1H")
    timeframe_confluences = models.JSONField(default=list, blank=True)
    confluences = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    emotional_state = models.CharField(max_length=100, blank=True)
    mistakes = models.TextField(blank=True)
    lessons_learned = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-trade_date", "-created_at"]

    def __str__(self):
        return f"{self.symbol} {self.direction} ({self.result})"


class TradeImage(models.Model):
    trade = models.ForeignKey(Trade, on_delete=models.CASCADE, related_name="images")
    image_data = models.BinaryField()
    mime_type = models.CharField(max_length=50, default="image/jpeg")
    caption = models.CharField(max_length=255, blank=True)
    original_filename = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Image for {self.trade.symbol}"
