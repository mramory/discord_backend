#!/bin/bash

yarn prisma generate
yarn prisma db push
yarn start:prod