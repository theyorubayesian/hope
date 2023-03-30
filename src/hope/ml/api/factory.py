import logging.config
from tempfile import TemporaryDirectory

import requests
import urllib3
from fastapi import FastAPI
from shap import Explainer
from starlette.middleware.cors import CORSMiddleware

from hope.ml.api.configuration import from_envvar
from hope.ml.model_utils import load_hf_classification_pipeline


def setup_logger(app: FastAPI):
    """Set up the logger."""
    logging.config.fileConfig("logging.conf")
    app.logger = logging.getLogger(app.config["API_NAME"])


def setup_routes(app: FastAPI):
    """Register routes."""
    from hope.ml.api.routers import classification
    from hope.ml.api.routers import utils

    app.include_router(classification.router, prefix=app.config["API_PREFIX"])
    app.include_router(utils.router, prefix=app.config["API_PREFIX"])


def setup_requests(app: FastAPI):
    """Set up a session for making HTTP requests."""
    session = requests.Session()
    session.headers["Content-Type"] = "application/json"
    session.headers["User-Agent"] = app.config["API_NAME"]

    retry = urllib3.util.Retry(total=5, status=2, backoff_factor=0.3)
    retry_adapter = requests.adapters.HTTPAdapter(max_retries=retry)

    session.mount("http://", retry_adapter)
    session.mount("https://", retry_adapter)

    app.requests = session


def setup_middlewares(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"]
    )


def setup_model_and_explainer(app: FastAPI):
    """
    Set up model for sentiment analysis.
    """
    classifier = load_hf_classification_pipeline(
        app.config["CLASSIFICATION_MODEL_NAME_OR_PATH"], 
        num_labels=len(app.config["LABELS"])
    )
    explainer = Explainer(classifier)
    
    app.classifier = classifier
    app.explainer = explainer


def setup_twitter_api(app: FastAPI):
    pass


def create_app() -> FastAPI:
    """App factory."""
    config = from_envvar()
    app = FastAPI(
        title=config["API_NAME"],
        version=config["VERSION"],
        openapi_url=f'{config["API_PREFIX"]}/{config["OPENAPI_URL"]}',
        docs_url=f'{config["API_PREFIX"]}/{config["DOCS_URL"]}',
        redoc_url=f'{config["API_PREFIX"]}/{config["REDOC_URL"]}',
    )
    app.config = config
    app.tempdir = TemporaryDirectory(prefix=app.config["API_NAME"])

    setup_logger(app)
    setup_requests(app)
    setup_middlewares(app)
    setup_routes(app)
    setup_model_and_explainer(app)
    setup_twitter_api(app)

    return app
