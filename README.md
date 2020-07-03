# Monitoring Server


## To create SSL-CERT

```sh
service apache2 stop
certbot certonly --standalone -d yourdomain.com -d wss.yourdomain.com
service apache2 start
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl-cert/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl-cert/key.pem
```
