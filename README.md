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

1. **Compute Instances**: You can use VM's or Bare Metal Machines to create your Docker Swarm
2. **Network**: Ensure your nodes are on the same subnet
3. **Ports**: Open the following ports:
    * TCP port 2377 for cluster management communications
    * TCP and UDP port 7946 for communication among nodes
    * UDP port 4789 for overlay network traffic
4. **Operating System**: Ubuntu Xenial (16.04)
5. **Install Docker (CE) to Nodes** [Docker Website](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
    * Update Ubuntu
    > sudo apt-get update
    * Install dependant packages
    > sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
    * Get Docker GPG Key
    > curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

    > sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    
    > sudo apt-get update
    
    > sudo apt-get install docker-ce
    
## Configure Docker Swarm
1. **Create Docker Swarm Manager**
