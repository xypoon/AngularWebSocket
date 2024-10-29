# property_websocket_app/routing.py
from django.urls import re_path, path
from .consumers import BidConsumer

websocket_urlpatterns = [
    re_path(r'ws/bid/(?P<property_id>[^/]+)/$', BidConsumer.as_asgi()),
    path('ws/test/', BidConsumer.as_asgi()),
]
