FROM python:3.12-slim
WORKDIR /app

COPY corerequirements.txt extendedrequirements.txt ./
RUN pip install --no-cache-dir -r corerequirements.txt

COPY . .
ENV MODE=core

CMD if [ "$MODE" = "extended" ]; then \
        pip install --no-cache-dir -r extendedrequirements.txt && \
        python agent.py; \
    else \
        python agent.py; \
    fi
