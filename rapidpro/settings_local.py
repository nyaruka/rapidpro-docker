# Local overrides for the dev/CI image, imported last by settings.py.dev.
#
# Email verification stays mandatory, but instead of attempting real SMTP delivery
# (the defaults point at Gmail with placeholder credentials) we print outgoing mail
# to stdout. This lets the end-to-end signup test read the account-verification link
# from the container logs.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
