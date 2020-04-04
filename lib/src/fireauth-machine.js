import { subscribe, publish } from '@joaomelo/bus';

const AUTH_CHANGE = Symbol('AUTH_CHANGE');

class FireauthMachine {
  constructor (service, options) {
    this.__setInitialStateAndPublishIt(options);
    this.__saveFireauthAndSetCallback(service);
  }

  __setInitialStateAndPublishIt (options = {}) {
    this.state = {
      status: 'UNSOLVED',
      user: null
    };

    this.config = {
      pushTo: options.pushTo
    };

    publish(AUTH_CHANGE, { ...this.state });
  }

  __saveFireauthAndSetCallback (service) {
    this.service = service;
    this.service.onAuthStateChanged(this.__update.bind(this));
  };

  __update (user) {
    this.state.status = user ? 'SIGNIN' : 'SIGNOUT';
    this.state.user = user;
    publish(AUTH_CHANGE, { ...this.state });

    if (this.config.pushTo && user) {
      const docRef = this.config.pushTo.doc(user.uid);
      docRef.get().then(doc => {
        if (!doc.exists) {
          docRef.set({ email: user.email });
        }
      });
    }
  }

  subscribe (callback) {
    return subscribe(AUTH_CHANGE, callback, true);
  }

  get status () {
    return this.state.status;
  }

  get user () {
    return this.state.user;
  }
};

export { FireauthMachine };
