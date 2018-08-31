# Goto Directory
cd /var/loadtest

# Create Log File
touch /var/loadtest/phout.log

# Start Metric Beat
service metricbeat start

# Start Logstash
/usr/bin/nohup /usr/share/logstash/bin/logstash --path.settings /etc/logstash/ &

# Get Tank Config Files
curl http://nginx/conf/load.yml > /var/loadtest/load.yml
curl http://nginx/conf/ammo > /var/loadtest/ammo

# Start Yandex Tank
yandex-tank -c /var/loadtest/load.yml
