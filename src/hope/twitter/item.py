from dataclasses import dataclass
from functools import total_ordering
from typing import Optional


@dataclass
@total_ordering
class TweetItem:
    # TODO: Is there need to include:
    #  - tweet text
    #  - quoted tweet text
    #  - quoted tweet timestamp
    tweet_id: str
    user_id: str
    user_created_at: str
    user_screen_name: str
    timestamp: str
    text: str
    n_retweets: int = 0
    n_likes: int = 0
    n_replies: int = 0

    # Type
    is_quote: bool = False
    is_reply: bool = False
    is_retweet: bool = False

    rt_id: Optional[str] = None
    rt_timestamp: Optional[str] = None
    rt_user_id: Optional[str] = None
    rt_user_created_at: Optional[str] = None
    rt_user_screen_name: Optional[str] = None

    # TODO: Get timestamp of replied tweet?
    in_reply_to_tweet_id: Optional[str] = None
    in_reply_to_user_id: Optional[str] = None
    in_reply_to_user_screen_name: Optional[str] = None

    qt_id: Optional[str] = None
    qt_timestamp: Optional[str] = None
    qt_user_id: Optional[str] = None
    qt_user_created_at: Optional[str] = None
    qt_user_screen_name: Optional[str] = None

    user_location: Optional[str] = None
    sentiment: float = 0.0

    def __eq__(self, other):
        return self.tweet_id == other.tweet_id

    def __lt__(self, other):
        return self.tweet_id < other.tweet_id

    @property
    def data(self):
        return {k:v for k,v in vars(self).items() if v}
