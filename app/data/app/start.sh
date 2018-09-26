#!/bin/bash

/usr/bin/nodejs /www/app/server.js >> /var/log/nodejs.log 2>&1 &
