#!/usr/bin/env bash

sh scripts/env_vars.sh

scp server/serveHttp.py ubu@"$SSH_SERVER_HOST":/home/ubu/picamstudio/
scp -r build/* ubu@"$SSH_SERVER_HOST":/home/ubu/picamstudio/www/
