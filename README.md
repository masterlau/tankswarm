### You just found..
# TANKSWARM
TANKSWARM is a complete platform for conducting and analyzing load tests on web services and apps.

# Tools & Features
* Docker Swarm - Scalable & Robust Contair Platform
* Phantom - Fast Web Client
* Yandex Tank - Accurate Load Scheduler
* Elastic Search - Elastic, Redundant Data Storage & Retrieval
* Grafana - Beautiful & Immediate Results Analysis

# Architecture
TANKSWARM consists of two Docker Service Stacks that are replicated over a Docker Swarm:

1. **App:** consists of 3 docker containers - NGINX, Elastic Search and Grafana.  This service stack controls the browser based load testing console, the  Elastic Search Time Series database to collect test data and Grafana dashboards to chart test results.
2. **Tank:** consists of one docker container consisting of Yandex Tank, Logstash and Metric Beat.  This service stack executes the load tests, pushges results into Elastic search via Logstash and Metric Beat.

 ![Architecture](https://github.com/masterlau/tankswarm/blob/master/docs/architecture.png)

# Setup & Configuration
## Install Docker
1. **Compute Instances**: You can use VM's or Bare Metal Machines to create your Docker Swarm.  I have used four (4) small AWS EC2 Instances.
   * Docker-Swarm-Manager
   * Docker-Swarm-Worker1
   * Docker-Swarm-Worker2
   * Docker-Swarm-Worker3
2. **Network**: Ensure your nodes are on the same subnet
3. **Ports**: Open the following ports:
    * TCP port 2377 for cluster management communications
    * TCP and UDP port 7946 for communication among nodes
    * UDP port 4789 for overlay network traffic
4. **Operating System**: Ubuntu Xenial (16.04)
5. **Install Docker (CE) to Nodes** [Docker Website](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
    * Update Ubuntu
      > $ sudo apt-get update
    
    * Install dependant packages
      > $ sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
    
    * Get Docker GPG Key
      > $ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    
    * Add Docker Repo
      > $ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    
    * Re-Update Repo List
      > $ sudo apt-get update

    * Install Docker
      > $ sudo apt-get install docker-ce
    
## Configure Docker Swarm
1. **Initiliase Docker Swarm Manager**

    > $ docker swarm init --advertise-addr 192.168.0.1<br/>
    > Swarm initialized: current node (bvz81updecsj6wjz393c09vti) is now a manager<br/><br/>
    > To add a worker to this swarm, run the following command:<br/><br/>
    > docker swarm join \<br/>
    > --token SWMTKN-1-3pu6hszjas19xyp7ghgosyx9k8atbfcr8p2is99znpy26u2lkl-1awxwuwd3z9j1z3puu7rcgdbx \<br/>
    > 172.17.0.2:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.

    
2. **Connect Work Nodes to Docker Swarm**
3. **Check Connected**

## Clone TankSwarm Repo to Docker-Swarm-Manager
1. **Clone**: Clone the TANKSWARM Repo to your home directory on the host that will be your Docker Swarm Maanager.

    > $ git clone https://github.com/masterlau/tankswarm.git

## Configure Docker Service Definitions
1. **App Service**: edit docker-compose-app.yml
2. **Tank Service**:  edit docker-compose-app.yml

## Create Docker Named Volumes
1. Create Docker local named file repoistories on Swarm Manager node.

    > $ docker volume create app-vol      
    > $ docker volume create tank-vol

## Create Docker Overlay Network
1. Create a docker overlay network so all nodes in the Docker Swarm can communicate. 

    > $ docker network create zarzone
## Create
## Deploy Docker Service Stacks
1. App
2. Tank
