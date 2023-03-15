import json
import os
from abc import ABC
from abc import abstractmethod
from pathlib import Path
from pprint import pprint
from typing import List
from typing import Union

import jsonlines
from bson import json_util
from pymongo import DESCENDING
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError

from hope.twitter.graph import get_graphing_info
from hope.twitter.graph import Edge
from hope.twitter.graph import Node
from hope.twitter.item import TweetItem


class DatabaseClient(ABC):
    @abstractmethod
    def process_item(self, item: TweetItem):
        """
        This method is called by the Stream Listener to process a single Tweet Item.
        """
        pass

    def terminate(self):
        """
        This method is called to terminate connection to the database.
        """
        pass


def get_db_client(name: str, **kwargs) -> DatabaseClient:
    """
    Get and intialise DatabaseClient.
    """
    clients = {"file": FileClient, "stdout": StdOutClient, "mongo": Jankariwo}
    return clients[name](**kwargs)


class StdOutClient(DatabaseClient):
    def __init__(self, **kwargs) -> None:
        super(StdOutClient, self).__init__()

    def process_item(self, item: TweetItem):
        pprint(item.data, indent=4)

        nodes, edges = get_graphing_info(item)
        print("Node info: ", nodes, end="\n\n")
        print("Edge info: ", edges, end="\n\n")


class FileClient(DatabaseClient):
    def __init__(self, file: str, overwrite: bool = True, **kwargs) -> None:
        super(FileClient, self).__init__()
        output_file = Path(file)
        if output_file.exists():
            if overwrite:
                print("Output file already exists. Overwriting existing file.")
            else:
                raise FileExistsError("Output file already exists and `overwrite` is False")

        dumps = json.JSONEncoder(default=json_util.default).encode
        self.fs = output_file.open(mode="w")
        self.topic_writer = jsonlines.Writer(self.fs, dumps=dumps)

        nodes_filename = output_file.stem + "_nodes" + output_file.suffix
        nodes_file = output_file.parent / nodes_filename
        self.nodes_fs = nodes_file.open(mode="w")
        self.nodes_writer = jsonlines.Writer(self.nodes_fs, dumps=dumps)

        edges_filename = output_file.stem + "_edges" + output_file.suffix
        edges_file = output_file.parent / edges_filename
        self.edges_fs = edges_file.open(mode="w")
        self.edges_writer = jsonlines.Writer(self.edges_fs, dumps=dumps)

    def process_item(self, item: TweetItem):
        self.topic_writer.write(item.data)
        nodes, edges = get_graphing_info(item)
        if nodes:
            self.nodes_writer.write_all(nodes)
        if edges:
            self.edges_writer.write_all(edges)

    def terminate(self):
        self.topic_writer.close()
        self.nodes_writer.close()
        self.edges_writer.close()


class Jankariwo(DatabaseClient):
    """
    Jánkárìwọ̀ means spiderweb in Yoruba.
    """
    def __init__(self, **kwargs):
        super(Jankariwo, self).__init__()
        db_user_password = os.getenv("MONGODB_USER_PASSWORD")
        db_name = os.getenv("MONGODB_DB")

        if not db_name:
            raise TypeError(
                "Provide an environment variable 'MONGODB_COLLECTION' "
                "that contains collection name and 'MONGODB_DB' for "
                "database name"
            )
        connection_string = str.format(
            os.getenv("MONGODB_CONNECTION_STRING"), password=db_user_password, database=db_name
        )
        self.connection = MongoClient(connection_string)

        self.db = self.connection[db_name]
        self.tweet_collection = self.db[os.getenv("TWEET_COLLECTION_NAME")]
        self.tweet_collection.create_index(
            [("tweet_id", DESCENDING)], background=True, unique=True, name="TweetIdIndex"
        )

        self.graph_node_collection = self.db[self.tweet_collection.name + "_nodes"]
        self.graph_edge_collection = self.db[self.tweet_collection.name + "_edges"]

    @staticmethod
    def insert_documents(collection: Collection, documents: List[Union[Node, Edge]]) -> bool:
        try:
            collection.insert_many(documents, ordered=False)
        except DuplicateKeyError:
            pass

        return True

    def process_item(self, item: TweetItem) -> None:
        data = item.data
        query = {"tweet_id": item.tweet_id}

        self.tweet_collection.update_one(query, {"$set": data}, upsert=True)
        nodes, edges = get_graphing_info(item)

        if nodes:
            self.insert_documents(self.graph_node_collection, nodes)
        if edges:
            self.insert_documents(self.graph_edge_collection, edges)

    def terminate(self):
        self.connection.close()
