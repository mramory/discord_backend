FROM node:18-alpine AS BackProd

WORKDIR /usr/src/back

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn prisma generate
RUN yarn build

CMD source ./migrate-and-start.sh