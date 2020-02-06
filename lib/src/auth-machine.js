class AuthMachine {
  constructor (authService, authChangeCallbacks = []) {
    this.state = {
      authStatus: 'UNSOLVED',
      authService,
      authChangeCallbacks: Array.isArray(authChangeCallbacks) ? authChangeCallbacks : [authChangeCallbacks]
    };

    this.authService.onAuthStateChanged(this.update.bind(this));
  }

  update (user) {
    this.state.authStatus = user ? 'LOGGEDIN' : 'LOGGEDOUT';

    const callbacks = this.state.authChangeCallbacks;
    const payload = {
      authStatus: this.authStatus,
      user: this.authService.currentUser
    };
    callbacks.forEach(callback => callback(payload));
  }

  get authStatus () {
    return this.state.authStatus;
  }

  get authService () {
    return this.state.authService;
  }
};

export { AuthMachine };
