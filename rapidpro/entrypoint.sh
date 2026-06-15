#!/bin/sh

export REMOTE_CONTAINERS=true
export POSTGIS=off

ACTION=${1:-webapp}

if [ "$ACTION" = "webapp" ]; then
    echo "Running RapidPro webapp..."
	poetry run python3 manage.py migrate
    poetry run python3 manage.py migrate_dynamo
    poetry run python3 manage.py create_es_index contacts
    poetry run python3 manage.py create_es_index messages
    poetry run python3 manage.py runserver 0.0.0.0:8000
elif [ "$ACTION" = "celery" ]; then
    echo "Running RapidPro celery worker..."
	.venv/bin/celery -A temba worker -E -B --loglevel=INFO
fi
