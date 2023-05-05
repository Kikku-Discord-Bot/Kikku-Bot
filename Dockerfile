FROM node:16.20.0-alpine
RUN apk --no-cache add --virtual .builds-deps build-base python3
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon
COPY . .
CMD [ "npm", "run", "dev" ]