from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import User
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, username: str, password: str):
    hashed_password = hash_password(password)
    user = User(username=username, hashed_password=hashed_password, created_at=datetime.utcnow())
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password) 