from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginIn, RegisterIn, TokenOut
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
def registrar(payload: RegisterIn, db: Session = Depends(get_db)):
    try:
        return auth_service.register(db, payload)
    except auth_service.EmailYaRegistrado:
        raise HTTPException(status_code=409, detail="El email ya está registrado")


@router.post("/login", response_model=TokenOut)
def iniciar_sesion(payload: LoginIn, db: Session = Depends(get_db)):
    try:
        return auth_service.login(db, payload)
    except auth_service.CredencialesInvalidas:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
