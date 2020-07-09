#!/bin/bash

PATH="/root/.nvm/versions/node/v14.5.0/bin:$PATH"

set +x

# update npm packages
npm install

# build production site
npm run build

# copy files to server location
rsync -rvh ./build/ /var/www/db-todo/

# start API server
forever restartall