# Pull base image.
FROM ubuntu:14.04


# Install MongoDB.
RUN \
  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 && \
  echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' > /etc/apt/sources.list.d/mongodb.list && \
  apt-get update && \
  apt-get install -y mongodb-org && \
  rm -rf /var/lib/apt/lists/*

RUN apt-get update
RUN apt-get install -y python-software-properties curl sqlite3 git wget build-essential
# Define mountable directories.
VOLUME ["/data/db"]

# Define working directory.
WORKDIR /data

# Define default command.
CMD ["mongod"]

# Expose ports.
EXPOSE 27017:27017
EXPOSE 28017
EXPOSE 5683:5683
EXPOSE 1883:1883
EXPOSE 8899:8899
EXPOSE 8898:8898

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
RUN apt-get install -y nodejs
# Define working directory.

RUN cd /home
RUN git clone http://github.com/phodal/lan /home/lan

WORKDIR /home/lan
RUN npm install --production
RUN npm install -g sequelize-cli
RUN npm install -g forever
RUN sequelize db:migrate
#RUN forever start server


# Define default command.
CMD ["bash"]
