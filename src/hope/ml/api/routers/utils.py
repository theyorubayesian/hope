from fastapi import APIRouter
from fastapi.responses import JSONResponse
from starlette.requests import Request

router = APIRouter()

@router.get("/tweet/")
async def get_tweet(id: str, request: Request):
    tweet = request.app.twitter_api.get_status(id)
    tweet_info = {"id": tweet.id, "tweet": tweet.text}
    # TODO: What other info needs to be returned?
    return JSONResponse(
        content=tweet_info,
        status_code=200
    )
