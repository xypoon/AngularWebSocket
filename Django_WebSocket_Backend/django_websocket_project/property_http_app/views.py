from rest_framework import viewsets
from .models import Property, Bid, Auction
from .serializers import PropertySerializer, BidSerializer, AuctionSerializer, LatencyRecordSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer

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
