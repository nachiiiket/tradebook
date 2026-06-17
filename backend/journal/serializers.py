from rest_framework import serializers

from .image_utils import base64_to_image, compress_image, image_to_base64
from .models import Strategy, Trade, TradeImage


class TradeImageSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = TradeImage
        fields = [
            "id",
            "caption",
            "mime_type",
            "original_filename",
            "file_size",
            "width",
            "height",
            "image_base64",
            "created_at",
        ]
        read_only_fields = fields

    def get_image_base64(self, obj):
        return image_to_base64(bytes(obj.image_data))


class TradeImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()
    caption = serializers.CharField(max_length=255, required=False, allow_blank=True)


class StrategySerializer(serializers.ModelSerializer):
    trade_count = serializers.SerializerMethodField()
    win_rate = serializers.SerializerMethodField()

    class Meta:
        model = Strategy
        fields = [
            "id",
            "name",
            "description",
            "color",
            "rules",
            "is_active",
            "trade_count",
            "win_rate",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "trade_count", "win_rate", "created_at", "updated_at"]

    def get_trade_count(self, obj):
        return obj.trades.count()

    def get_win_rate(self, obj):
        total = obj.trades.count()
        if total == 0:
            return 0
        wins = obj.trades.filter(result="win").count()
        return round((wins / total) * 100, 2)

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class TradeSerializer(serializers.ModelSerializer):
    images = TradeImageSerializer(many=True, read_only=True)
    strategy_name = serializers.CharField(source="strategy.name", read_only=True, default=None)
    strategy_color = serializers.CharField(source="strategy.color", read_only=True, default=None)

    class Meta:
        model = Trade
        fields = [
            "id",
            "strategy",
            "strategy_name",
            "strategy_color",
            "symbol",
            "direction",
            "entry_price",
            "exit_price",
            "stop_loss",
            "take_profit",
            "position_size",
            "result",
            "rr_ratio",
            "planned_rr",
            "pnl",
            "pnl_percent",
            "trade_date",
            "trade_time",
            "session",
            "timeframe",
            "timeframe_confluences",
            "confluences",
            "notes",
            "emotional_state",
            "mistakes",
            "lessons_learned",
            "tags",
            "images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "images", "strategy_name", "strategy_color", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class TradeListSerializer(serializers.ModelSerializer):
    strategy_name = serializers.CharField(source="strategy.name", read_only=True, default=None)
    strategy_color = serializers.CharField(source="strategy.color", read_only=True, default=None)
    image_count = serializers.SerializerMethodField()

    class Meta:
        model = Trade
        fields = [
            "id",
            "strategy",
            "strategy_name",
            "strategy_color",
            "symbol",
            "direction",
            "result",
            "rr_ratio",
            "pnl",
            "trade_date",
            "session",
            "timeframe",
            "image_count",
            "created_at",
        ]

    def get_image_count(self, obj):
        return obj.images.count()
