from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .image_utils import compress_image
from .models import Strategy, Trade, TradeImage
from .serializers import (
    StrategySerializer,
    TradeImageSerializer,
    TradeImageUploadSerializer,
    TradeListSerializer,
    TradeSerializer,
)


class StrategyViewSet(viewsets.ModelViewSet):
    serializer_class = StrategySerializer

    def get_queryset(self):
        return Strategy.objects.filter(user=self.request.user)


class TradeViewSet(viewsets.ModelViewSet):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Trade.objects.filter(user=self.request.user).select_related("strategy").prefetch_related("images")

        strategy = self.request.query_params.get("strategy")
        if strategy:
            qs = qs.filter(strategy_id=strategy)

        result = self.request.query_params.get("result")
        if result:
            qs = qs.filter(result=result)

        session = self.request.query_params.get("session")
        if session:
            qs = qs.filter(session=session)

        symbol = self.request.query_params.get("symbol")
        if symbol:
            qs = qs.filter(symbol__icontains=symbol)

        date_from = self.request.query_params.get("date_from")
        if date_from:
            qs = qs.filter(trade_date__gte=date_from)

        date_to = self.request.query_params.get("date_to")
        if date_to:
            qs = qs.filter(trade_date__lte=date_to)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return TradeListSerializer
        return TradeSerializer

    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request, pk=None):
        trade = self.get_object()
        serializer = TradeImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image_file = serializer.validated_data["image"]
        compressed, width, height, mime_type = compress_image(image_file)

        trade_image = TradeImage.objects.create(
            trade=trade,
            image_data=compressed,
            mime_type=mime_type,
            caption=serializer.validated_data.get("caption", ""),
            original_filename=getattr(image_file, "name", ""),
            file_size=len(compressed),
            width=width,
            height=height,
        )

        return Response(TradeImageSerializer(trade_image).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], url_path="images/(?P<image_id>[^/.]+)")
    def delete_image(self, request, pk=None, image_id=None):
        trade = self.get_object()
        try:
            image = trade.images.get(pk=image_id)
        except TradeImage.DoesNotExist:
            return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"], url_path="images/(?P<image_id>[^/.]+)/raw")
    def raw_image(self, request, pk=None, image_id=None):
        trade = self.get_object()
        try:
            image = trade.images.get(pk=image_id)
        except TradeImage.DoesNotExist:
            return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)

        return HttpResponse(bytes(image.image_data), content_type=image.mime_type)
