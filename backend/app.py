import os
import logging
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from pymongo import MongoClient
import bcrypt
from flask_cors import CORS
import re
from bson import ObjectId
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from urllib.parse import unquote

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["mydatabase"]  # Replace with your actual database name
users_collection = db["users"]
products_collection = db["products"]  # New collection for storing products
cart_collection = db["cart"]
bookings_collection = db["bookings"]



def _build_cors_preflight_response():
    response = jsonify({'status': 'success'})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    return response


def update_expired_bookings():
    try:
        # Calculate the cutoff time (24 hours ago)
        cutoff_time = datetime.utcnow() - timedelta(hours=24)

        # Find bookings with status 'pending' and booking_date_time older than 24 hours
        expired_bookings = bookings_collection.update_many(
            {
                'collection_status': 'pending',
                'booking_date_time': {'$lt': cutoff_time.strftime("%Y-%m-%dT%H:%M:%S")}
            },
            {'$set': {'collection_status': 'expired'}}
        )

        if expired_bookings.modified_count > 0:
            logger.info(f"Updated {expired_bookings.modified_count} bookings to 'expired' status.")
        else:
            logger.info("No bookings to update to 'expired' status.")
    except Exception as e:
        logger.error(f"Error updating expired bookings: {e}")

# ======================= USER AUTHENTICATION ========================== #

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    logger.info("Received registration data: %s", data)

    # Validate data
    errors = {}
    if not data.get('name'):
        errors['name'] = 'Name is required'
    if not data.get('email'):
        errors['email'] = 'Email is required'
    elif not re.match(r'\S+@\S+\.\S+', data['email']):
        errors['email'] = 'Please enter a valid email'
    if data.get('phone') and not re.match(r'^\d{10}$', data['phone']):
        errors['phone'] = 'Please enter a valid 10-digit phone number'
    if not data.get('password'):
        errors['password'] = 'Password is required'
    elif len(data['password']) < 8:
        errors['password'] = 'Password must be at least 8 characters'

    if errors:
        logger.error("Validation errors: %s", errors)
        return jsonify({'errors': errors}), 400

    # Hash the password
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    # Store data in MongoDB
    user = {
        'name': data['name'],
        'email': data['email'],
        'phone': data.get('phone'),
        'address': data.get('address'),
        'pincode': data.get('pincode'),
        'password': hashed_password,
        'uniqueId': data.get('uniqueId'),
        'role': data['role']
    }
    users_collection.insert_one(user)
    logger.info("User registered successfully: %s", user)

    return jsonify({'message': 'User registered successfully', 'id': str(user['_id'])}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    logger.info("Received login data: %s", data)

    # Validate data
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # Find user in MongoDB
    user = users_collection.find_one({'email': data['email']})
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    # Check password
    if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Return user data
    user_data = {
        'id': str(user['_id']),
        'email': user['email'],
        'name': user['name'],
        'phone': user['phone'],
        'address': user['address'],
        'pincode': user['pincode'],
        'uniqueId': user['uniqueId'],
        'role': user.get('role', 'user'),
        'sellerId': user.get('sellerId')
    }
    logger.info("User logged in successfully: %s", user_data)
    return jsonify(user_data), 200

@app.route('/update-profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    logger.info("Received update profile data: %s", data)  # Log the received data
    user_id = data.get('userId')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    # try:
    #     user_id = ObjectId(user_id)  # Convert string to MongoDB ObjectId
    # except:
    #     return jsonify({'error': 'Invalid user ID format'}), 400

    # Fetch existing user data to compare changes
    _id = ObjectId(user_id)
    existing_user = users_collection.find_one({"_id": _id}, {"password": 0})
    if not existing_user:
        return jsonify({'error': 'User not found'}), 404

    # Build an update dictionary with only changed fields
    updated_data = {}
    for field in ["name", "email", "phone", "address", "pincode"]:
        if field in data and data[field] and data[field] != existing_user.get(field):
            updated_data[field] = data[field]

    if not updated_data:  # No changes detected
        logger.info("No updates were made for user ID: %s", user_id)
        return jsonify({'error': 'No updates were made'}), 400

    # Update the user in MongoDB
    result = users_collection.update_one({"_id": _id}, {"$set": updated_data})

    if result.modified_count == 0:
        return jsonify({'error': 'Failed to update profile'}), 400

    # Fetch the updated user data
    updated_user = users_collection.find_one({"_id": _id}, {"password": 0})  # Exclude password
    updated_user['id'] = str(updated_user.pop('_id'))  # Rename _id to id

    logger.info("Profile updated successfully for user data: %s", updated_user)
    return jsonify({'message': 'Profile updated successfully', 'user': updated_user}), 200

# ========================== PRODUCT MANAGEMENT ========================== #

@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    logger.info("Received product data: %s", data)

    # Validate input
    if not data.get('name') or not data.get('price_registered') or not data.get('price_unregistered') or not data.get('category'):
        return jsonify({'error': 'Product name, registered price, unregistered price, and category are required'}), 400  # Corrected indentation

    product = {
        "name": data['name'],
        "description": data.get('description', ''),
        "price_registered": float(data['price_registered']),
        "price_unregistered": float(data['price_unregistered']),
        "stock": int(data.get('stock', 0)),
        "category": data['category'],
        "krishiBhavan": data.get('krishiBhavan', ''),
        "imageUrl": data.get('imageUrl', '')
    }

    result = products_collection.insert_one(product)
    logger.info("Product added: %s", product)

    return jsonify({'message': 'Product added successfully', 'id': str(result.inserted_id)}), 201


from urllib.parse import unquote  # Import unquote to decode URL-encoded strings
import logging
from urllib.parse import unquote

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/products', methods=['GET'])
def get_products():
    user_id = request.args.get('user_id')  # Get user ID from query parameters
    krishi_bhavan = request.args.get('krishiBhavan')

    if krishi_bhavan:
        krishi_bhavan = unquote(krishi_bhavan)  # Decode URL-encoded spaces
        logger.info(f"Received krishiBhavan parameter: {krishi_bhavan}")
    else:
        logger.info("No krishiBhavan parameter provided. Fetching all products.")

    # Fetch user details to determine sellerId
    user = users_collection.find_one({'_id': ObjectId(user_id)}) if user_id else None
    seller_id = user.get('sellerId') if user else None

    # Build the query
    query = {}
    if krishi_bhavan:
        query['krishiBhavan'] = krishi_bhavan  # Filter by krishiBhavan if provided
    logger.info(f"Query to be executed: {query}")

    # Fetch products from the database based on the query
    products = list(products_collection.find(query))
    logger.info(f"Number of products fetched: {len(products)}")

    products_list = []
    for product in products:
        # Determine the price to display based on sellerId and krishiBhavan
        if seller_id == 'SL0001001' and product.get('krishiBhavan') == 'krishi bhavan 1':
            price = product.get('price_registered', 0)
        elif seller_id == 'SL0001002' and product.get('krishiBhavan') == 'krishibhavan 2':
            price = product.get('price_registered', 0)
        else:
            price = product.get('price_unregistered', 0)

        products_list.append({
            'id': str(product['_id']),
            'name': product['name'],
            'description': product.get('description', ''),
            'price': price,  # Display the determined price
            'price_registered': product.get('price_registered', 0),  # Include registered price
            'price_unregistered': product.get('price_unregistered', 0),
            'stock': product.get('stock', 0),
            'category': product['category'],
            'krishiBhavan': product.get('krishiBhavan', ''),
            'imageUrl': product.get('imageUrl', '')
        })

    logger.info("Successfully fetched products and prepared the response.")
    return jsonify(products_list), 200

@app.route('/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    logger.info(f"Updating product {product_id} with data: {data}")

    if not ObjectId.is_valid(product_id):
        return jsonify({'error': 'Invalid product ID'}), 400

    update_data = {key: value for key, value in data.items() if value is not None}

    result = products_collection.update_one({'_id': ObjectId(product_id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Product not found'}), 404

    return jsonify({'message': 'Product updated successfully'}), 200


@app.route('/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    logger.info(f"Deleting product with ID: {product_id}")

    if not ObjectId.is_valid(product_id):
        return jsonify({'error': 'Invalid product ID'}), 400

    result = products_collection.delete_one({'_id': ObjectId(product_id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Product not found'}), 404

    return jsonify({'message': 'Product deleted successfully'}), 200

# ===================================================================== #
# Configure Gemini API
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel("gemini-2.0-flash")

# Cache for storing product details
cache = {}

# Product data (same as frontend)
products = [
    {"id": 1, "name": "Moovandan", "type": "Mango", "image": "https://www.fortheloveofnature.in/cdn/shop/products/Mangiferaindica-Moovandan_Mango_1_823x.jpg?v=1640246605", "description": "A Popular Early-Bearing Variety"},
    {"id": 2, "name": "Kilichundan Mango", "type": "Mango", "image": "https://www.greensofkerala.com/wp-content/uploads/2021/04/kilichundan-manga-2.gif", "description": "The Parrot-Beak Mango with a Tangy-Sweet Flavor"},
    {"id": 3, "name": "Neelum", "type": "Mango", "image": "https://tropicaltreeguide.com/wp-content/uploads/2023/04/Mango_Neelum_Fruit_IG_Botanical_Diversity_3-1024x1014.jpg", "description": "A High-Yielding and Disease-Resistant Variety of Mango"},
    {"id": 4, "name": "Alphonso", "type": "Mango", "image": "https://seed2plant.in/cdn/shop/files/AlphonsoMangoGraftedLivePlant.jpg?v=1689071379&width=1100", "description": "The King of Mangoes"},
    {"id": 5, "name": "Cowpea", "type": "Bean", "image": "https://seed2plant.in/cdn/shop/products/cowpeaseeds.jpg?v=1603962956&width=1780", "description": "Drought-tolerant legume"},
    {"id": 6, "name": "Yardlong Bean", "type": "Bean", "image": "https://m.media-amazon.com/images/I/61GCtRXQUNL.jpg", "description": "Locally known as Achinga Payar is a popular vegetable characterized by its slender, elongated pods"},
    {"id": 7, "name": "Winged Bean", "type": "Bean", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyx8m47r2uid8bsBjhInQs9nlpFmuBXKfT6w&s", "description": "Locally known as Kaippayar, this nutrient-rich bean is characterized by its winged edges and high protein content."},
    {"id": 8, "name": "Sword Bean", "type": "Bean", "image": "https://goldenhillsfarm.in/media/product_images/sward-beans.jpg", "description": "Known as Valpayar, this variety has thick, broad pods and is often used in traditional Kerala dishes."},
    {"id": 9, "name": "Nendran", "type": "Banana", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqNbKet5tI1Uh_bAZgjTNB0RPSInNnPKkN8A&s", "description": "A prominent variety in Kerala, Nendran bananas are large, firm, and slightly sweet"},
    {"id": 10, "name": "Chengalikodan Nendran",  "type": "Banana", "image": "https://www.gikerala.in/images/products/Chengalikkodan_Nendran-Banana-4.webp", "description": "Originating from the Chengazhikodu village in Thrissur District, this variety is renowned for its unique taste and vibrant color."},
    {"id": 11, "name": "Matti Pazham", "type": "Banana", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9r6XZqXhdCNS3xpTSTkoVXHbo38K_Q1K__g&s", "description": "Known for its fragrant aroma and honey-like taste, this small-sized banana is cherished for its unique flavor profile."},
    {"id": 12, "name": "Poovan", "type": "Banana", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Kerala_Banana_-_Poovan_Pazham-1.jpg/1200px-Kerala_Banana_-_Poovan_Pazham-1.jpg?20110717070644", "description": "A popular dessert banana, Poovan is medium-sized with a thin skin and sweet flesh."}
]

@app.route('/get_product_details', methods=['GET'])
def get_product_details():
    try:
        product_id = request.args.get('id', type=int)  # Convert ID to integer
        product = next((p for p in products if p["id"] == product_id), None)

        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Check cache to prevent multiple responses
        if product_id in cache:
            return jsonify(cache[product_id])

        # Generate AI description (only if not cached)
        prompt = f"""
                Provide a structured description of {product['name']} ({product['type']}) including:
                - **Origin and History**
                - **Climate and Growth Conditions**
                - **Nutritional Value & Benefits**
                - **Uses in Cooking & Daily Life**
                Keep it clear, detailed, and informative.
                """
        response = gemini_model.generate_content(prompt)

        product_data = {
            "id": product["id"],
            "name": product["name"],
            "image": product["image"],
            "description": product["description"],
            "detailed_info": response.text  # AI-generated text
        }

        # Store response in cache
        cache[product_id] = product_data

        return jsonify(product_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    if not user_id or not product_id or quantity is None:
        logger.error("Failed to add to cart: User ID, Product ID, and quantity are required")
        return jsonify({'error': 'User ID, Product ID, and quantity are required'}), 400

    cart_item = {
        'user_id': ObjectId(user_id),
        'product_id': ObjectId(product_id),
        'quantity': quantity
    }

    db.cart.insert_one(cart_item)
    logger.info("Item added to cart: %s", cart_item)
    return jsonify({'message': 'Item added to cart'}), 201

@app.route('/cart', methods=['PUT'])
def update_cart():
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    if not user_id or not product_id or quantity is None:
        logger.error("Failed to update cart: User ID, Product ID, and quantity are required")
        return jsonify({'error': 'User ID, Product ID, and quantity are required'}), 400

    result = db.cart.update_one(
        {'user_id': ObjectId(user_id), 'product_id': ObjectId(product_id)},
        {'$set': {'quantity': quantity}}
    )

    if result.matched_count == 0:
        logger.error("Failed to update cart: Cart item not found for user_id %s and product_id %s", user_id, product_id)
        return jsonify({'error': 'Cart item not found'}), 404

    logger.info("Cart item updated: user_id %s, product_id %s, quantity %s", user_id, product_id, quantity)
    return jsonify({'message': 'Cart item updated'}), 200

@app.route('/cart', methods=['DELETE'])
def remove_from_cart():
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')

    if not user_id or not product_id:
        logger.error("Failed to remove from cart: User ID and Product ID are required")
        return jsonify({'error': 'User ID and Product ID are required'}), 400

    result = db.cart.delete_one({'user_id': ObjectId(user_id), 'product_id': ObjectId(product_id)})

    if result.deleted_count == 0:
        logger.error("Failed to remove from cart: Cart item not found for user_id %s and product_id %s", user_id, product_id)
        return jsonify({'error': 'Cart item not found'}), 404

    logger.info("Cart item removed: user_id %s, product_id %s", user_id, product_id)
    return jsonify({'message': 'Cart item removed'}), 200

@app.route('/cart/clear', methods=['DELETE'])
def clear_cart():
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        logger.error("Failed to clear cart: User ID is required")
        return jsonify({'error': 'User ID is required'}), 400

    result = db.cart.delete_many({'user_id': ObjectId(user_id)})

    if result.deleted_count == 0:
        logger.error("Failed to clear cart: No items found in cart for user_id %s", user_id)
        return jsonify({'error': 'No items found in cart for this user'}), 404

    logger.info("Cart cleared for user_id %s", user_id)
    return jsonify({'message': 'Cart cleared'}), 200
@app.route('/bookings', methods=['POST'])
def pre_book_now():
    data = request.get_json()
    logger.info("Received booking data: %s", data)  # Log the received data

    user_id = data.get('user_id')
    product_name = data.get('product_name')
    product_id = data.get('product_id')
    quantity = data.get('quantity')
    krishiBhavan = data.get('krishiBhavan')
    booking_date_time = data.get('booking_date_time')
    total_amount = data.get('total_amount')
    collection_status = data.get('collection_status', 'pending')

    missing_fields = {}
    if not user_id:
        missing_fields['user_id'] = user_id
    if not product_name:
        missing_fields['product_name'] = product_name
    if not product_id:
        missing_fields['product_id'] = product_id
    if quantity is None:
        missing_fields['quantity'] = quantity
    if not krishiBhavan:
        missing_fields['krishiBhavan'] = krishiBhavan
    if not booking_date_time:
        missing_fields['booking_date_time'] = booking_date_time
    if total_amount is None:
        missing_fields['total_amount'] = total_amount

    if missing_fields:
        logger.error("Failed to pre-book: All fields are required. Missing fields: %s", missing_fields)
        return jsonify({'error': 'All fields are required', 'missing_fields': missing_fields}), 400

    booking = {
        'user_id': user_id,
        'product_name': product_name,
        'product_id': product_id,
        'quantity': quantity,
        'krishiBhavan': krishiBhavan,
        'booking_date_time': booking_date_time,
        'total_amount': total_amount,
        'collection_status': collection_status
    }

    db.bookings.insert_one(booking)
    logger.info("Pre-booking successful: %s", booking)
    return jsonify({'message': 'Pre-booking successful', 'id': str(booking['_id'])}), 201

@app.route('/cart', methods=['GET'])
def get_cart_items():
    user_id = request.args.get('user_id')
    if not user_id:
        logger.error("Failed to fetch cart items: User ID is required")
        return jsonify({'error': 'User ID is required'}), 400

    cart_items = list(db.cart.find({'user_id': ObjectId(user_id)}))
    if not cart_items:
        logger.error("No items found in cart for user_id %s", user_id)
        return jsonify({'error': 'No items found in cart for this user'}), 404

    cart_items_list = [
        {
            'product_id': str(item['product_id']),
            'product_name': db.products.find_one({'_id': item['product_id']})['name'],
            'product_price': db.products.find_one({'_id': item['product_id']})['price_registered'],
            'product_imageUrl': db.products.find_one({'_id': item['product_id']})['imageUrl'],
            'product_description': db.products.find_one({'_id': item['product_id']})['description'],
            'product_stock': db.products.find_one({'_id': item['product_id']})['stock'],
            'quantity': item['quantity'],
            'krishiBhavan': db.products.find_one({'_id': item['product_id']})['krishiBhavan']
        }
        for item in cart_items
    ]

    logger.info("Fetched cart items for user_id %s: %s", user_id, cart_items_list)
    return jsonify(cart_items_list), 200

@app.route('/bookings', methods=['GET'])
def get_user_bookings():
    user_id = request.args.get('user_id')
    krishi_bhavan = request.args.get('krishiBhavan')

    if not user_id and not krishi_bhavan:
        logger.error("Failed to fetch bookings: User ID or Krishi Bhavan is required")
        return jsonify({'error': 'User ID or Krishi Bhavan is required'}), 400

    query = {}
    if user_id:
        query['user_id'] = user_id
    if krishi_bhavan:
        # Decode URL-encoded string (e.g., convert "Krishi%20Bhavan%202" to "Krishi Bhavan 2")
        decoded_krishi_bhavan = unquote(krishi_bhavan)
        query['krishiBhavan'] = decoded_krishi_bhavan

    logger.info("Fetching bookings with query: %s", query)
    bookings = list(db.bookings.find(query))
    if not bookings:
        logger.error("No bookings found for query: %s", query)
        return jsonify({'error': 'No bookings found'}), 404

    bookings_list = [
        {
            'id': str(booking['_id']),
            'user_id': booking['user_id'],
            'product_name': booking['product_name'],
            'product_id': booking['product_id'],
            'quantity': booking['quantity'],
            'krishiBhavan': booking['krishiBhavan'],
            'booking_date_time': booking['booking_date_time'],
            'total_amount': booking['total_amount'],
            'collection_status': booking['collection_status'],
            # Calculate expiry_date as one day after booking_date_time
            'expiry_date': (datetime.strptime(booking['booking_date_time'], "%Y-%m-%dT%H:%M:%S.%fZ") + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S")        }
        for booking in bookings
    ]

    logger.info("Fetched bookings for query %s: %s", query, bookings_list)
    return jsonify(bookings_list), 200

@app.route('/bookings/<booking_id>', methods=['PUT'])
def update_booking_status(booking_id):
    try:
        # Validate booking ID
        if not ObjectId.is_valid(booking_id):
            return jsonify({'error': 'Invalid booking ID'}), 400

        # Parse the request data
        data = request.get_json()
        new_status = data.get('collection_status')

        if not new_status:
            return jsonify({'error': 'Collection status is required'}), 400

        # Update the booking in the database
        result = bookings_collection.update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': {'collection_status': new_status}}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Booking not found'}), 404

        return jsonify({'message': 'Booking status updated successfully'}), 200

    except Exception as e:
        logger.error(f"Error updating booking status: {e}")
        return jsonify({'error': 'An error occurred while updating the booking status'}), 500
    
@app.route('/update-expired-bookings', methods=['POST'])
def trigger_update_expired_bookings():
    try:
        update_expired_bookings()
        return jsonify({'message': 'Expired bookings updated successfully'}), 200
    except Exception as e:
        logger.error(f"Error triggering update for expired bookings: {e}")
        return jsonify({'error': 'An error occurred while updating expired bookings'}), 500


from apscheduler.schedulers.background import BackgroundScheduler

# Initialize the scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(update_expired_bookings, 'interval', hours=1)  # Run every hour
scheduler.start()

# Shut down the scheduler when the app exits
import atexit
atexit.register(lambda: scheduler.shutdown())

if __name__ == '__main__':
    app.run(debug=True)