import { subscribe, publish } from '@joaomelo/bus';

const AUTH_CHANGE = Symbol('AUTH_CHANGE');

class AuthMachine {
  constructor (service) {
    this.setInitialStateAndPublishIt();
    this.saveFireauthAndSetCallback(service);
  }

  setInitialStateAndPublishIt () {
    this.state = {
      status: 'UNSOLVED',
      user: null
    };
    publish(AUTH_CHANGE, { ...this.state });
  }

  saveFireauthAndSetCallback (service) {
    this.service = service;
    this.service.onAuthStateChanged(this.update.bind(this));
  };

  subscribe (callback) {
    return subscribe(AUTH_CHANGE, callback, true);
  }

  update (user) {
    this.state.status = user ? 'SIGNIN' : 'SIGNOUT';
    this.state.user = user;
    publish(AUTH_CHANGE, { ...this.state });
  }

  get status () {
    return this.state.status;
  }

  get user () {
    return this.state.user;
  }
};

export { AuthMachine };
