# 🐳 RapidPro Docker

[![Build Status](https://github.com/nyaruka/rapidpro-docker/workflows/CI/badge.svg)](https://github.com/nyaruka/rapidpro-docker/actions?query=workflow%3ACI)

Docker compose for the latest stable release of RapidPro from Nyaruka (9.2.x)

Includes:
 - RapidPro ([License](https://github.com/nyaruka/rapidpro/blob/main/LICENSE))
 - Mailroom ([License](https://github.com/nyaruka/mailroom/blob/main/LICENSE))
 - Courier ([License](https://github.com/nyaruka/courier/blob/main/LICENSE))
 - Indexer ([License](https://github.com/nyaruka/rp-indexer/blob/main/LICENSE))
 - nginx
 - Celery
 - PostgreSQL (postgis)
 - Elasticsearch
 - Redis
 - Minio (S3 emulator)

These example containers are for development purposes only. They are not suitable for production deployments.

## Usage

```
docker compose up -d
```
