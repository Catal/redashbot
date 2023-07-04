FROM mcr.microsoft.com/playwright:v1.34.0-jammy

USER root
RUN apt-get update -y --fix-missing \
    && apt-get install --no-install-recommends -y \
        fonts-takao \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /home/pwuser/redashbot

COPY package.json package-lock.json /home/pwuser/redashbot/
RUN npm ci --only=production

USER pwuser
COPY . /home/pwuser/redashbot


EXPOSE 3000
CMD [ "npm", "start" ]

