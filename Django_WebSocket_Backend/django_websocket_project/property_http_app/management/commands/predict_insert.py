import pandas as pd
import numpy as np
import xgboost as xgb
from decimal import Decimal
from django.utils import timezone
from property_http_app.models import Property, Auction, PropertySpecifications
from pathlib import Path
from django.core.management.base import BaseCommand

# Define test data
# test_data = [
#     'THOMSON V TWO', 'SIN MING ROAD', 'Retail', '300000.0', '53.82', '5.574',
#     'Jul-21', 'Strata', '5.0', '60000.0', 'Freehold', '20', '01 to 05'
# ]

test_data = ['CONCORDE SHOPPING CENTRE','OUTRAM ROAD','Office','688000', '376.74', '1.826', 'Dec-24','Strata', '35.0', '19657', '99 yrs lease commencing from 1980', '03', '01 to 05']


# Define headers
headers = [
    'Project Name', 'Street Name', 'Property Type', 'Transacted Price ($)',
    'Area (SQFT)', 'Unit Price ($ PSF)', 'Sale Date', 'Type of Area',
    'Area (SQM)', 'Unit Price ($ PSM)', 'Tenure', 'Postal District', 'Floor Level'
]

# Convert test_data into DataFrame
test_data = pd.DataFrame([test_data], columns=headers)

# Clean numeric columns
numeric_cols = [
    'Transacted Price ($)', 'Area (SQFT)', 'Unit Price ($ PSF)',
    'Area (SQM)', 'Unit Price ($ PSM)'
]
for col in numeric_cols:
    test_data[col] = test_data[col].str.replace(',', '').astype(float)

# Select relevant features
features = [
    'Area (SQFT)', 'Area (SQM)', 'Property Type', 'Street Name', 'Tenure',
    'Type of Area', 'Postal District', "Floor Level"
]
X_test_data = test_data[features]

# Transform data
X_test_data['Area (SQM)'] = np.log1p(X_test_data['Area (SQM)'])
X_test_data['Area (SQFT)'] = np.log1p(X_test_data['Area (SQFT)'])

# One-hot encode categorical columns
X_test_data_encoded = pd.get_dummies(
    X_test_data,
    columns=['Property Type', 'Street Name', 'Tenure', 'Type of Area', 'Postal District', "Floor Level"]
)

# Align columns with training data headers
file_path = Path("C:/Users/Xiangyuan.poon/Desktop/my_project/my_projects/AngularWebSocket/PropertiesML/content/headers.dat")
with open(file_path, 'r') as f:
    model_headers = f.read().splitlines()

X_test_data_encoded = X_test_data_encoded.reindex(columns=model_headers, fill_value=0)

# Load the XGBoost model
model = xgb.Booster()
model.load_model('C:\\Users\\Xiangyuan.poon\\Desktop\\my_project\\my_projects\\AngularWebSocket\\PropertiesML\\content\\0001.model')

# Predict the price
test_data_dmatrix = xgb.DMatrix(X_test_data_encoded)
predicted_price = model.predict(test_data_dmatrix)
predicted_price = predicted_price[0]

# convert the predicted price back to the original scale
predicted_price = np.expm1(predicted_price)
predicted_price = Decimal(float(predicted_price)).quantize(Decimal('0.01'))


print(f"Predicted price: {predicted_price}, type: {type(predicted_price)}")

# Update records based on the predicted price
property_title = test_data['Project Name'].iloc[0]
property_location = test_data['Street Name'].iloc[0]


class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
    # Check if the property exists
        try:
            property_obj = PropertySpecifications.objects.get(project_name=property_title, street_name=property_location)
            property_obj.prediction = predicted_price
            property_obj.save()
            print(f"Updated property specs for {property_title} with predicted price {predicted_price}.")
        except Property.DoesNotExist:
            print(f"Property specs for {property_title} not found. Mission Failed.")
