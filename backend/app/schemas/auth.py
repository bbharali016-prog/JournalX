from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class EmailRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


from typing import Optional


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


class SocialLoginRequest(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    provider: str
    token: Optional[str] = None
