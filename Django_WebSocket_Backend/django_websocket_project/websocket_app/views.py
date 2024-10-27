from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from .serialisers import CustomTokenObtainPairSerializer  # Import the serializer

# @api_view(['POST'])
# def login_view(request):
#     serializer = LoginSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.validated_data  # This will be the authenticated user
#         # Here you can generate a token or handle login success
#         return Response({'token': 'your-dummy-token-here'}, status=status.HTTP_200_OK)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Hard-coded username and password // NO longer needed as we are using the serializer
# HARD_CODED_USERNAME = 'testuser'
# HARD_CODED_PASSWORD = 'testpassword'

# @api_view(['POST'])
# def login_view(request):
#     username = request.data.get('username')
#     password = request.data.get('password')

#     # Check against hard-coded credentials
#     if username == HARD_CODED_USERNAME and password == HARD_CODED_PASSWORD:
#         return Response({'token': 'your-dummy-token-here'}, status=status.HTTP_200_OK)
#     else:
#         return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
# JWT Token view
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer