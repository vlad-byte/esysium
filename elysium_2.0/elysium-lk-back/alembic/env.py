from logging.config import fileConfig
from sqlalchemy import pool
from alembic import context
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))
from database.models import Base
from dotenv import load_dotenv
load_dotenv()


config = context.config

# Устанавливаем строку подключения из переменной окружения
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://elyzium:elyziumawesomepass@188.225.58.30:5433/elyzium_db")
if not DATABASE_URL:
    raise Exception("DATABASE_URL is not set!")
config.set_main_option("sqlalchemy.url", DATABASE_URL)

fileConfig(config.config_file_name)
target_metadata = Base.metadata

def run_migrations_offline():
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    from sqlalchemy.ext.asyncio import create_async_engine
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )
    import asyncio
    async def run_async_migrations():
        async with connectable.begin() as connection:
            await connection.run_sync(
                lambda sync_conn: context.configure(
                    connection=sync_conn,
                    target_metadata=target_metadata,
                    compare_type=True,
                )
            )
            await connection.run_sync(lambda sync_conn: context.run_migrations())
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online() 