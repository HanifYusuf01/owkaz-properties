FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Ensure uploads directory exists; in production mount a persistent volume here
RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["node", "dist/main.js"]