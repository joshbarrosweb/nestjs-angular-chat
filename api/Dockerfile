# DEVELOPMENT

FROM node:14 as development

WORKDIR /josue/api/src/app

COPY package*.json ./

RUN npm install

RUN npm run build

EXPOSE 3000

# PRODUCTION

FROM node:14 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /josue/api/src/app

COPY --from=development /josue/api/src/app/ .

EXPOSE 3000

CMD ["node", "dist/main"]
