import os

import pandas as pd
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from hope.ml.api.item import Input
from hope.ml.utils import load_model_from_hf

load_dotenv()

app = FastAPI()

# app.model = 

@app.get("/")
async def root():
    return JSONResponse(
        status_code=200,
        content={"message": "hope.ml"},
    )


@app.post("/model/")
async def predict(data: Input):
    # model =
    # encoder = load_asset("encoder.pkl")
    # lb = load_asset("lb.pkl")

    # TODO: Modify to pass in multiple indices
    # df = pd.DataFrame(data.dict(by_alias=True), index=[0])
    # X, *_ = process_data(
    #     df, categorical_features=cat_features, label=None, encoder=encoder, lb=lb, training=False
    # )
    # predictions = inference(model, X)
    # return JSONResponse(status_code=200, content=predictions.tolist())
    pass
