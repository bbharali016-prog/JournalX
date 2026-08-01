from pymongo import MongoClient
from app.core.config import settings

# Initialize lazy client
mongo_client = MongoClient(settings.MONGODB_URL)
mongo_db = mongo_client.get_default_database()

def get_mongo_db():
    return mongo_db
