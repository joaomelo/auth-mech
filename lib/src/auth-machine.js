class AuthMachine {
  constructor (service, authChangeCallbacks = []) {
    this.state = {
      status: 'UNSOLVED',
      user: null,
      service,
      authChangeCallbacks: Array.isArray(authChangeCallbacks) ? authChangeCallbacks : [authChangeCallbacks]
    };

    this.service.onAuthStateChanged(this.update.bind(this));
  }

  update (user) {
    this.state.status = user ? 'SIGNIN' : 'SIGNOUT';
    this.state.user = user;

    const callbacks = this.state.authChangeCallbacks;
    const payload = {
      status: this.status,
      user: this.service.currentUser
    };
    callbacks.forEach(callback => callback(payload));
  }

  get status () {
    return this.state.status;
  }

  get user () {
    return this.state.user;
  }

  get service () {
    return this.state.service;
  }
};

export { AuthMachine };
