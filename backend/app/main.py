from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    alerts,
    assistant,
    auth,
    dashboard,
    detections,
    eventos,
    health,
    media,
    misiones,
    potreros,
    simulacion,
)
from app.core.config import settings

app = FastAPI(title="VIGÍA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(potreros.router)
app.include_router(alerts.router)
app.include_router(eventos.router)
app.include_router(misiones.router)
app.include_router(media.router)
app.include_router(detections.router)
app.include_router(assistant.router)
app.include_router(simulacion.router)
