import os
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://elyzium:elyziumawesomepass@188.225.58.30:5433/elyzium_db")
