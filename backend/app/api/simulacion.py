from fastapi import APIRouter, HTTPException

from app.schemas.simulacion import IniciarSimulacionIn, SimulacionOut
from app.services import simulation_service

router = APIRouter(prefix="/api/simulacion", tags=["simulacion"])


@router.get("", response_model=SimulacionOut)
def obtener_estado():
    return simulation_service.estado()


@router.post("", response_model=SimulacionOut)
def iniciar(payload: IniciarSimulacionIn):
    try:
        return simulation_service.iniciar(payload.potrero_id, payload.video)
    except simulation_service.VideoNoEncontrado:
        raise HTTPException(status_code=404, detail="Video no encontrado")


@router.delete("", response_model=SimulacionOut)
def detener():
    return simulation_service.detener()
