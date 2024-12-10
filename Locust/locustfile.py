import csv
import random
from locust import HttpUser, task, between

class UserWithCSVLogin(HttpUser):
    host = "http://localhost:8000"
    wait_time = between(1, 3)
    property = {'44df17459d5c4537b62e1ee37086c267',
            '26684b56f36d47298fb923ac78806e5a'}

    def on_start(self):
        """Called when a simulated user starts."""
        self.username, self.password = self.get_credentials_from_csv()
        self.token = self.authenticate_user(self.username, self.password)

    def get_credentials_from_csv(self):
        """Read credentials from a CSV file."""
        with open('users.csv', mode='r') as file:
            reader = csv.reader(file)
            credentials = list(reader)

        # Randomly select a user from the list
        return random.choice(credentials)

    def authenticate_user(self, username, password):
        """Authenticate user and return token."""
        response = self.client.post("/api/auth/token/", json={
            "username": username,
            "password": password
        })
        if response.status_code == 200:
            print()
            return response.json()["access"]
        else:
            print(f"Login failed for {username}")
            return None

    @task
    def http_bid(self):
        """Simulate placing a bid."""
        if self.token:
            bid_amount = random.randint(1000000, 10000000)
            property_id = random.choice(list(self.property))
            headers = {"Authorization": f"Bearer {self.token}"}

            response = self.client.post(
                f"/api/property/bids/",
                json={"property": str(property_id), "bid_amount": bid_amount},
                headers=headers
            )

            if response.status_code == 201:
                print(f"Bid placed for property {
                      property_id}, Amount: {bid_amount}")
            else:
                print(f"Failed to place bid: {response.text}")
