import os
import time
from http.client import IncompleteRead
from pathlib import Path

from dotenv import load_dotenv
from urllib3.exceptions import ProtocolError

from hope.twitter.database import get_db_client
from hope.twitter.listener import StreamListener


class V1Stream:
    def __init__(self, listener: StreamListener):
        self.listener = listener

    def start(self, keyword_list):
        # TODO: Handle IncompleteRead errors using Queues (RabbitMQ, Kafka etc)
        # TODO: Should `threaded/is_async=True` in stream.filter?
        while True:
            try:
                self.listener.filter(track=keyword_list, stall_warnings=True, locations=None)
            except IncompleteRead:
                continue
            except KeyboardInterrupt:
                self.listener.disconnect()
                break
            except ProtocolError:
                print("Error: Check network connection")
                time.sleep(120)


def start_stream(keyword_list_file: str, output_client: str, output_file: str, env_file: str):
    load_dotenv(env_file)

    auth_kwargs = {
        "consumer_key": os.getenv("CONSUMER_KEY"),
        "consumer_secret": os.getenv("CONSUMER_SECRET"),
        "access_token": os.getenv("ACCESS_TOKEN"),
        "access_token_secret": os.getenv("ACCESS_TOKEN_SECRET")
    }
    
    if any([v is None for v in auth_kwargs.values()]):
        raise TypeError(
            "Provide environment variables: `CONSUMER_KEY`, `CONSUMER_SECRET`,"
            " `ACCESS_TOKEN` and `ACCESS_TOKEN_SECRET`"
        )
    
    keyword_list = Path(keyword_list_file).read_text().split("\n")

    db_client = get_db_client(name=output_client, file=output_file)
    listener = StreamListener(db_client=db_client, **auth_kwargs)
    stream = V1Stream(listener)

    stream.start(keyword_list)
    db_client.terminate()
