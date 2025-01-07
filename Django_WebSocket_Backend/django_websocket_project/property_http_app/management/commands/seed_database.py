import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from property_http_app.models import Property, Bid, Auction, PropertySpecifications  # Adjust the import based on your app name
from decimal import Decimal
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
        # Create some users
        user1 = User.objects.create_user(username='user', password='password')
        user1 = User.objects.create_user(username='user1', password='password123')
        user2 = User.objects.create_user(username='user2', password='password456')
        user2 = User.objects.create_user(username='user3', password='password789')

        # Create properties
        property1 = Property.objects.create(
            title='CONCORDE SHOPPING CENTRE',
            description='Spacious Office Space with Nice Window View',
            location='OUTRAM ROAD',
            starting_price=Decimal('300000.00'),
            current_price=Decimal('300000.00'),
            is_active=True
        )

        property2 = Property.objects.create(
            title='THOMSON V TWO',
            description='Big Retail Space with High Ceiling',
            location='SIN MING ROAD',
            starting_price=Decimal('600000.00'),
            current_price=Decimal('600000.00'),
            is_active=True
        )

        # Create bids
        # Bid.objects.create(property=property1, user=user2, bid_amount=Decimal('1050000.00'))
        # Bid.objects.create(property=property1, user=user1, bid_amount=Decimal('1100000.00'))
        # Bid.objects.create(property=property2, user=user1, bid_amount=Decimal('320000.00'))

        # Create auctions
        Auction.objects.create(
            property=property1,
            start_time=timezone.now(),
            end_time=timezone.now() + timezone.timedelta(days=7),
            reserve_price=Decimal('300000.00')
        )

        Auction.objects.create(
            property=property2,
            start_time=timezone.now(),
            end_time=timezone.now() + timezone.timedelta(days=5),
            reserve_price=Decimal('600000.00')
        )

        # using these specs for testing
        PropertySpecifications.objects.create(
            project_name='CONCORDE SHOPPING CENTRE',
            property_id=property1,
            street_name='OUTRAM ROAD',
            property_type='Office',
            transacted_price=Decimal('688000.00'),
            area_sqft=Decimal('376.74'),
            unit_price_psf=Decimal('1.826'),
            sale_date=timezone.now(),
            type_of_area='Strata',
            area_sqm=Decimal('35.0'),
            unit_price_psm=Decimal('19657.00'),
            tenure='99 yrs lease commencing from 1980',
            postal_district='03',
            floor_level='01 to 05'

        )

        PropertySpecifications.objects.create(
            project_name='THOMSON V TWO',
            property_id=property2,
            street_name='SIN MING ROAD',
            property_type='Retail',
            transacted_price=Decimal('300000.00'),
            area_sqft=Decimal('53.82'),
            unit_price_psf=Decimal('5.574'),
            sale_date=timezone.now(),
            type_of_area='Strata',
            area_sqm=Decimal('5.0'),
            unit_price_psm=Decimal('60000.00'),
            tenure='Freehold',
            postal_district='20',
            floor_level='01 to 05'
        )

        # PropertySpecifications.objects.create(
        #     project_name='REGENCY SUITES',
        #     street_name='KIM TIAN ROAD',
        #     property_type='Office',
        #     transacted_price=Decimal('2120000.00'),
        #     area_sqft=Decimal('1033.34'),
        #     unit_price_psf=Decimal('2.052'),
        #     sale_date=timezone.now(),
        #     type_of_area='Strata',
        #     area_sqm=Decimal('96'),
        #     unit_price_psm=Decimal('22083.00'),
        #     tenure='Freehold',
        #     postal_district='03',
        #     floor_level='06 to 10'
        # )


        self.stdout.write(self.style.SUCCESS('Database seeded successfully.'))
