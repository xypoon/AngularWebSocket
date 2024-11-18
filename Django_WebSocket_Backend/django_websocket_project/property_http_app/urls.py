from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, BidViewSet, AuctionViewSet, LatencyRecordView

router = DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'bids', BidViewSet)
router.register(r'auctions', AuctionViewSet)

urlpatterns = [
    path('', include(router.urls)),  # Include the router URLs
    path('latency', LatencyRecordView.as_view(), name='latency'),
]
