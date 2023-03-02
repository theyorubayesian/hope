import os

from neomodel import BooleanProperty
from neomodel import config
from neomodel import DateTimeFormatProperty
from neomodel import IntegerProperty
from neomodel import RelationshipFrom
from neomodel import RelationshipTo
from neomodel import StringProperty
from neomodel import StructuredNode

config.DATABASE_URL = os.getenv("NEO4J_DB_URL")


# TODO: Can we tell RTs and Likes as unique interactions?
class Tweet(StructuredNode):
    tweet_id = StringProperty(unique_index=True)
    timestamp = DateTimeFormatProperty(required=True)
    n_retweets = IntegerProperty(default=0)
    n_likes = IntegerProperty(default=0)
    n_replies = IntegerProperty(default=0)
    is_quote = BooleanProperty(default=False)

    # Relationships to other tweets
    # TODO: Check if RTing creates new tweet with new id
    # liked = RelationshipTo("Tweet", "liked")
    retweeted = RelationshipTo("Tweet", "retweeted")
    replied = RelationshipTo("Tweet", "replied")
    quoted = RelationshipTo("Tweet", "quoted")


class Person(StructuredNode):
    person_id = StringProperty(unique_index=True)
    location = StringProperty(unique_index=False, required=False)
    created_at = DateTimeFormatProperty(required=False)

    # Relationships to tweet
    # tweeted = RelationshipTo(Tweet, 'tweeted')
    # liked = RelationshipTo("Person", "liked")
    retweeted = RelationshipTo("Tweet", "retweeted")
    quoted = RelationshipTo("Tweet", "quoted")
    replied = RelationshipTo("Tweet", "replied")

    # Relationships to Persons
    # liked_by = RelationshipFrom("Person", "liked_by")
    retweeted_by = RelationshipFrom("Person", "retweeted_by")
    quoted_by = RelationshipFrom("Person", "quoted_by")
    replied_by = RelationshipFrom("Person", "replied_by")
