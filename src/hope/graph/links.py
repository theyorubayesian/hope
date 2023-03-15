from typing import Dict
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
def get_graphing_info(tweet_item: TweetItem) -> Tuple[Optional[List[Node]], Optional[List[Edge]]]:
    """
    Get graphing info for Gephi.

     - Users are collected as nodes.
     - Engagements (retweets, quotes and replies) are collected as edges.

    @param tweet_item: TweetItem to get graphing data from

    @return: nodes, edge if `tweet_item` contains an engagement else None, None
    """
    if any([tweet_item.is_quote, tweet_item.is_reply, tweet_item.is_retweet]):
        node_ids = set()
        node_info: List[Node] = []
        edge_info: List[Edge] = []

        node_ids.add(tweet_item.user_id)
        node_info.append(
            {
                "id": tweet_item.user_id,
                "name": tweet_item.user_screen_name,
                "createdat": tweet_item.user_created_at,
            }
        )

        if tweet_item.is_quote:
            edge_info.append(
                {
                    "source": tweet_item.user_id,
                    "type": ENGAGEMENT_TYPE,
                    "target": tweet_item.qt_user_id,
                    "weight": DEFAULT_ENGAGEMENT_WEIGHTS["quote"],
                }
            )

            if tweet_item.qt_user_id != node_info[0]["id"]:
                node_info.append(
                    {
                        "id": tweet_item.qt_user_id,
                        "name": tweet_item.qt_user_screen_name,
                        "createdat": tweet_item.qt_user_created_at,
                    }
                )

        if tweet_item.is_retweet:
            edge_info.append(
                {
                    "source": tweet_item.user_id,
                    "type": ENGAGEMENT_TYPE,
                    "target": tweet_item.rt_user_id,
                    "weight": DEFAULT_ENGAGEMENT_WEIGHTS["retweet"],
                }
            )

            if tweet_item.rt_user_id != node_info[0]["id"]:
                node_info.append(
                    {
                        "id": tweet_item.rt_user_id,
                        "name": tweet_item.rt_user_screen_name,
                        "createdat": tweet_item.rt_user_created_at,
                    }
                )
        if tweet_item.is_reply:
            edge_info.append(
                {
                    "source": tweet_item.user_id,
                    "type": ENGAGEMENT_TYPE,
                    "target": tweet_item.in_reply_to_user_id,
                    "weight": DEFAULT_ENGAGEMENT_WEIGHTS["reply"],
                }
            )

            if tweet_item.in_reply_to_user_id != node_info[0]["id"]:
                node_info.append(
                    {
                        "id": tweet_item.in_reply_to_user_id,
                        "name": tweet_item.in_reply_to_user_screen_name,
                    }
                )

        # TODO: Get weight for like and retweet
        return node_info, edge_info

    # If not an engagement, we return None for nodes & edge
    return None, None
