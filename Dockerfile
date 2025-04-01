FROM node:18-alpine AS back_prod

RUN apk add --no-cache openssl

WORKDIR /usr/src/back

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn prisma generate
RUN yarn build

CMD source ./migrate-and-start.sh