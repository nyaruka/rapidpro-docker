#!/bin/sh

export REMOTE_CONTAINERS=true

poetry run python3 manage.py migrate
poetry run python3 manage.py runserver 0.0.0.0:8000
