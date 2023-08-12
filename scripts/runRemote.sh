#!/bin/bash

echo "starting web
server... $SSH_SERVER_HOST"
ssh -t ubu@"$SSH_SERVER_HOST" 'python3 picamstudio/serveHttp.py;'
