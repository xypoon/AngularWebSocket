import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from property_http_app.models import Property, Bid, Auction  # Adjust the import based on your app name
from decimal import Decimal
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
        # Create some users
        user1 = User.objects.create_user(username='user1', password='password123')
        user2 = User.objects.create_user(username='user2', password='password123')

        # Create properties
        property1 = Property.objects.create(
            title='Luxury Villa',
            description='A beautiful luxury villa with a sea view.',
            location='California',
            starting_price=Decimal('1000000.00'),
            current_price=Decimal('1000000.00'),
            owner=user1,
            is_active=True
        )

        property2 = Property.objects.create(
            title='Cozy Cottage',
            description='A cozy cottage in the woods.',
            location='Oregon',
            starting_price=Decimal('300000.00'),
            current_price=Decimal('300000.00'),
            owner=user2,
            is_active=True
        )

        # Create bids
        Bid.objects.create(property=property1, user=user2, bid_amount=Decimal('1050000.00'))
        Bid.objects.create(property=property1, user=user1, bid_amount=Decimal('1100000.00'))
        Bid.objects.create(property=property2, user=user1, bid_amount=Decimal('320000.00'))

        # Create auctions
        Auction.objects.create(
            property=property1,
            start_time=timezone.now(),
            end_time=timezone.now() + timezone.timedelta(days=7),
            reserve_price=Decimal('950000.00')
        )

        Auction.objects.create(
            property=property2,
            start_time=timezone.now(),
            end_time=timezone.now() + timezone.timedelta(days=5),
            reserve_price=Decimal('280000.00')
        )

        self.stdout.write(self.style.SUCCESS('Database seeded successfully.'))
