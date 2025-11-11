FROM python:3.12-slim

WORKDIR /app

# Optional build argument (defaults to core)
ARG REQ_FILE=corerequirements.txt
ENV REQ_FILE=${REQ_FILE}

# Copy selected requirements file into the image
COPY ${REQ_FILE} requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "agent.py"]
