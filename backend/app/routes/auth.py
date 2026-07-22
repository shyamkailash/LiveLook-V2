from fastapi import APIRouter, HTTPException
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    LoginResponse
)
from app.utils.security import hash_password, verify_password
from app.utils.jwt import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Temporary storage (Database will replace this later)
users = {}



# ==========================
# AUTH TEST
# ==========================

@router.get("/")
def auth_test():

    return {
        "message": "Auth API Working"
    }



# ==========================
# REGISTER USER
# ==========================

@router.post("/register")
def register(
    data: RegisterRequest
):

    if data.email in users:

        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )


    users[data.email] = {

        "name": data.name,

        "email": data.email,

        "password": hash_password(
            data.password
        ),

        "role": data.role

    }


    return {

        "message": "User registered successfully",

        "email": data.email,

        "role": data.role

    }




# ==========================
# LOGIN USER
# ==========================

@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    data: LoginRequest
):

    user = users.get(
        data.email
    )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    if not verify_password(
        data.password,
        user["password"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )



    token = create_access_token({

        "email": user["email"],

        "role": user["role"]

    })



    return {

        "message": "Login successful",

        "role": user["role"],

        "access_token": token,

        "token_type": "bearer"

    }