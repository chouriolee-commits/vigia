from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def _normalizar_email(cls, v: str) -> str:
        # Evita que "Ana@X.co" y "ana@x.co" se traten como cuentas distintas.
        return v.lower()


class LoginIn(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def _normalizar_email(cls, v: str) -> str:
        return v.lower()


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
