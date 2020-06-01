import './styles.css';
import { authMech } from './auth';

authMech.subscribe(payload => {
  const renderFunctions = {
    UNSOLVED: renderLoading,
    SIGNEDOUT: renderLogin,
    UNVERIFIED: renderUnverified,
    SIGNEDIN: renderSignedIn
  };

  const render = renderFunctions[payload.status];
  render();
});

// setting up buttons
el('signUp').onclick = () => authMech
  .signUp(val('email'), val('password'))
  .then(result => addMsg(result.message));

el('resendEmail').onclick = () => authMech
  .sendEmailVerification()
  .then(result => addMsg(result.message));

el('signIn').onclick = () => authMech
  .signIn(val('email'), val('password'))
  .then(result => addMsg(result.message));

el('signOut').onclick = () => authMech
  .signOut()
  .then(() => addMsg('user signed out'));

el('updateEmail').onclick = () => authMech
  .updateEmail(val('email'), val('password'))
  .then(result => addMsg(result.message));

el('updatePassword').onclick = () => authMech
  .updatePassword(val('newPassword'), val('password'))
  .then(result => addMsg(result.message));

el('set').onclick = () => authMech
  .updateProps({
    preference: val('preference'),
    option: val('option')
  });
// .then(result => addMsg(result.message));

// routing
function renderLoading () {
  displayEls('.auth', 'none');
  addMsg('loading...');
}

function renderLogin () {
  displayEls('.auth', 'none');
  displayEls('#email', 'block');
  displayEls('#password', 'block');
  displayEls('#signUp', 'inline-block');
  displayEls('#signIn', 'inline-block');
  addMsg('please sign up or sign in');
}

function renderUnverified () {
  displayEls('.auth', 'none');
  displayEls('#resendEmail', 'inline-block');
  addMsg(`please verify ${authMech.state.userData.email}`);
}

function renderSignedIn () {
  const email = authMech.state.userData.email;
  displayEls('.auth', 'none');
  displayEls('input', 'block');
  displayEls(['#updateEmail', '#updatePassword', '#signOut', '#set'], 'inline-block');
  addMsg(`signed in as ${email}`);
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

function displayEls (queryParam, value) {
  const queries = Array.isArray(queryParam) ? queryParam : [queryParam];
  queries.forEach(query => {
    els(query).forEach(el => { el.style.display = value; });
  });
}
