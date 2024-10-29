# property_websocket_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async


class BidConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("WebSocket connection attempt")
        from property_http_app.models import Property
        from property_http_app.serializers import BidSerializer
        self.property_id = self.scope['url_route']['kwargs']['property_id']
        self.room_group_name = f'bid_{self.property_id}'

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
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
