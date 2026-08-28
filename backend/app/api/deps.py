from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories import user_repository

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependencia lista para proteger endpoints con `Depends(get_current_user)`.
    Ningún endpoint la usa todavía (013-authentication no exige proteger los
    otros 7 endpoints en el MVP) — queda disponible para cuando se necesite.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="No autenticado")

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user = user_repository.get(db, int(payload["sub"]))
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    return user
