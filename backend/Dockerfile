FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

# Run seed on startup, then start in dev mode
CMD npm run seed && npm run start:dev
