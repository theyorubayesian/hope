import os
from typing import Optional

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


class BaseConfig(BaseModel):
    """Base configuration."""
    CLASSIFICATION_MODEL_NAME_OR_PATH: Optional[str] = None
    LABELS: str = "POSITIVE,NEGATIVE"
    API_NAME: str = "Test-API"
    API_PREFIX: str = "/api/v1"
    OPENAPI_URL: str = "openapi.json"
    DOCS_URL: str = "docs"
    REDOC_URL: str = "redocs"
    DEBUG: bool = False
    TESTING: bool = False
    PRODUCTION: bool = False
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    VERSION: str = open(os.path.join(BASE_DIR, "VERSION")).read().strip()


class DevelopmentConfig(BaseConfig):
    """Development configuration."""

    DEBUG: bool = True
    TESTING: bool = True
    PRODUCTION: bool = False


class TestConfig(BaseConfig):
    """Test configuration."""

    DEBUG: bool = True
    TESTING: bool = True
    PRODUCTION: bool = False


class ProductionConfig(BaseConfig):
    """Production configuration."""

    DEBUG: bool = False
    TESTING: bool = False
    PRODUCTION: bool = True


def from_envvar():
    """Get configuration class from environment variable."""
    options = {
        "development": DevelopmentConfig,
        "test": TestConfig,
        "production": ProductionConfig,
    }
    
    try:
        choice = os.environ["HOPE_ML_API_ENV"]
    except KeyError:
        raise KeyError("'HOPE_ML_API_ENV' is not set")
    
    if choice not in options:
        msg = "ENV={} is not valid, must be one of {}".format(choice, set(options))
        raise ValueError(msg)
    loaded_config = options[choice](**os.environ)
    print(loaded_config)
    return dict(loaded_config)
