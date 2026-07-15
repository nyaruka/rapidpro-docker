# rp-archiver publishes binary tarballs on its GitHub releases but no Docker image,
# so this downloads the release binary for the target platform.

FROM debian:bookworm-slim

ARG ARCHIVER_VERSION
ARG TARGETARCH

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*

RUN curl -L "https://github.com/nyaruka/rp-archiver/releases/download/v${ARCHIVER_VERSION}/rp-archiver_${ARCHIVER_VERSION}_linux_${TARGETARCH}.tar.gz" | tar -xz -C /usr/local/bin rp-archiver

CMD ["rp-archiver"]
