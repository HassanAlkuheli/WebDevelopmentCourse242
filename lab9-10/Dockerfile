# Lab 9-10 Node.js server
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

EXPOSE 5000

CMD ["node", "project.js"]
