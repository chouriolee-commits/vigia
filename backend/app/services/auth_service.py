from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories import user_repository
from app.schemas.auth import LoginIn, RegisterIn, TokenOut, UserOut


class EmailYaRegistrado(Exception):
    pass


class CredencialesInvalidas(Exception):
    pass


def register(db: Session, payload: RegisterIn) -> TokenOut:
    if user_repository.get_by_email(db, payload.email) is not None:
        raise EmailYaRegistrado()

    user = user_repository.create(
        db, name=payload.name, email=payload.email, password_hash=hash_password(payload.password)
    )
    db.commit()
    db.refresh(user)

    return _emitir_token(user)


def login(db: Session, payload: LoginIn) -> TokenOut:
    user = user_repository.get_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise CredencialesInvalidas()

    return _emitir_token(user)


def _emitir_token(user) -> TokenOut:
    token = create_access_token(user.id, user.email)
    return TokenOut(
        access_token=token,
        user=UserOut(id=user.id, name=user.name, email=user.email, role=user.role),
    )
