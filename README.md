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

<img src="https://github.com/masterlau/tankswarm/blob/master/docs/architecture.png"/>

<h1>Setup & Configuration</h1>
<h2>Install Docker</h2>
<ol>
  <li><b>Compute Instances</b>: You can use VM's or Bare Metal Machines to create your Docker Swarm</li>
  <li><b>Network</b>: Ensure your nodes are on the same subnet</li>
  <li><b>Ports</b>: Open the following ports:
     <ul>
       <li>TCP port 2377 for cluster management communications</li>
       <li>TCP and UDP port 7946 for communication among nodes</li>
       <li>UDP port 4789 for overlay network traffic</li>
    </ul>
  </li>
  <li><b>Operating System</b>: Ubuntu Xenial (16.04)</li>
  <li><b>Install Docker (CE) to Nodes</b> (<a href="https://docs.docker.com/install/linux/docker-ce/ubuntu/" target="_blank">Docker Website</a>)
      <ul>
        <li> >sudo apt-get update</li>
        <li> >sudo apt-get install apt-transport-https ca-certificates curl software-properties-common</li>
        <li> >curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -</li>
        <li> >sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"</li>
        <li> >sudo apt-get update</li>
        <li> >sudo apt-get install docker-ce</li>
      </ul>
  </li>
 </ol>
<h2>Configure Docker Swarm</h2> 
  <ol>
    <li><b>Create Docker Swarm Manager</b></li>
    <li> ```function test() {
  console.log("look ma’, no spaces");
  }
```
  </li>
 </ol>
