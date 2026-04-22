FROM python:3.12-alpine
WORKDIR /run
COPY harness.py /run/harness.py
# No network unless explicitly attached. Drop privileges.
RUN adduser -D -u 10001 runner && chown -R runner:runner /run
USER runner
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
ENTRYPOINT ["python", "/run/harness.py"]
