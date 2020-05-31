import './styles.css';
import { authMech } from './auth';

authMech.subscribe(payload => {
  const functionsForStatus = {
    UNSOLVED: renderLoading,
    SIGNEDOUT: renderLogin,
    UNVERIFIED: renderUnverified,
    SIGNEDIN: renderSignedIn
  };

  const f = functionsForStatus[payload.status];
  f(payload);
});

// routing
function renderLoading () {
  addMsg('loading...');
}

function renderLogin () {
  addMsg('please log in');
}

function renderUnverified () {
  addMsg('please verify your email');
}

function renderSignedIn () {
  addMsg('cool you are in');
}

// helpers
function el (id) {
  return document.getElementById(id);
};

function addMsg (msgStr) {
  const p = document.createElement('p');
  p.innerText = msgStr;
  el('msg').insertBefore(p, el('msg').firstChild);
};
