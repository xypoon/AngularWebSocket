from rest_framework import serializers
from .models import Property, Bid, Auction

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'  # Include all fields in the serialization

class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = ['id', 'property', 'user', 'bid_amount', 'bid_time']

    def validate_bid_amount(self, value):
        """
        Check that the bid amount is greater than the current price of the property.
        """
        property_instance = self.initial_data.get('property')

        # Retrieve the property instance to check the current price
        try:
            property_instance = Property.objects.get(id=property_instance)
        except Property.DoesNotExist:
            raise serializers.ValidationError("Property does not exist.")

        if value <= property_instance.current_price:
            raise serializers.ValidationError(
                f"The bid amount must be greater than the current price of {property_instance.current_price}."
            )
        
        return value  # Return the valid bid amount

    def create(self, validated_data):
        # Extract the property from the validated data
        property_instance = validated_data['property']
        
        # Update the current price of the property
        property_instance.current_price = validated_data['bid_amount']
        property_instance.save()  # Save the updated property instance
        
        # Create and return the new Bid instance
        bid = Bid.objects.create(**validated_data)
        return bid

class AuctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = '__all__'
