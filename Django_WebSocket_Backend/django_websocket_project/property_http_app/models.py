import uuid
from django.db import models
from django.contrib.auth.models import User

class Property(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # UUID as primary key
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    starting_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    current_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)


class Bid(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey('Property', on_delete=models.CASCADE, related_name='bids')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_bids')
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    bid_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('property', 'user', 'bid_amount')  # Prevent duplicate bid amounts from the same user on the same property
        ordering = ['-bid_time']  # Sort by most recent bids

    def __str__(self):
        return f'{self.user.username} bid {self.bid_amount} on {self.property.title}'

class Auction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.OneToOneField('Property', on_delete=models.CASCADE, related_name='auction')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    reserve_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Optional if different from starting price

    def __str__(self):
        return f'Auction for {self.property.title} from {self.start_time} to {self.end_time}'

# I need a table to record the latency of http requests, should story RequestType, StartTime, EndTime, Latency
class RequestLatency(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request_type = models.CharField(max_length=255, null=True, blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(auto_now_add=True)
    latency = models.DecimalField(max_digits=15, decimal_places=6, null=True, blank=True)

    def __str__(self):
        return f'{self.request_type} latency: {self.latency}'
    
# Model for Property Specifications Project Name	Street Name	Property Type	Transacted Price ($)	Area (SQFT)	Unit Price ($ PSF)	Sale Date	Type of Area	Area (SQM)	Unit Price ($ PSM)	Tenure	Postal District	Floor Level
class PropertySpecifications(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_id = models.ForeignKey('Property', on_delete=models.CASCADE, related_name='property_specifications')
    project_name = models.CharField(max_length=255, null=True, blank=True)
    street_name = models.CharField(max_length=255, null=True, blank=True)
    property_type = models.CharField(max_length=255, null=True, blank=True)
    transacted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    area_sqft = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unit_price_psf = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sale_date = models.DateTimeField(auto_now_add=True)
    type_of_area = models.CharField(max_length=255, null=True, blank=True)
    area_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unit_price_psm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tenure = models.CharField(max_length=255, null=True, blank=True)
    postal_district = models.CharField(max_length=255, null=True, blank=True)
    floor_level = models.CharField(max_length=255, null=True, blank=True)
    prediction = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f'{self.project_name} at {self.street_name}'