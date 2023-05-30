FROM node:18-alpine
WORKDIR /usr/src/dkg-facade
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

COPY . .

EXPOSE 8000

CMD [ "npm", "run", "prod" ]