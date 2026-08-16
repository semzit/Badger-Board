FROM node:20-slim AS build

WORKDIR /backend

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

ENV RESTPORT=8080
ENV WSPORT=8081

EXPOSE 8080
EXPOSE 8081

CMD [ "yarn", "start" ] 



