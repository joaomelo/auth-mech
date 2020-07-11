import './styles.css';
import { authMech } from './auth';

authMech.subscribe(payload => {
  const renderFunctions = {
    UNSOLVED: renderLoading,
    SIGNEDOUT: renderLogin,
    PENDING: renderPENDING,
    SIGNEDIN: renderSignedIn
  };

  const render = renderFunctions[payload.status];
  render();
});

// setting up buttons
el('signUp').onclick = () => authMech
  .signUp(getVal('email'), getVal('password'))
  .then(() => addMsg('verification email sent'))
  .catch(error => addMsg(error.message));

el('resendEmail').onclick = () => authMech
  .sendEmailVerification()
  .then(() => addMsg('email sent'));

el('signIn').onclick = () => authMech
  .signIn(getVal('email'), getVal('password'))
  .then(() => addMsg('signed in'))
  .catch(error => addMsg(error.message));

el('signOut').onclick = () => authMech
  .signOut()
  .then(() => addMsg('user signed out'));

el('updateEmail').onclick = () => authMech
  .updateEmail(getVal('email'), getVal('password'))
  .then(() => addMsg('email verification sent'))
  .catch(error => addMsg(error.message));

el('updatePassword').onclick = () => authMech
  .updatePassword(getVal('newPassword'), getVal('password'))
  .then(() => addMsg('password updated'))
  .catch(error => addMsg(error.message));

el('set').onclick = () => authMech
  .updateProps({
    preference: getVal('preference'),
    option: getVal('option')
  })
  .then(() => addMsg('props updated'))
  .catch(error => addMsg(error.message));

// routing
function renderLoading () {
  resetUi();
  addMsg('loading...');
}

function renderLogin () {
  resetUi();
  displayEls(['#email', '#password'], 'block');
  displayEls(['#signUp', '#signIn'], 'inline-block');
  addMsg('please sign up or sign in');
}

function renderPENDING () {
  resetUi();
  displayEls('#resendEmail', 'inline-block');
  addMsg(`please verify ${authMech.state.userData.email}`);
}

function renderSignedIn () {
  resetUi();

  displayEls('input', 'block');
  displayEls(['#updateEmail', '#updatePassword', '#signOut', '#set'], 'inline-block');

  const data = authMech.state.userData;
  data.preference && setVal('preference', data.preference);
  data.option && setVal('option', data.option);

  addMsg(`signed in as ${data.email}`);
}

// helpers
function el (id) {
  return document.getElementById(id);
};

function getVal (id) {
  return el(id).value;
}

function setVal (id, value) {
  el(id).value = value;
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

function resetUi () {
  displayEls('.auth', 'none');
  els('input').forEach(input => { input.value = ''; });
}
