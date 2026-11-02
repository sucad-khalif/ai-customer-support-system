from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db
from app.models import Staff
from app.security import (
    verify_password,
    create_access_token,
    verify_access_token
)


router = APIRouter(
    prefix="/staff",
    tags=["Staff Authentication"]
)
security = HTTPBearer()

def get_current_staff(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return payload
def require_role(*allowed_roles):

    def role_checker(
        current_staff=Depends(get_current_staff)
    ):
        if current_staff["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this resource"
            )

        return current_staff

    return role_checker

# test someone dont have token

@router.get("/me")
def get_my_staff(
    current_staff=Depends(get_current_staff)
):
    return {
        "message": "Authenticated staff",
        "staff_id": current_staff["staff_id"],
        "role": current_staff["role"]
    }

@router.get("/admin-test")
def admin_test(
    current_staff=Depends(require_role("admin"))
):
    return {
        "message": "Welcome Admin",
        "staff_id": current_staff["staff_id"],
        "role": current_staff["role"]
    }

class StaffLogin(BaseModel):
    email: str
    password: str


@router.post("/login")
def staff_login(
    login_data: StaffLogin,
    db: Session = Depends(get_db)
):
    staff = db.query(Staff).filter(
        Staff.email == login_data.email
    ).first()

    if not staff:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        staff.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not staff.is_active:
        raise HTTPException(
            status_code=403,
            detail="Staff account is inactive"
        )
    access_token = create_access_token(
    data={
        "staff_id": staff.id,
        "role": staff.role
    }
)
    return {
    "message": "Login successful",
    "access_token": access_token,
    "token_type": "bearer",
    "staff_id": staff.id,
    "name": staff.name,
    "email": staff.email,
    "role": staff.role
}