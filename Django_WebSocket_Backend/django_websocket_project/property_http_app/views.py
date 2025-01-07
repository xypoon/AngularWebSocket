from rest_framework import viewsets
from .models import Property, Bid, Auction, PropertySpecifications
from .serializers import PropertySerializer, BidSerializer, AuctionSerializer, LatencyRecordSerializer, PropertySpecificationsSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.contrib.auth.models import User  # Update if you use a custom User model

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    def get_permissions(self):
        if settings.BYPASS_JWT_AUTH:
            # Allow any user to access the view if bypassing authentication
            return [AllowAny()]
        # Enforce authentication otherwise
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        if settings.BYPASS_JWT_AUTH:
            # Use a dummy user instance
            dummy_user, _ = User.objects.get_or_create(username="dummy_user", defaults={"email": "dummy@example.com"})
            user = dummy_user
        else:
            user = request.user

        data = request.data.copy()
        data['user'] = user.id if user else None

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AuctionViewSet(viewsets.ModelViewSet):
    queryset = Auction.objects.all()
    serializer_class = AuctionSerializer

class LatencyRecordView(APIView):
    def post(self, request):
        print(request.data)
        serializer = LatencyRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PropertySpecificationsViewSet(viewsets.ModelViewSet):
    queryset = PropertySpecifications.objects.all()
    serializer_class = PropertySpecificationsSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        property_id = self.request.query_params.get('id')  # Get 'location' from query params
        if property_id:
            queryset = queryset.filter(property_id=property_id)  # Filter by 'location'
        return queryset
