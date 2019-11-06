#!/bin/bash

PATH="/root/.nvm/versions/node/v13.0.1/bin:$PATH"

set +x

# update npm packages
npm install

# build production site
npm run build

# copy files to server location
rsync -rvh ./build/ /var/www/db-todo/

# start API server
forever start ./src/server.js