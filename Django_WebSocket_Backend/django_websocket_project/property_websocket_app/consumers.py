import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs
import jwt
from django.conf import settings
import logging

# Configure logging for debugging
logger = logging.getLogger(__name__)

class BidConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from django.contrib.auth.models import User
        logger.info("WebSocket connection attempt")

        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token is None:
            logger.warning("No token provided, rejecting connection")
            await self.close(code=4003)
            return

        logger.info(f"Token received: {token}")

        try:
            # Decode JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            logger.info(f"Token payload: {payload}")

            # Fetch user by ID in payload
            user = await sync_to_async(User.objects.get)(id=payload['user_id'])
            self.scope['user'] = user
            logger.info(f"User authenticated: {user.username}")

            # Set property_id and room_group_name
            self.property_id = self.scope['url_route']['kwargs']['property_id']
            self.room_group_name = f'bid_{self.property_id}'

            # Join room group and accept connection
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

        except jwt.ExpiredSignatureError:
            logger.error("Token expired")
            await self.close(code=4001)
        except jwt.InvalidTokenError:
            logger.error("Invalid token")
            await self.close(code=4002)
        except User.DoesNotExist:
            logger.error("User does not exist")
            await self.close(code=4004)

    async def disconnect(self, close_code):
         # Check if room_group_name was set
        if hasattr(self, 'room_group_name'):
            # Leave room group
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        from property_http_app.models import Property
        from property_http_app.serializers import BidSerializer

        text_data_json = json.loads(text_data)
        bid_amount = text_data_json.get('bid_amount')
        user_id = text_data_json.get('user_id')

        # Create the bid using the serializer
        bid_data = {
            'property': self.property_id,
            'user': user_id,
            'bid_amount': bid_amount
        }

        # Validate and save the bid
        bid_serializer = BidSerializer(data=bid_data)
        
        # Use sync_to_async for validation and save
        if await sync_to_async(bid_serializer.is_valid)():
            bid = await sync_to_async(bid_serializer.save)()  # Save bid asynchronously

            # Update the property's current price
            property_instance = await sync_to_async(Property.objects.get)(id=self.property_id)
            property_instance.current_price = bid_amount
            await sync_to_async(property_instance.save)()  # Save the property asynchronously

            # Send updated bids to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_bid',
                    'bid_amount': bid_amount,
                }
            )
        else:
            # Handle validation errors (optional)
            await self.send(text_data=json.dumps({
                'error': bid_serializer.errors,
            }))

    async def send_bid(self, event):
        bid_amount = event['bid_amount']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'bid_amount': bid_amount,
        }))
