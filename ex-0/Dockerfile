#
# -- Base node image with app
#
FROM node:lts-alpine AS base
WORKDIR /usr/src/app
COPY hello.js package.json package-lock.json ./

#
# -- Dependencies
#
FROM base as dependencies
WORKDIR /usr/src/app
RUN npm install --only=production
RUN cp -R node_modules node_modules_production
RUN npm install

#
# Running test, npm audit
#
FROM dependencies as test
WORKDIR /usr/src/app
#Preparing and runnig tests
RUN ["npm","test"]
#Running vulnerability check for dependencies
RUN npm audit --production --audit-level=high


#
# Release image
#
FROM base as release
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules_production ./node_modules
ENTRYPOINT [ "npm", "start"]