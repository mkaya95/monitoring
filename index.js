// Load required modules
const fs = require('fs');
const https = require('https');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const WebSocketServer = require('ws').Server;

// Load SSL credentials
const privateKey = fs.readFileSync('./ssl-cert/key.pem', 'utf8');
const certificate = fs.readFileSync('./ssl-cert/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials);
const PORT = 8443;
httpsServer.listen(PORT, () => {
  console.log(`HTTPS server listening on port ${PORT}`);
});

// Initialize WebSocket server
const wss = new WebSocketServer({ server: httpsServer });

// In-memory user store
const users = {};
let userCount = 0;
let lastUserId = 0;

// Handle new WebSocket connections
wss.on('connection', (socket, req) => {
  const userId = lastUserId++;
  userCount++;

  const ip =
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown';

  const user = {
    id: userId,
    host: req.headers['host'],
    ip: ip,
    ipgeo: geoip.lookup(ip),
    ua: useragent.lookup(req.headers['user-agent']).toJSON(),
    date: Date.now(),
    updated: Date.now()
  };

  users[userId] = user;

  console.log(`User connected (ID: ${userId})`);
  console.log(JSON.stringify(user, null, 2));

  socket.once('close', () => {
    delete users[userId];
    userCount--;
    console.log(`User disconnected (ID: ${userId})`);
  });
});

// Handle WebSocket errors
wss.on('error', (err) => {
  console.error('WebSocket error:', err);
});
