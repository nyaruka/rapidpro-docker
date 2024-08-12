#!/bin/sh

export REMOTE_CONTAINERS=true

ACTION=${1:-webapp}

if [ "$ACTION" = "webapp" ]; then
    echo "Running RapidPro webapp..."
	poetry run python3 manage.py migrate
    poetry run python3 manage.py runserver 0.0.0.0:8000
elif [ "$ACTION" = "celery" ]; then
    echo "Running RapidPro celery worker..."
	.venv/bin/celery -A temba worker -E -B --loglevel=INFO
fi
