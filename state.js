// state.js
const VALID_STATES = ['idle', 'armed', 'connected'];

let currentState = 'idle';
const session = {
  id: 'local-1',
  startedAt: Date.now(),
};

function getState() {
  return currentState;
}

function setState(next) {
  if (!VALID_STATES.includes(next)) {
    throw new Error(`invalid state: ${next}`);
  }
  currentState = next;
  return currentState;
}

function snapshot() {
  return {
    sessionId: session.id,
    state: currentState,
    updatedAt: Date.now(),
  };
}

module.exports = {
  VALID_STATES,
  getState,
  setState,
  snapshot,
};