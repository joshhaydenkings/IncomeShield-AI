from pymongo import MongoClient

from .config import MONGODB_DB_NAME, MONGODB_URL

client = MongoClient(MONGODB_URL)
db = client[MONGODB_DB_NAME]

workers_collection = db["workers"]
app_state_collection = db["app_state"]
activity_log_collection = db["activity_log"]