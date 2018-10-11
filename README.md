### You just found..

<img src="https://github.com/masterlau/tankswarm/blob/master/docs/tankswarm-logo.jpg" alt="tankswarm" width="100%">

# TANKSWARM
TANKSWARM is a complete platform for conducting and analyzing load tests on Web Services, right from your mobile.

# The Challenge
Performance testing can be somewhat difficult, especially when targeting public cloud environments...
- It's easy to max out test host resources - such as network/memory/disk I/O or CPU cycles.
- Using a single static IP for large concurrency testing usually kicks off Distributed Denial of Service (DDOS) alarms and subsquently throttles, packet shapes or completely blocks your connection.
- Collecting, aggregating and evaluating performance data is cumbersome.

# Our Solution.. TANKSWARM
- A massively scalable, performant platform that enables you to harness enormous public cloud resources.
- Beat DDOS, sticky caches and proxies with as many real IP's as necessary to emulate real world environments.
- All data is collected, indexed, queried and presented as it happens, so you can see the destruction as it happens.

# The Tech Stack
- Built with **Yandex Tank** and **Phantom** load generator - Russian industrial strength performance tools.   
- Made even more awesome with **Docker Swarm**, enabling the orchestration and asynchronous attack by a distributed Armada of Tank nodes.
- Design and launch your attack anywhere, anytime from your mobile via a responsive **Web GUI** built with **NodeJS on NGINX**.
- Data is collected and aggregated by **Elastic Search** and presented via **Grafana** charts.

<img src="https://github.com/masterlau/tankswarm/blob/master/docs/architecture-simple.png" alt="Architecture" width="80%">

TANKSWARM consists of two Docker Service Stacks that are replicated over a Docker Swarm:

  1. **App**: Consists of 3 docker containers - NGINX, Elastic Search and Grafana.  This service stack controls the browser based load testing console, the  Elastic Search Time Series database to collect test data and Grafana dashboards to chart test results.
  2. **Tank**: Consists of one docker container consisting of Yandex Tank, Logstash and Metric Beat.  This service stack executes the load tests, pushes results into Elastic search via Logstash and Metric Beat.

# Setup & Configuration
## Create Amazon Web Services (AWS) Virtual Private Cloud
1. Create VPC (eg. Tank)
2. Create SubNet (eg. TankSubNet 10.0.0.0/24)
3. Create New Internet Gateway
4. Attach Internet Gateway to VPC
5. Click Route Table and select your VPC
6. Click the Routes Tab
7. Add Route 0.0.0.0/24 -> New Internet Gateway 

## Add AWS Compute Instances
1. Launch a new instance<br/>
**Note**: ensure all EC2 instances are at least T2.Medium (>4GB RAM) - Docker 2GB + ELK 2GB

2. Select Ubuntu 16.04 LTS Xenial and click "Next: Configure Instance Details"

3. Input number of Instances (eg. 2)

4. Check Tank SubNet

5. Check Auto-Assign IP Addresses

6. Skip through Add Storage

7. Skip through Add Tags

8. Click through to "Configure Security Groups" and create new Security Group, add the following:
   - SSH -> Port 22 -> TCP -> < YOUR-IP-ADDRESS >/32
   - HTTP -> Port 88 -> TCP -> < YOUR-IP-ADDRESS >/32
   - DOCKERADM -> Port 2377 -> TCP -> 10.0.0.0/24
   - DOCKERCHAT -> Port 7946 -> TCP/UDP -> 10.0.0.0/24
   - DOCKERNET -> Port 4789 -> UDP -> 10.0.0.0/24
   - GRAFANA -> Port 3000 -> TCP -> < YOUR-IP-ADDRESS >/32, 10.0.0.0/24
   - ELASTIC -> Port 9200 -> TCP -> 10.0.0.0/24
   - KIBANA -> Port 5601 -> TCP -> < YOUR-IP-ADDRESS >/32, 10.0.0.0/24
   - FILEBEAT -> Port 5044 -> TCP -> 10.0.0.0/24

9. Create New Key Pair & Download Key

10. SSH to each ec2 instance and to assure connectivity
    > ssh -i keylocation/keyname.pem ubuntu@< ec2-instance-public-ip >

## Docker Setup
1. Update Apt Repos & Auto-Uprade
   > apt update && apt -y upgrade

2. Install all Tank Depencies<br/>
   > apt-get install apt-transport-https ca-certificates curl software-properties-common git

3. Download and add GPG key
   > curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

4. Add Tank Repo
   > add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

5. Update Repo & Install Docker CE
   > apt-get update && apt-get install -y docker-ce=```18.03.1~ce-0~ubuntu```

6. Initialise Docker Swarm on Docker Manager Instance
   > docker swarm init --advertise-addr < docker-swarm-ip > (eg. 10.0.0.1) 
   
7. On Docker Workers, Join Docker Swarm 
   > docker swarm join --token < docker-swarm-token > < docker-swarm-manager-ip >:2377   
   
8. On Docker Manager, check all Docker Nodes are joined
    > docker node ls
    
9. On Docker Manager, Create Docker Volume for Application Stack & Tank Stack
    > docker volume create app-vol<br/>
    > docker volume create tank-vol
    
10. On Docker Manager, Create Docker Swarm Overlay Network 
    > docker network create --scope swarm --driver overlay warzone

## Deploy App Stack
This process is carried out on the Docker Manager.

1. Clone the TanksSwarm GIT Repository 
   > git clone https://github.com/masterlau/tankswarm.git

2. Copy App code base to the App Docker Volume (app-vol)
   > cp -R app/data/* /var/lib/docker/volumes/app-vol/_data/

3. Increase the kernel maximum memory allocataion size for the greedy Elastic Search Java memory pool.
   > sysctl -w vm.max_map_count=262144

4. Deploy the Docker App Stack
   > docker stack deploy -c app/docker-compose.yml app

5. Ensure the services are running
   > docker service ls

6. Start the NodeJS micro-services engine
   > docker exec < NGINX-DOCKER-CONTAINER_ID > /www/app/start.sh

7. Check web app is operational in your favorite web browser
   > http://< docker-swarm-manager-ip >

**Note**: You can keep an eye on the NodeJS logs:
   > docker exec <NGINX-DOCKER-CONTAINER-ID> /usr/bin/tail -f /var/log/nodejs.log


# Usage
<img src="https://github.com/masterlau/tankswarm/blob/master/docs/iphone-login.jpg" width="25%"><img src="https://github.com/masterlau/tankswarm/blob/master/docs/iphone-ammo.jpg" width="25%"><img src="https://github.com/masterlau/tankswarm/blob/master/docs/iphone-tank.jpg" width="25%"><img src="https://github.com/masterlau/tankswarm/blob/master/docs/iphone-results.jpg" width="25%">

1. Goto the TankSwarm App in your web browser - http://< docker-master-ip-address >/
2. Login with the following credentials, then click "Log Me In" Button

    > username: admin<br/>
    > password: admin
   
3. Fill out Phase 1 input fields to Prepare Ammo, then click "Test Fire" button.
    
4. Review Test Fire Results in the Terminal Console window to ensure expectant results.

5. Fill out Phase 2 Tank Setting input fields, then click "Tank Ready - Fire!" button.

6. View the results in the "Battle Field Intelligence" Grafana charts. 
**Note**: You can also click on the "Laucnh Grafana for Full Metrics" link to see expanded metrics and have full control.


Full Credits to those who blazed the trail before me: @direvius
  
