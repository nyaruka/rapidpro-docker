# 🐳 RapidPro Docker

[![tag](https://img.shields.io/github/tag/nyaruka/rapidpro-docker.svg)](https://github.com/nyaruka/rapidpro-docker/releases)
[![Build Status](https://github.com/nyaruka/rapidpro-docker/workflows/CI/badge.svg)](https://github.com/nyaruka/rapidpro-docker/actions?query=workflow%3ACI)

> [!IMPORTANT]  
> These example containers are for development and documentation purposes only, and are not intended for production deployments.

Docker compose for public snapshot versions of [RapidPro](https://app.rapidpro.io).

Includes:
 - RapidPro webapp and celery worker ([License](https://github.com/nyaruka/rapidpro/blob/main/LICENSE))
 - Mailroom ([License](https://github.com/nyaruka/mailroom/blob/main/LICENSE))
 - Courier ([License](https://github.com/nyaruka/courier/blob/main/LICENSE))
 - Archiver ([License](https://github.com/nyaruka/rp-archiver/blob/main/LICENSE))
 - nginx
 - PostgreSQL
 - Elasticsearch
 - Valkey
 - Localstack (provides DynamoDB, S3 and Cloudwatch)
 - Squid (forward proxy for mailroom and courier outgoing calls to user-configured URLs)

## Usage

```
docker compose up -d
```

The webapp will then be accessible at [http://localhost](http://localhost) and you will be able to create 
a test workspace at [http://localhost/org/signup](http://localhost/org/signup).
