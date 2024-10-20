from django.urls import path
from .views import login_view  # Import the login view

urlpatterns = [
    path('login/', login_view, name='login'),  # Define the URL for the login API
]