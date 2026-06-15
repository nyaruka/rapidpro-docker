#!/bin/sh

export REMOTE_CONTAINERS=true
export POSTGIS=off

ACTION=${1:-webapp}

if [ "$ACTION" = "webapp" ]; then
    echo "Running RapidPro webapp..."
	uv run python manage.py migrate
    uv run python manage.py migrate_dynamo
    uv run python manage.py create_es_index contacts
    uv run python manage.py create_es_index messages
    uv run python manage.py runserver 0.0.0.0:8000
elif [ "$ACTION" = "celery" ]; then
    echo "Running RapidPro celery worker..."
	uv run celery -A temba worker -E -B --loglevel=INFO
fi
