from pymongo import MongoClient
import os

MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)

# Select the database
db = client['mydatabase']

# Select the collection
bookings_collection = db['users']

# Fetch all bookings
bookings = bookings_collection.find()

# Print all bookings
for booking in bookings:
    print(booking)