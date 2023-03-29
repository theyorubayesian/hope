from typing import List
from typing import Optional

from shap.plots import text as plot_text


def get_shap_plot(explainer, text_input: List[str], display: bool, *args, **kwargs) -> Optional[str]:
    shap_values = explainer(text_input)
    maybe_html = plot_text(shap_values[:, :, "POSITIVE"], display=display)
    return maybe_html
