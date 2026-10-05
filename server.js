// server.js
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const state = require('./state');

// Binds all interfaces so the target on the same network can reach it.
// Lab segment only. Do not expose to internet.
const HOST = '0.0.0.0';
const PORT = 3000;

// Payload lives next to server.js. Fixed name.
const PAYLOAD_PATH = path.join(__dirname, 'payload.exe');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Push state to every connected page.
function broadcast() {
  io.emit('state', state.snapshot());
}

// Page 1.
app.get('/verify', (req, res) => {
  res.render('verify', { state: state.snapshot() });
});

// Page 2. Hard gate: only reachable when state is 'connected'.
app.get('/complete', (req, res) => {
  if (state.getState() !== 'connected') {
    return res.status(403).render('complete', { state: state.snapshot() });
  }
  res.render('complete', { state: state.snapshot() });
});

// Page 3. Private local dashboard.
app.get('/lab-control', (req, res) => {
  res.render('lab-control', { state: state.snapshot() });
});

// Checkbox handler. idle -> armed. Does not unlock /complete.
app.post('/verify/check', (req, res) => {
  if (state.getState() === 'idle') {
    state.setState('armed');
    broadcast();
  }
  res.json(state.snapshot());
});

// Lab control actions.
app.post('/lab-control/establish', (req, res) => {
  state.setState('connected');
  broadcast();
  res.json(state.snapshot());
});

app.post('/lab-control/reset', (req, res) => {
  state.setState('idle');
  broadcast();
  res.json(state.snapshot());
});

// Payload fetch for lab target. Served on the lab network.
app.get('/payload.exe', (req, res) => {
  res.download(PAYLOAD_PATH, 'payload.exe', (err) => {
    if (err) {
      console.error('payload send failed:', err.message);
    }
  });
});

io.on('connection', (socket) => {
  socket.emit('state', state.snapshot());
});

server.listen(PORT, HOST, () => {
  console.log(`clickfix-sim listening on http://${HOST}:${PORT}`);
  console.log(`  /verify        page 1`);
  console.log(`  /complete      page 2 (gated)`);
  console.log(`  /lab-control   page 3 (private)`);
  console.log(`  /payload.exe   serving ${PAYLOAD_PATH}`);
});