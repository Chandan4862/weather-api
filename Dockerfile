FROM node:22-alpine 

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY src ./src

EXPOSE 4000

CMD ["npm", "start"]