FROM python:3.10-slim-buster

WORKDIR /app

# Copy requirements first to leverage Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application files
COPY backend/ /app/backend/
COPY requirements.txt /app/

# Set Python path to enable module resolution
ENV PYTHONPATH=/app/backend:/app

EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
