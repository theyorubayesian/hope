import os
from typing import List
from typing import Union

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi.responses import HTMLResponse
from starlette.requests import Request

from hope.ml.api.item import Input
from hope.ml.api.item import ClassificationOutput
from hope.ml.explain import get_shap_plot
from hope.ml.model_utils import classify_using_pipeline

router = APIRouter()


@router.post("/sentiment/", response_model=ClassificationOutput)
async def get_sentiment(input_text: Union[Input, List[Input]], request: Request):
    sentiment = classify_using_pipeline(request.app.model, input_text.tweet)
    sentiment["id"] = input_text.id
    return JSONResponse(content=sentiment, status_code=200)


@router.post("/explanation/", response_class=HTMLResponse)
async def get_explanation(input_text: Union[Input, List[Input]], request: Request):
    output_file = os.path.join(request.app.tempdir.name, f"{input_text.id}.html")
    
    if not os.path.isfile(output_file):
        html = get_shap_plot(request.app.explainer, [input_text.tweet], output_file)
        with open(output_file, "w") as f:
            f.write(html)
    else:
        html = open(output_file, "r").read()

    return HTMLResponse(content=html, status_code=200)


@router.get("/tweet/")
async def get_tweet(id: str, request: Request):
    tweet = request.app.twitter_api.get_status(id)
    return JSONResponse(
        id=id,
        text=tweet.text,
        # TODO:
        # n_like=, 
        # n_quote=,
        # n_reply=
    )
