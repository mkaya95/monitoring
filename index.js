let fs = require('fs');
let geoip = require('geoip-lite')
let useragent = require('useragent')

let privateKey = fs.readFileSync('./ssl-cert/key.pem', 'utf8');
let certificate = fs.readFileSync('./ssl-cert/cert.pem', 'utf8');

let credentials = { key: privateKey, cert: certificate };
let https = require('https');

//pass in your credentials to create an https server
let httpsServer = https.createServer(credentials);
httpsServer.listen(8443);

let WebSocketServer = require('ws').Server;
let wss = new WebSocketServer({
    server: httpsServer
});


let users = {}
let userCount = 0
let userLastID = 0


wss.on('connection', (socket, req) => {
  userCount++

  let id = userLastID++

  let ip = req.headers['x-real-ip'] || req.connection.remoteAddress
  let user = users[id] = {
    id: id,
    host:req.headers['host'],
    ip: ip,
    ipgeo: geoip.lookup(ip),
    ua: useragent.lookup(req.headers['user-agent']).toJSON(),
    date: Date.now(),
    updated: Date.now()
  }
  socket.once('close', () => {
    delete users[id]
    userCount--
  })

  console.log(JSON.stringify(users));
})

wss.on('error', err => console.error(err))
