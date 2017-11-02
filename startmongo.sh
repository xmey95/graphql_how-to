#!/bin/bash
mkdir -p ./db/
mongod --dbpath=db --port 27017
