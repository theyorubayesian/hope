from typing import List
from typing import Optional
from typing import Tuple
from typing import TypedDict

from hope.twitter.item import TweetItem

# TODO: Weight edges by number of likes?
DEFAULT_ENGAGEMENT_WEIGHTS = {"retweet": 1, "quote": 1, "like": 1, "reply": 1}

ENGAGEMENT_TYPE = "Directed"

Node = TypedDict('Node', {'id': str, "name": str, "created_at": str})
Edge = TypedDict('Edge', {"source": str, "type": str, "target": str, "weight": float})


# flake8: noqa: CCR001
def get_graphing_info(
        tweet_item: TweetItem, 
        tweets_as_nodes: bool = False
    ) -> Tuple[Optional[List[Node]], Optional[List[Edge]]]:
    """
    Get graphing info for Gephi or d3.js

     - Users/Tweets are collected as nodes.
     - Engagements (retweets, quotes and replies) are collected as edges.

    @param tweet_item: TweetItem to get graphing data from

    @return: nodes, edge if `tweet_item` contains an engagement else None, None
    """
    _ENGAGEMENT_TYPE = f"{'Tweet' if tweets_as_nodes else 'User'}-{ENGAGEMENT_TYPE}"

    if any([tweet_item.is_quote, tweet_item.is_reply, tweet_item.is_retweet]):
        node_info: List[Node] = []
        edge_info: List[Edge] = []

        node_info.append(
            {
                "id": tweet_item.tweet_id,
                "tweet": tweet_item.text,
                "user_id": tweet_item.user_id,
                "timestamp": tweet_item.timestamp['$date']
            } if tweets_as_nodes else {
                "id": tweet_item.user_id,
                "name": tweet_item.user_screen_name,
                "createdat": tweet_item.user_created_at,
            }
        )

        if tweet_item.is_quote:
            edge_info.append(
                {
                    "source": tweet_item.tweet_id if tweets_as_nodes else tweet_item.user_id,
                    "type": _ENGAGEMENT_TYPE,
                    "action": "quote",
                    "target": tweet_item.qt_id if tweets_as_nodes else tweet_item.qt_user_id,
                    "weight": DEFAULT_ENGAGEMENT_WEIGHTS["quote"],
                }
            )

            if tweets_as_nodes:
                node_info.append(
                    {
                        "id": tweet_item.qt_id,
                        "tweet": "",    # TODO: Backfill
                        "user_id": tweet_item.qt_user_id,
                        "timestamp":""  # TODO: Backfill
                    }  
                )
            elif tweet_item.qt_user_id != node_info[0]["id"]:
                node_info.append(
                    {
                        "id": tweet_item.qt_user_id,
                        "name": tweet_item.qt_user_screen_name,
                        "createdat": tweet_item.qt_user_created_at['$date'],
                    }
                )

        if tweet_item.is_retweet:
            edge_info.append(
                {
                    "source": tweet_item.tweet_id if tweets_as_nodes else tweet_item.user_id,
                    "type": _ENGAGEMENT_TYPE,
                    "action": "retweet",
                    "target": tweet_item.rt_id if tweets_as_nodes else tweet_item.rt_user_id,
                    "weight": DEFAULT_ENGAGEMENT_WEIGHTS["retweet"],
                }
            )

            if tweets_as_nodes:
                node_info.append(
                    {
                        "id": tweet_item.rt_id,
                        "tweet": "",    # TODO: Backfill
                        "user_id": tweet_item.rt_user_id,
                        "timestamp":""  # TODO: Backfill
                    }  
                )
            elif tweet_item.rt_user_id != node_info[0]["id"]:
                node_info.append(
                    {
                        "id": tweet_item.rt_user_id,
                        "name": tweet_item.rt_user_screen_name,
                        "createdat": tweet_item.rt_user_created_at['$date'],
                    }
                )
            
        if tweet_item.is_reply:
            edge_info.append(
                {
                    "source": tweet_item.tweet_id if tweets_as_nodes else tweet_item.user_id,
                    "action": "reply",
                    "type": _ENGAGEMENT_TYPE,
                    "target": tweet_item.in_reply_to_tweet_id if tweets_as_nodes else tweet_item.in_reply_to_user_id,
                    "weight": DEFAULT_ENGAGEMENT_WEIGHTS["reply"],
                }
            )

            if tweets_as_nodes:
                node_info.append(
                    {
                        "id": tweet_item.in_reply_to_tweet_id,
                        "tweet": "",    # TODO: Backfill
                        "user_id": tweet_item.in_reply_to_user_id,
                        "timestamp":""  # TODO: Backfill
                    }  
                )
            elif tweet_item.in_reply_to_user_id != node_info[0]["id"]:
                node_info.append(
                    {
                        "id": tweet_item.in_reply_to_user_id,
                        "name": tweet_item.in_reply_to_user_screen_name,
                        "createdat": "" # TODO: Backfill
                    }
                )

        return node_info, edge_info

    # If not an engagement, we return None for nodes & edge
    return None, None
