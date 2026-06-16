FROM alpine:3.20

RUN apk add --no-cache squid \
    && mkdir -p /var/log/squid /var/spool/squid \
    && chown -R squid:squid /var/log/squid /var/spool/squid

COPY squid.conf /etc/squid/squid.conf

USER squid

EXPOSE 3128

# -N: foreground (required for containers)
# -d 1: log to stderr at debug level 1 so startup errors are visible
# -f: explicit config path
CMD ["squid", "-N", "-d", "1", "-f", "/etc/squid/squid.conf"]
