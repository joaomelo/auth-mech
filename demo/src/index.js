import './styles.css';
import { authMech } from './auth';

authMech.subscribe(payload => {
  const functionsForStatus = {
    UNSOLVED: renderLoading,
    SIGNEDOUT: renderLogin,
    UNVERIFIED: renderUnverified,
    SIGNEDIN: renderSignedIn
  };

  displayEls('.auth', 'none');
  const f = functionsForStatus[payload.status];
  f(payload);
});

// setting up buttons

el('signUp').onclick = () => {
  authMech
    .signUp(val('email'), val('password'))
    .then(result => addMsg(result.message));
};

el('resendEmail').onclick = () => {
  authMech
    .sendEmailVerification()
    .then(result => addMsg(result.message));
};

el('signIn').onclick = () => {
  authMech
    .signIn(val('email'), val('password'))
    .then(result => addMsg(result.message));
};

el('signOut').onclick = () => {
  authMech
    .signOut()
    .then(() => addMsg('user signed out'));
};

el('updateEmail').onclick = () => {
  authMech
    .updateEmail(val('email'), val('password'))
    .then(result => addMsg(result.message));
};

el('updatePassword').onclick = () => {
  authMech
    .updatePassword(val('newPassword'), val('password'))
    .then(result => addMsg(result.message));
};

// routing
function renderLoading () {
  addMsg('loading...');
}

function renderLogin () {
  displayEls('#email', 'block');
  displayEls('#password', 'block');
  displayEls('#signUp', 'inline-block');
  displayEls('#signIn', 'inline-block');
  addMsg('please sign up or sign in');
}

function renderUnverified () {
  displayEls('#resendEmail', 'inline-block');
  addMsg(`please verify ${authMech.state.userData.email}`);
}

function renderSignedIn () {
  displayEls('input', 'block');
  displayEls('#updateEmail', 'inline-block');
  displayEls('#updatePassword', 'inline-block');
  displayEls('#signOut', 'inline-block');
  addMsg(`cool you are in ${authMech.state.userData.email}`);
}

// helpers
function el (id) {
  return document.getElementById(id);
};

function val (id) {
  return el(id).value;
}

function els (query) {
  return Array.from(document.querySelectorAll(query));
};

function addMsg (msgStr) {
  const p = document.createElement('p');
  p.innerText = msgStr;
  el('msg').insertBefore(p, el('msg').firstChild);
};

function displayEls (query, value) {
  els(query).forEach(el => { el.style.display = value; });
}
