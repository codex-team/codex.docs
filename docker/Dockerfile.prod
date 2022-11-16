# Stage 1 - build
FROM node:16.14.0-alpine3.15 as build

## Install build toolchain, install node deps and compile native add-ons
RUN apk add --no-cache python3 make g++ git

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production

RUN cp -R node_modules prod_node_modules

RUN yarn install

COPY . .

RUN yarn build-all

# Stage 2 - make final image
FROM node:16.14.0-alpine3.15

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY --from=build /usr/src/app/prod_node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/public ./public

ENV NODE_ENV=production

CMD ["node", "dist/backend/app.js"]
