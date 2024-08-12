FROM python:3.11-bullseye

ARG RAPIDPRO_TAG
ENV RAPIDPRO_TAG=${RAPIDPRO_TAG:-main}

RUN apt-get update && apt-get install -y libgdal-dev ffmpeg nodejs npm
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"
ENV POETRY_VIRTUALENVS_IN_PROJECT=true
RUN npm install -g n && n 20
RUN npm install -g yarn less

WORKDIR /rapidpro 
RUN wget -O rapidpro.tar.gz "https://github.com/nyaruka/rapidpro/archive/${RAPIDPRO_TAG}.tar.gz" && tar -xf rapidpro.tar.gz --strip-components=1 && rm rapidpro.tar.gz
RUN poetry install
RUN yarn install
RUN ln -s /rapidpro/temba/settings.py.dev /rapidpro/temba/settings.py

EXPOSE 8000
COPY entrypoint.sh /rapidpro/
RUN chmod +x /rapidpro/entrypoint.sh
ENTRYPOINT ["/rapidpro/entrypoint.sh"]
