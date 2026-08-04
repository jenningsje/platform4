FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install --save-dev concurrently

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]
