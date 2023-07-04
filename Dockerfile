FROM mcr.microsoft.com/playwright:v1.34.0-jammy

USER root
RUN apt-get update -y --fix-missing \
    && apt-get install --no-install-recommends -y \
        fonts-noto \
        fonts-noto-cjk \
        fonts-noto-color-emoji \
        fonts-noto-hinted \
        fonts-noto-mono \
        fonts-noto-unhinted \
    # font aliases for Noto CJK fonts
    && echo '<?xml version="1.0"?> \
<!DOCTYPE fontconfig SYSTEM "fonts.dtd"> \
<fontconfig >\
 <match target="pattern"> \
   <test qual="any" name="family"><string>sans-serif</string></test> \
   <edit name="family" mode="prepend" binding="same"><string>Noto Sans CJK JP</string></edit> \
 </match> \
 <match target="pattern"> \
   <test qual="any" name="family"><string>serif</string></test> \
   <edit name="family" mode="prepend" binding="same"><string>Noto Serif CJK JP</string></edit> \
 </match> \
</fontconfig>' > /etc/fonts/local.conf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /home/pwuser/redashbot

COPY package.json package-lock.json /home/pwuser/redashbot/
RUN npm ci --only=production

USER pwuser
COPY . /home/pwuser/redashbot


EXPOSE 3000
CMD [ "npm", "start" ]

