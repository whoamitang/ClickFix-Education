// server.js
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const state = require('./state');

// Default loopback. LAB_EXPOSE=1 flips to 0.0.0.0 and enables /payload.exe.
const HOST = process.env.LAB_EXPOSE === '1' ? '0.0.0.0' : '127.0.0.1';
const PORT = 3000;

// Payload lives next to server.js. Fixed name. No env override.
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

// Payload fetch for lab target. Gated by LAB_EXPOSE=1.
app.get('/payload.exe', (req, res) => {
  if (process.env.LAB_EXPOSE !== '1') {
    return res.status(404).send('not found');
  }
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
  if (process.env.LAB_EXPOSE === '1') {
    console.log(`  /payload.exe   ENABLED (LAB_EXPOSE=1), serving ${PAYLOAD_PATH}`);
  } else {
    console.log(`  /payload.exe   disabled (loopback-only default)`);
  }
});