FROM node:18

WORKDIR /usr/src/app

COPY ./db/package*.json ./

RUN npm install

COPY ./common ../common

COPY ./db .

CMD ["npm", "start"]