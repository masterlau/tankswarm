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

<img src="https://github.com/masterlau/tankswarm/blob/master/docs/architecture-simple.png" alt="Architecture" width="80%">

TANKSWARM consists of two Docker Service Stacks that are replicated over a Docker Swarm:

  1. **App**: Consists of 3 docker containers - NGINX, Elastic Search and Grafana.  This service stack controls the browser based load testing console, the  Elastic Search Time Series database to collect test data and Grafana dashboards to chart test results.
  2. **Tank**: Consists of one docker container consisting of Yandex Tank, Logstash and Metric Beat.  This service stack executes the load tests, pushges results into Elastic search via Logstash and Metric Beat.

# Setup & Configuration
## Create Amazon Web Services (AWS) Virtual Prvate Cloud
1. Create VPC (eg. Tank)
2. Create SubNet (eg. TankSubNet 10.0.0.0/24)
3. Create New Internet Gateway
4. Attach Internet Gateway to VPC
5. Go Route Table, Select VPC, Goto Routes Tab, Add Route 0.0.0.0/24 -> New Internet Gateway & Save

## Add AWS Compute Instances
1. Launch a new instance<br/>
**Note**: ensure all EC2 instances are at least T2.Medium (>4GB RAM) - Docker 2GB + ELK 2GB

2. Select Ubuntu 16.04 LTS Xenial and click "Next: Configure Instance Details"

3. Input number of Instances (eg. 2)

4. Select Tank SubNet

5. Select Auto-Assign IP Addresses

6. Skip through Add Storage

7. Skip through Add Tags

8. Click through to "Configure Security Groups" and create new Security Group, add the following:
   - SSH -> Port 22 -> TCP -> <YOUR-IP-ADDRESS>/32
   - HTTP -> Port 88 -> TCP -> <YOUR-IP-ADDRESS>/32
   - DOCKERADM -> Port 2377 -> TCP -> 10.0.0.0/24
   - DOCKERCHAT -> Port 7946 -> TCP/UDP -> 10.0.0.0/24
   - DOCKERNET -> Port 4789 -> UDP -> 10.0.0.0/24
   - GRAFANA -> Port 3000 -> TCP -> <YOUR-IP-ADDRESS>/32, 10.0.0.0/24
   - ELASTIC -> Port 9200 -> TCP -> 10.0.0.0/24
   - KIBANA -> Port 5601 -> TCP ->  <YOUR-IP-ADDRESS>/32, 10.0.0.0/24
   - FILEBEAT -> Port 5044 -> TCP -> 10.0.0.0/24

9. Create New Key Pair
    > ssh -i keylocation/keyname.pem ubuntu@yourpublicip

## Docker Setup
1. Update Apt Repos & Auto-Upraade
   > apt update && apt -y upgrade

2. Install all Tank Depencies<br/>
   > apt-get install apt-transport-https ca-certificates curl software-properties-common git

4. Download and add GPG key
   > curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

5. Add Tank Repo
   > add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

6. Update Repo
   > apt-get update

7. Install Docker CE
   > apt-get install -y docker-ce=18.03.1~ce-0~ubuntu

8. Initialise Docker Swarm on Docker Manager Instance
   > docker swarm init --advertise-addr <docker-swarm-ip> (eg. 10.0.0.1) 
   
9. Join Docker Swarm on Docker Workers Instances
   > docker swarm join --token <docker-swarm-token> <docker-swarm-manager-ip>:2377   
   *eg. docker swarm join --token SWMTKN-1-3pu6hszjas19xyp7ghgosyx9k8atbfcr8p2is99znpy26u2lkl-1awxwuwd3z9j1z3puu7rcgdbx 10.0.0.1:2377)*
   
10. Check all nodes joined
    > docker node ls
    
11. Create Docker Volume for Application Stack
    > docker volume create app-vol
    
12. Create Docker Volume for Tank Stack 
    > docker volume create tank-vol
    
13. Create Docker Swarm Overlay Network 
    > docker network create --scope swarm --driver overlay warzone

## Deploy App Stack
 
2. Start Micro-Services**

# Usage
<img src="https://github.com/masterlau/tankswarm/blob/master/docs/iphone-login.jpg" width="25%"><img src="https://github.com/masterlau/tankswarm/blob/master/docs/iphone-ammo.jpg" width="25%"><img src="https://github.com/masterlau/tankswarm/blob/master/docs/iphone-tank.jpg" width="25%"><img src="https://github.com/masterlau/tankswarm/blob/master/docs/iphone-results.jpg" width="25%">

1. Goto the TankSwarm App in your web browser - http://<docker-master-ip-address>/
2. Login with the following credentials, then click "Log Me In" Button

    > username: admin<br/>
    > password: admin
   
3. Fill out Phase 1 input fields to Prepare Ammo, then click "Test Fire" button.
    
4. Review Test Fire Results in the Terminal Console window to ensure expectant results.

5. Fill out Phase 2 Tank Setting input fields, then click "Tank Ready - Fire!" button.

6. View the results in the "Battle Field Intelligence" Grafana charts. 
**Note**: You can also click on the "Laucnh Grafana for Full Metrics" link to see expanded metrics and have full control.





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


Full Credits to those who blazed the trail before me: @direvius
  
