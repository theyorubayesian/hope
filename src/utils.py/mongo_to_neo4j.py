import os

from dotenv import load_dotenv
from neomodel import config
from pymongo import MongoClient

from graph.neo_item import Person
from graph.neo_item import Tweet
from twitter.item import TweetItem

load_dotenv()

db_user_password = os.getenv("MONGODB_USER_PASSWORD")
db_name = os.getenv("MONGODB_DB")
collection = os.getenv("TWEET_COLLECTION_NAME")
connection_string = str.format(
    os.getenv("MONGODB_CONNECTION_STRING"), password=db_user_password, database=db_name
)

connection = MongoClient(connection_string)
db = connection[db_name][collection]

config.DATABASE_URL = os.getenv("NEO4J_DB_URL")

tweet: dict

for tweet in db.find({}):
    _ = tweet.pop("_id")
    t = TweetItem(**tweet)
    
    first = Person.get_or_create({"person_id": t.user_id})[0]
    if t.is_reply and t.in_reply_to_user_id is not None:
        second = Person.get_or_create({"person_id": t.in_reply_to_user_id})[0]
        first.replied.connect(second)
    elif t.is_retweet and t.rt_user_id is not None:
        second = Person.get_or_create({"person_id": t.rt_user_id})[0]
        first.retweeted.connect(second)
    elif t.is_quote and t.qt_user_id is not None:
        second = Person.get_or_create({"person_id": t.qt_user_id})[0]
        first.quoted.connect(second)
    else:
        continue

