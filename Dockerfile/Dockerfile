# Composition fo Yandex Tank

ARG VERSION=16.04
FROM ubuntu:${VERSION} AS ubuntu

# Update all Repos
RUN apt-get update

# Install Tools
RUN apt-get -y install vim
RUN apt-get -y install curl
RUN apt-get -y install wget

# Update Essential Repos
RUN apt-get -y install python-pip build-essential python-dev libffi-dev gfortran libssl-dev

# Install Yandex Tank
RUN pip install https://api.github.com/repos/yandex/yandex-tank/tarball/master

# Install Phantom
RUN echo "\n# Adding Phantom Repo" >> /etc/apt/sources.list
RUN echo "deb http://ppa.launchpad.net/yandex-load/main/ubuntu trusty main" >> /etc/apt/sources.list
RUN echo "deb-src http://ppa.launchpad.net/yandex-load/main/ubuntu trusty main" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get -y install --allow-unauthenticated phantom phantom-ssl

# Install Metric Beat
RUN curl -L -O https://artifacts.elastic.co/downloads/beats/metricbeat/metricbeat-6.3.2-amd64.deb
RUN dpkg -i metricbeat-6.3.2-amd64.deb
COPY ./metricbeat.yml /etc/metricbeat
RUN rm metricbeat-6.3.2-amd64.deb

# Install Logstash
RUN apt-get -y install openjdk-8-jre
RUN wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
RUN apt-get install apt-transport-https
RUN echo "deb https://artifacts.elastic.co/packages/6.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-6.x.list
RUN apt-get update
RUN apt-get install logstash
COPY ./logstash.conf /etc/logstash/conf.d/
COPY ./tankmapping.json /etc/logstash/

# Add & Populate Tank Directory
RUN mkdir -p /var/loadtest
COPY ./start.sh /var/loadtest

# Add Entrypoint
ENTRYPOINT /var/loadtest/start.sh

STOPSIGNAL SIGTERM
