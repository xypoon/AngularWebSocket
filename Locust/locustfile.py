import random
from locust import HttpUser, task, between, events, User
import gzip
import json
from io import BytesIO
from locust_plugins.users.socketio import SocketIOUser
from websocket import create_connection, WebSocketConnectionClosedException

# class UserWithCSVLogin(HttpUser):
#     host = "http://localhost:8000"
#     wait_time = between(2, 5)  # Users wait randomly between 2 to 5 sec before next request
#     property_ids = [
#         "9d805b0d6b6b4966bd8da3743ab68d7d"
#         #,"fc9a84ae230041908da9349df7973b67"
#         ]  # Add more property IDs as needed

#     @task(3)  # Polling happens more frequently than bidding
#     def http_poll(self):
#         """Simulate polling for auction status."""
#         property_id = random.choice(self.property_ids)
#         response = self.client.get(f"/api/property/properties/{property_id}")

#         if response.status_code == 200:
#             print(f"[Polling] Auction status: {response.json()}")
#         else:
#             print(f"[Polling] Failed to get auction status: {response.text}")

#     @task(1)  # Bidding happens less frequently
#     def http_bid(self):
#         """Simulate placing a bid via HTTP."""
#         bid_amount = random.randint(1000000, 10000000)
#         property_id = random.choice(self.property_ids)

#         response = self.client.post(
#             "/api/property/bids/",
#             json={"property": str(property_id), "bid_amount": bid_amount}
#         )

#         if response.status_code == 201:
#             print(f"[HTTP Bid] Bid placed for property {property_id}, Amount: {bid_amount}")
#         else:
#             print(f"[HTTP Bid] Failed to place bid: {response.text}")


# ----------------------------------------
# WEBSOCKET USER CLASS FOR REAL-TIME BIDDING
# ----------------------------------------

import gzip
import json
from io import BytesIO
import time
from locust import User, task, between, events
import random
from websocket import create_connection, WebSocketConnectionClosedException

class WebSocketBidder(User):
    host = "wss://localhost:443"  # WebSocket server (Adjust as needed)
    wait_time = between(2, 5)
    property_ids = [
        "9d805b0d6b6b4966bd8da3743ab68d7d"
    ]  # Add more property IDs as needed

    def on_start(self):
        """Connect to WebSocket upon starting."""
        self.property_id = random.choice(self.property_ids)
        self.token = "abc"  # Replace with actual token
        self.ws_url = f"{self.host}/ws/bid/{self.property_id}/?token={self.token}"
        
        try:
            print(f"[WebSocket] Connecting to {self.ws_url}")
            self.ws = create_connection(self.ws_url)
            print(f"[WebSocket] Connected to {self.ws_url}")
        except Exception as e:
            print(f"[WebSocket] Connection Failed: {e}")
            events.request.fire(
                request_type="WebSocket",
                name="Connection",
                response_time=0,
                response_length=0,
                exception=e
            )

    @task(1)
    def send_bid_ws(self):
        """Send a bid via WebSocket."""
        bid_amount = random.randint(1000000, 10000000)
        bid_data = json.dumps({"user_id": "locustUser", "bid_amount": bid_amount})

        start_time = time.time()  # Start time for request

        try:
            # Encode the bid data as bytes before sending
            self.ws.send(bid_data.encode('utf-8'))
            print(f"[WebSocket Bid] Sent: {bid_data}")

            # Wait for a response (to simulate real interaction)
            self.receive_bid_response()

            response_time = time.time() - start_time  # Calculate response time in seconds
            response_length = len(bid_data)  # Length of the bid data

            # Manually fire success event for sending the bid and receiving response
            events.request.fire(
                request_type="WebSocket",
                name="send_bid_ws",
                response_time=int(response_time * 1000),  # Convert to milliseconds
                response_length=response_length,
                exception=None
            )

        except Exception as e:
            print(f"[WebSocket Bid] Failed: {e}")
            response_time = time.time() - start_time
            response_length = 0  # If the request fails, length is 0

            # Manually fire failure event for sending the bid
            events.request.fire(
                request_type="WebSocket",
                name="send_bid_ws",
                response_time=int(response_time * 1000),  # Convert to milliseconds
                response_length=response_length,
                exception=e
            )

    def receive_bid_response(self):
        """Listen for a bid confirmation or response from the WebSocket server."""
        try:
            # Receive the response as bytes
            response = self.ws.recv()

            # Start timing for the response
            start_time = time.time()

            # Decompress the GZIP response using the gzip module
            with gzip.GzipFile(fileobj=BytesIO(response)) as f:
                decompressed_response = f.read()

            # Decode the decompressed response from bytes to a string
            response_str = decompressed_response.decode('utf-8')
            print(f"[WebSocket Response] Received: {response_str}")

            response_time = time.time() - start_time  # Calculate response time for receiving the response
            response_length = len(response_str)  # Length of the decompressed response

            # Check for specific response (you can customize this part)
            if response_str:
                # Manually fire success event when the response is valid
                events.request.fire(
                    request_type="WebSocket",
                    name="receive_bid_response",
                    response_time=int(response_time * 1000),  # Convert to milliseconds
                    response_length=response_length,
                    exception=None
                )
            else:
                raise ValueError("Invalid response from WebSocket server")

        except Exception as e:
            print(f"[WebSocket Response] Failed: {e}")
            response_time = time.time() - start_time
            response_length = 0  # If the response fails, length is 0

            # Manually fire failure event when the response is invalid or an error occurs
            events.request.fire(
                request_type="WebSocket",
                name="receive_bid_response",
                response_time=int(response_time * 1000),  # Convert to milliseconds
                response_length=response_length,
                exception=e
            )

    def on_stop(self):
        """Close WebSocket connection when stopping."""
        if self.ws:
            self.ws.close()
            print(f"[WebSocket] Disconnected from {self.ws_url}")
