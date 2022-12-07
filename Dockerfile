FROM node:19.0.1 as base
WORKDIR /home/node/app
COPY ["package.json", "package-lock.json", "./"]  
RUN npm install 

FROM base as production
ENV NODE_PATH=./build
RUN npm run build

