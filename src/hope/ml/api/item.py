from pydantic import BaseModel
from pydantic import Field


class Input(BaseModel):
    id: str = Field(..., example="1689093674984")
    tweet: str = Field(..., example="I have hope!")


class ClassificationOutput(BaseModel):
    id: str = Field(..., example="1689093674984")
    label: str = Field(..., example="POSITIVE")
    score: float = Field(..., example=0.69)


class ExplanationOutput(BaseModel):
    pass
