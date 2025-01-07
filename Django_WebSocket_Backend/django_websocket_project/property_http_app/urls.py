from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, BidViewSet, AuctionViewSet, LatencyRecordView, PropertySpecificationsViewSet

router = DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'bids', BidViewSet)
router.register(r'auctions', AuctionViewSet)
router.register(r'property_specifications', PropertySpecificationsViewSet)


urlpatterns = [
    path('', include(router.urls)),  # Include the router URLs
    path('latency', LatencyRecordView.as_view(), name='latency'),
]
