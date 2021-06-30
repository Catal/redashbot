FROM mcr.microsoft.com/playwright:bionic

USER root
RUN apt-get install -y libxtst6
RUN apt-get install -y fonts-noto

USER pwuser

RUN mkdir -p /home/pwuser/redashbot
WORKDIR /home/pwuser/redashbot

COPY package.json /home/pwuser/redashbot
COPY package-lock.json /home/pwuser/redashbot
RUN npm ci --production
COPY . /home/pwuser/redashbot

EXPOSE 3000
CMD [ "npm", "start" ]
