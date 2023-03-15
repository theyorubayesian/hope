from typing import List
from typing import Optional

import tweepy

from hope.twitter.database import DatabaseClient
from hope.twitter.item import TweetItem


class StreamListener(tweepy.Stream):
    def __init__(self, db_client: DatabaseClient, **kwargs) -> None:
        super(StreamListener, self).__init__(**kwargs)
        self.db_client = db_client

    @staticmethod
    def get_tweet_item(
        data, items: Optional[List[TweetItem]] = None, recursive: bool = False
    ) -> List[TweetItem]:
        """
        Compose `TweetItem` from Status object. Recur on Quoted Status , if exists.

        :param data:
        :param items: List of `TweetItem` objects
        :param recursive: Recursively collect quoted or retweeted tweets
        :return: Final list of `TweetItem` objects
        """
        # TODO: Extend to collect tweets from in_reply_to_status_id_str
        if items is None:
            items = []

        # TODO: Would a serializer be best here?
        item = TweetItem(
            tweet_id=data.id_str,
            user_id=data.user.id_str,
            user_screen_name=data.user.screen_name,
            user_created_at=data.user.created_at,
            timestamp=data.created_at,
            text=data.text if not data.truncated else data.extended_tweet["full_text"],
            n_retweets=data.retweet_count,
            n_likes=data.favorite_count,
            n_replies=data.reply_count,
            is_quote=data.is_quote_status,
            in_reply_to_tweet_id=data.in_reply_to_status_id_str,
            in_reply_to_user_id=data.in_reply_to_user_id_str,
            in_reply_to_user_screen_name=data.in_reply_to_screen_name,
            user_location=data.user.location,
        )
        items.append(item)

        if item.in_reply_to_tweet_id:
            item.is_reply = True

        if hasattr(data, "retweeted_status"):
            item.is_retweet = True
            item.rt_id = data.retweeted_status.id_str
            item.rt_timestamp = data.retweeted_status.created_at
            item.rt_user_id = data.retweeted_status.user.id_str
            item.rt_user_created_at = data.retweeted_status.user.created_at
            item.rt_user_screen_name = data.retweeted_status.user.screen_name

            if recursive:
                return StreamListener.get_tweet_item(data.retweeted_status, items)

        if item.is_quote and hasattr(data, "quoted_status"):
            item.qt_id = data.quoted_status.id_str
            item.qt_timestamp = data.quoted_status.created_at
            item.qt_user_id = data.quoted_status.user.id_str
            item.qt_user_created_at = data.quoted_status.user.created_at
            item.qt_user_screen_name = data.quoted_status.user.screen_name

            if recursive:
                return StreamListener.get_tweet_item(data.quoted_status, items)

        return items

    def process_data(self, raw_data) -> None:
        items = self.get_tweet_item(raw_data)
        for item in items:
            self.db_client.process_item(item)

    def on_status(self, raw_data) -> None:
        self.process_data(raw_data)

    def on_warning(self, notice=None):
        """
        Called when a disconnection warning message arrives.
        """
        return

    def on_limit(self, track):
        """
        Called when a limitation notice arrives.
        """
        return

    def on_error(self, status_code: int) -> Optional[bool]:
        # TODO: Investigate other errors that
        #  may come up and handle them
        if status_code == 420:
            # returning False in on_data disconnects the stream
            return False
        # NOTE: All other errors simply pass through currently
        return True

    def on_disconnect(self, notice=None):
        """
        Called when twitter sends a disconnect notice.

        Disconnect codes are listed here:
        https://developer.twitter.com/en/docs/tweets/filter-realtime/guides/streaming-message-types
        """
        return
