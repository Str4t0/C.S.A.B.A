# Backend Dockerfile
# DevOps Engineer: Tom Wilson

FROM python:3.11-slim

WORKDIR /app

# Rendszer függőségek telepítése
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python függőségek telepítése
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Alkalmazás másolása
COPY ./app /app/app

# Upload könyvtár létrehozása
RUN mkdir -p /app/uploads/thumbnails

# Port
EXPOSE 8000

# Alkalmazás indítása
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
