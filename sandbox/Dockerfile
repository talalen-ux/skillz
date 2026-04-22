FROM python:3.12-slim AS sandbox
WORKDIR /app
# docker CLI to talk to the host daemon (socket bind-mounted at runtime).
RUN apt-get update && apt-get install -y --no-install-recommends docker.io \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
ENV SANDBOX_RUNNER_IMAGE=skillz-runner:latest
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
