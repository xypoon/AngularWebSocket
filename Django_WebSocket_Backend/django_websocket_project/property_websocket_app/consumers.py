from datetime import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs
import jwt
from django.conf import settings
import logging
import gzip
import base64

# Configure logging for debugging
logger = logging.getLogger(__name__)


class BidConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from property_http_app.models import User, Property
        logger.debug("Attempting to connect WebSocket")
        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        try:
            if settings.BYPASS_JWT_AUTH or token is None:
                # Bypass authentication and use a dummy user
                logger.debug("Bypassing authentication - Using dummy user")
                dummy_user, _ = await sync_to_async(User.objects.get_or_create)(
                    username="dummy_user", defaults={"email": "dummy@example.com"}
                )
                self.scope['user'] = dummy_user
            else:
                # Authenticate with the provided token
                logger.debug(f"Token received: {token}")
                payload = jwt.decode(
                    token, settings.SECRET_KEY, algorithms=['HS256'])
                logger.debug(f"Token payload: {payload}")
                user = await sync_to_async(User.objects.get)(id=payload['user_id'])
                self.scope['user'] = user
                logger.debug(f"User authenticated: {user.username}")

            self.property_id = self.scope['url_route']['kwargs']['property_id']
            self.room_group_name = f'bid_{self.property_id}'
            logger.debug(f"Joining room group: {self.room_group_name}")

            # Add the user to the room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            logger.debug("WebSocket connection accepted")

            # Send initial property data
            property = await sync_to_async(Property.objects.get)(id=self.property_id)
            initial_data = {
                'type': 'init',
                'property': {
                    'id': str(property.id),
                    'title': property.title,
                    'description': property.description,
                    'location': property.location,
                    'starting_price': str(property.starting_price),
                    'current_price': str(property.current_price),
                }
            }
            # Convert the data to JSON and compress using gzip
            json_data = json.dumps(initial_data)
            compressed_data = gzip.compress(json_data.encode('utf-8'))

            # # Base64 encode the compressed data to send as a string
            # base64_compressed_data = base64.b64encode(compressed_data).decode('utf-8')

            # reformat the json
            # base64_compressed_data = {
            #     'data': compressed_data
            # }

            # Send the base64-encoded compressed data over WebSocket
            # await self.send(text_data=json.dumps(base64_compressed_data))
            await self.send(bytes_data=compressed_data)
            logger.debug("Initial property details sent")

        except jwt.ExpiredSignatureError:
            logger.error("Token expired")
            await self.close(code=4001)
        except jwt.InvalidTokenError:
            logger.error("Invalid token")
            await self.close(code=4002)
        except User.DoesNotExist:
            logger.error("User does not exist")
            await self.close(code=4004)
        except Property.DoesNotExist:
            logger.error(f"Property with id {self.property_id} does not exist")
            await self.close(code=4005)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            await self.close(code=4006)

    async def disconnect(self, close_code):
        # Check if room_group_name was set
        if hasattr(self, 'room_group_name'):
            # Leave room group
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        from property_http_app.models import Property
        from property_http_app.serializers import BidSerializer

        server_ts = datetime.now().isoformat()
        text_data_json = json.loads(text_data)
        bid_amount = text_data_json.get('bid_amount')
        # user_id = text_data_json.get('user_id')
        user = self.scope["user"]
        print(f"Received bid: {bid_amount} from user {user}")

        # Create the bid using the serializer
        bid_data = {
            'property': self.property_id,
            'bid_amount': bid_amount
        }

        # Validate and save the bid
        bid_serializer = BidSerializer(data=bid_data, context={'user': user})

        # Use sync_to_async for validation and save
        if await sync_to_async(bid_serializer.is_valid)():
            # Save bid asynchronously
            bid = await sync_to_async(bid_serializer.save)()

            # Update the property's current price
            property_instance = await sync_to_async(Property.objects.get)(id=self.property_id)
            property_instance.current_price = bid_amount
            # Save the property asynchronously
            await sync_to_async(property_instance.save)()

            # Record the server acknowledgment timestamp
            server_ack_ts = datetime.now().isoformat()

            # Send updated bids to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_bid',
                    'bid_amount': bid_amount,
                    'server_ts': server_ts,
                    'server_ack_ts': server_ack_ts,
                }
            )
        else:
            # Handle validation errors (optional)
            await self.send(text_data=json.dumps({
                'error': bid_serializer.errors,
            }))

    async def send_bid(self, event):
        bid_amount = event['bid_amount']
        server_ts = event['server_ts']
        server_ack_ts = event['server_ack_ts']

        data = {
            'type': 'send_bid',
            'bid_amount': bid_amount,
            'server_ts': server_ts,
            'server_ack_ts': server_ack_ts,
        }
        json_data = json.dumps(data)
        compressed_data = gzip.compress(json_data.encode('utf-8'))

        # Base64 encode the compressed data to send as a string
        # base64_compressed_data = base64.b64encode(compressed_data).decode('utf-8')

        # reformat the json
        # data = {
        #     'data': compressed_data
        # }

        # Send the full message to WebSocket
        # await self.send(text_data=json.dumps(data))
        await self.send(bytes_data=compressed_data)