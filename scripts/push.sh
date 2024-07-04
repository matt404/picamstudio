#!/usr/bin/env bash

echo "Pushing to $SSH_SERVER_HOST"

scp server/serveHttp.py rpi@"$SSH_SERVER_HOST":/home/rpi/picamstudio/
scp -r build/* rpi@"$SSH_SERVER_HOST":/home/rpi/picamstudio/www/
