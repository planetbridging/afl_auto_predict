FROM node:14

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
RUN npm install @tensorflow/tfjs-node

COPY . .

EXPOSE 5008

CMD ["node", "index.js"]
