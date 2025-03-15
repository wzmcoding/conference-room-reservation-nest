FROM node:20-alpine as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# production stage
FROM node:20-alpine as production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install --production --legacy-peer-deps

EXPOSE 3003

CMD ["node", "/app/main.js"]
