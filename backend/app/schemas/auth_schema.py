from pydantic import BaseModel


# ==========================
# REGISTER REQUEST
# ==========================

class RegisterRequest(BaseModel):

    name: str
    email: str
    password: str
    role: str



# ==========================
# LOGIN REQUEST
# ==========================

class LoginRequest(BaseModel):

    email: str
    password: str



# ==========================
# LOGIN RESPONSE
# ==========================

class LoginResponse(BaseModel):

    message: str
    role: str
    access_token: str
    token_type: str = "bearer"