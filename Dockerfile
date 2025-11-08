# -------------------------------------------------------
# FastAPI + Hugging Face + CPU-only PyTorch
# -------------------------------------------------------
FROM python:3.12-slim

# Set working directory inside the container
WORKDIR /app

# ✅ Install minimal system libraries needed for PyTorch & Transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libopenblas-dev \
        libffi-dev \
        && rm -rf /var/lib/apt/lists/*

# Copy dependency file into the container
COPY requirements.txt .

# ✅ Install dependencies and CPU-only Torch
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Copy the rest of your backend code
COPY . .

# Expose FastAPI’s default port
EXPOSE 8000

# Start FastAPI when the container runs
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
