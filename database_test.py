from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg://postgres:suad@localhost:5432/ai_customer_support"

engine = create_engine(DATABASE_URL)

with engine.connect() as connection:
    result = connection.execute(text("SELECT version();"))
    print(result.fetchone())