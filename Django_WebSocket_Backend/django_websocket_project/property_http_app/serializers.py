from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from .models import Property, Bid, Auction, RequestLatency, PropertySpecifications
from django.conf import settings
from django.contrib.auth.models import User  # Update if you use a custom User model

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'  # Include all fields in the serialization

class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = ['id', 'property', 'user', 'bid_amount', 'bid_time']
        read_only_fields = ['user', 'bid_time']

    def validate(self, data):
        property_instance = data.get('property')

        if not isinstance(property_instance, Property):
            try:
                property_instance = Property.objects.get(id=property_instance.id)
            except Property.DoesNotExist:
                raise ValidationError("The specified property does not exist.")

        # Check if the bid amount is greater than the current price
        # if data['bid_amount'] <= property_instance.current_price:
        #     raise ValidationError(
        #         f"The bid amount {data['bid_amount']} must be greater than the current price of {property_instance.current_price}."
        #     )

        data['property'] = property_instance
        return data

    def create(self, validated_data):
        # toggle bypass jwt authentication
        if settings.BYPASS_JWT_AUTH:
            # Use a dummy user instance
            dummy_user, _ = User.objects.get_or_create(username="dummy_user", defaults={"email": "dummy@example.com"})
            user = dummy_user

        else:
            # Check for user in the context, fallback for WebSocket handling
            user = self.context.get('user')  # For WebSocket
            if not user and 'request' in self.context:
                request = self.context['request']
                user = request.user if request and request.user.is_authenticated else None

            if not user or not user.is_authenticated:
                raise serializers.ValidationError("User must be authenticated to place a bid.")
    
        property_instance = validated_data['property']

        # Update property's current price
        property_instance.current_price = validated_data['bid_amount']
        property_instance.save()

        # Save the bid
        return Bid.objects.create(user=user, **validated_data)


    
class AuctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = '__all__'

class LatencyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestLatency
        fields = '__all__'

class PropertySpecificationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertySpecifications
        fields = '__all__'