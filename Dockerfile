FROM node:16.20.0-buster
# RUN apk add --update --no-cache \
#     make \
#     gcc \
#     g++ \
#     jpeg-dev \
#     cairo-dev \
#     giflib-dev \
#     pango-dev \
#     libtool \
#     autoconf \
#     automake
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon
COPY . .
CMD [ "npm", "run", "dev" ]