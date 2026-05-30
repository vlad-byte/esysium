from fastapi import APIRouter, Depends, HTTPException
from src.shemas.user import UserCreate, UserLogin, UserOut
from src.database.db import get_session
from src.database.user import get_user_by_username, create_user, verify_password
from sqlalchemy.ext.asyncio import AsyncSession

users_router = APIRouter(prefix="/users", tags=["users"])

@users_router.post("/register", response_model=UserOut)
async def register_user(user_data: UserCreate, db: AsyncSession = Depends(get_session)):
    existing_user = await get_user_by_username(db, user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    user = await create_user(db, user_data.username, user_data.password)
    return user

@users_router.post("/login", response_model=UserOut)
async def login_user(user_data: UserLogin, db: AsyncSession = Depends(get_session)):
    user = await get_user_by_username(db, user_data.username)
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    return user 