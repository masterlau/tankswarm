### You just found..
# TANKSWARM
TANKSWARM is a complete platform for conducting and analyzing load tests on Web Services, right from your mobile.

# The Problem
Performance testing can be somewhat difficult, especially when targeting public cloud environments...
- It's easy to max out test host resources - such as network/memory/disk I/O or CPU cycles.
- Using a single static IP for large concurrency testing usually kicks off Distributed Denial of Service (DDOS) alarms and subsquently throttles, packet shapes or completely blocks your connection.
- Collecting, aggregating and evaluating performance data is cumbersome.

# The Solution.. TankSwarm
- An massively scalable, performant solution with the ability to harness mastodon resources
- Use as many IP addresses as you want to beat DDOS, sticky caches and proxies for real world
- All data is collected, indexed, queried and presented immediately, so you can see the destruction as it happens.

# The Tech
- Built with ***Yandex Tank*** and Phantom load generator - Russian industrial strength performance tools.   
- Made even more awesome with ***Docker Swarm***, enabling the orchestration and synchronous attack by a distributed Armada of Tank nodes..
- Design and launch your attack anywhere, anytime from your mobile via a responsive **Web GUI** built with ***NodeJS micro-services on NGINX***.
- Data is collected and aggregated by ***Elastic Search*** and presented on with custom built ***Grafana*** charts.

![Architecture](https://github.com/masterlau/tankswarm/blob/master/docs/architecture-simple.png)

TANKSWARM consists of two Docker Service Stacks that are replicated over a Docker Swarm:

  1. **App**: Consists of 3 docker containers - NGINX, Elastic Search and Grafana.  This service stack controls the browser based load testing console, the  Elastic Search Time Series database to collect test data and Grafana dashboards to chart test results.
  2. **Tank**: Consists of one docker container consisting of Yandex Tank, Logstash and Metric Beat.  This service stack executes the load tests, pushges results into Elastic search via Logstash and Metric Beat.

# Setup & Configuration
## Create Amazon Web Services (AWS) Virtual Prvate Cloud
## Add AWS Compute Instances
## Docker Setup
### Docker Manager
***Initiate Swarm & Become Manager***
***Deploy App Stack***
***Start Micro-Services***
#### Docker Workers
***Join Swarm***

# Usage
![Ammo](https://github.com/masterlau/tankswarm/blob/master/docs/iphone-login.jpg)
![Ammo](https://github.com/masterlau/tankswarm/blob/master/docs/iphone-ammo.jpg)




### Install Docker
1. **Compute Instances**: You can use VM's or Bare Metal Machines to create your Docker Swarm.  I have used four (4) small AWS EC2 Instances.
    - Docker-Swarm-Manager
    - Docker-Swarm-Worker1
    - Docker-Swarm-Worker2
    - Docker-Swarm-Worker3
2. **Network**: Ensure your nodes are on the same subnet
3. **Ports**: Open the following ports:
    - TCP port 2377 for cluster management communications
    - TCP and UDP port 7946 for communication among nodes
    - UDP port 4789 for overlay network traffic
4. **Operating System**: Ubuntu Xenial (16.04)
5. **Install Docker (CE) to Nodes** [Docker Website](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

    - Update Ubuntu
    > $ sudo apt-get update
    
    - Install dependant packages
    > $ sudo apt-get install apt-transport-https ca-certificates curl software-properties-common

    - Get Docker GPG Key
    > $ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

    - Add Docker Repo
    > $ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

    - Re-Update Repo List
    > $ sudo apt-get update

    - Install Docker 
    > $ sudo apt-get install docker-ce
    
### Configure Docker Swarm

1. **Initiliase Docker Swarm Manager**
On the node inteneded to be the Docker Swarm Manager, run the docker initialization command.

    > $ docker swarm init --advertise-addr 192.168.0.1<br/>
    > Swarm initialized: current node (bvz81updecsj6wjz393c09vti) is now a manager<br/><br/>
    > To add a worker to this swarm, run the following command:<br/><br/>
    > $ docker swarm join \ <br/>
    > --token SWMTKN-1-3pu6hszjas19xyp7ghgosyx9k8atbfcr8p2is99znpy26u2lkl-1awxwuwd3z9j1z3puu7rcgdbx \ <br/>
    > 172.17.0.2:2377<br/><br/>
    >To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.

2. **Join Docker Worker Nodes to Swarm**
Login to each of the Docker Swarm Worker Nodes and run the following command to join them to the Swarm.

    > $ docker swarm join \ <br/>
    > --token SWMTKN-1-3pu6hszjas19xyp7ghgosyx9k8atbfcr8p2is99znpy26u2lkl-1awxwuwd3z9j1z3puu7rcgdbx \ <br/>
    > 172.17.0.2:2377<br/>

3. **List Registered Docker Swarm Nodes**
On the Docker Swarm Manager, run this command to ensure all nodes joined the Swarm correctly:

    > $ docker node ls
 
    | ID | HOSTNAME | STATUS | AVAILABILITY | MANAGER | STATUS |
    | -- | -------- | ------ | ------------ | ------- | ------ |
    | 1bcef6utixb0l0ca7gxuivsj0 | Docker-Swarm-Worker-1 | Ready | Active | | |
    | 38ciaotwjuritcdtn9npbnkuz | Docker-Swarm-Worker-2 | Ready | Active | | |
    | 4sdag234kjhvishj29hajsnjn | Docker-Swarm-Worker-3 | Ready | Active | | |
    | e216jshn25ckzbvmwlnh5jr3g* | Docker-Swarm-Manager  | Ready | Active | Leader | |

### Create Docker Named Volumes
On the Docker Swarm Manager, create a Docker named file repoistory.

    > $ docker volume create app-vol      
    > $ docker volume create tank-vol

### Create Docker Overlay Network
On the Docker Swarm Manager, create a docker overlay network so all nodes can communicate.

    > $ docker network create warzone

### Deploy the App ServicesStack
On the Docker Swarm Manager Node.

1. Clone the TANKSWARM Repo to your home directory.

    > $ git clone https://github.com/masterlau/tankswarm.git

2. Switch into the repo directory and deploy App Stack.

    > $ docker deploy stack -c docker-compose-app.yml app

3. Check the App Stack is running:

    > $ docker service ls
    
| ID | NAME | MODE | REPLICAS | IMAGE | PORTS |
| -- | ---- | ---- | -------- | ----- | ----- |
| j71rvblg8e5s | app_elk | replicated	| 1/1 | sebp/elk:latest | \*:5044->5044/tcp, \*:5601->5601/tcp, \*:9200->9200/tcp, \*:9300->9300/tcp | 
| lhs3g5zfvlnf | app_grafana | replicated	| 1/1 | grafana/grafana:latest | \*:3000->3000/tcp |
| i0ac4jtl6h00 | app_nginx | replicated	| 1/1 | nginx:latest | \*:80->80/tcp, \*:443->443/tcp |


# Usage
### Start Web App
1. Goto your favorite web browser and go to the following address

    > ```http://<ip-of-docker-swarm-manager>```
    
2. Login with the following credentials

    > username: admin<br/>
    > password: admin
   
3. Fill in the following fields.

    > GET/POST: GET<br/>
    > SSL/HTTP: http<br/>
    > Host: www.google.com<br/>
    > URL: /<br/>
    > RPS: 20  *Requests per second*<br/>
