from pydantic import BaseModel


class SuggestedAction(BaseModel):
    label: str
    route: str


class AssistantMessageIn(BaseModel):
    message: str
    context: dict = {}


class AssistantMessageOut(BaseModel):
    role: str = "assistant"
    content: str
    suggested_action: SuggestedAction | None = None
