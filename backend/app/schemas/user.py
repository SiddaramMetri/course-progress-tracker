import uuid

from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "learner"


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    mobile: str | None = None
    role: str
    batch_name: str | None = None
    batch_start: str | None = None
    batch_end: str | None = None

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    name: str | None = None
    mobile: str | None = None


class LoginResponse(BaseModel):
    token: str
    refresh_token: str
    user: UserOut


class RefreshRequest(BaseModel):
    refresh_token: str
