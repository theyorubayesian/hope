from typing import Dict
from typing import List
from typing import Union

from transformers import AutoModelForSequenceClassification
from transformers import pipeline


def load_model_from_hf(model_name_or_path: str, num_labels: int = 2, *args, **kwargs):
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name_or_path, num_labels=num_labels)
    return model


def load_hf_classification_pipeline(model_name_or_path: str, top_k: int = None, *args, **kwargs):
    model = pipeline(
        "sentiment-analysis", 
        model=model_name_or_path, 
        top_k=top_k
    )
    return model


def classify_using_pipeline(pipeline, text: Union[str, List[str]]) -> List[Dict[str, float]]:
    all_sentiment = []
    output = pipeline(text)

    for prediction in output:
        sentiment = {}
        for label_prediction in prediction:
            sentiment[label_prediction["label"]] = sentiment[label_prediction["score"]]

    return all_sentiment    
