FROM python:3.12-slim AS base

WORKDIR /app

# Install system deps + useful terminal tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    vim-tiny \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh

EXPOSE 8000

# Terminal access: docker exec -it <container> sh
# Seed manually: docker exec -it <container> python -m app.seed
# Auto-seeds on first start, then runs the server
CMD ["./start.sh"]
