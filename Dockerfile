FROM node:18-alpine

# Instalar Python y FFmpeg necesarios para procesar el audio y video
RUN apk add --no-cache python3 py3-pip ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
