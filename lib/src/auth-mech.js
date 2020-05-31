import { subscribe, publish } from '@joaomelo/bus';
import { EVENTS, STATUSES } from './types';

class AuthMech {
  constructor (options) {
    if (!(options && options.service)) {
      throw new Error('No service property was found in options parameter');
    };

    this.__setInitialStateAndPublishIt(options);
    this.__linkService();
  }

  __setInitialStateAndPublishIt (options) {
    this.options = options;
    this.state = {
      user: null,
      status: STATUSES.UNSOLVED
    };
    this.__notifyStateChange();
  }

  __linkService () {
    this.options.service.onAuthStateChanged(user => {
      this.state.user = user ? { ...user } : null;

      if (user) {
        const email = user.email;
        this.state.user.emailLocalPart = email.substring(0, email.indexOf('@'));
        this.state.status = user.emailVerified ? STATUSES.SIGNEDIN : STATUSES.UNVERIFIED;
      } else {
        this.state.status = STATUSES.SIGNEDOUT;
      }

      this.__notifyStateChange();

      // if (this.config.pushTo && user) {
      //   this.__checkIfNewAndPushUserToCollection(user, this.config.pushTo);
      // }
    });
  }

  __notifyStateChange () {
    publish(EVENTS.AUTH_STATE_CHANGED, { ...this.state });
  }

  __checkIfNewAndPushUserToCollection (user, collection) {
    const docRef = collection.doc(user.uid);
    docRef.get().then(doc => {
      if (!doc.exists) {
        docRef.set({ userId: user.uid, email: user.email });
      }
    });
  }

  subscribe (observer) {
    return subscribe(EVENTS.AUTH_STATE_CHANGED, observer, true);
  }
};

export { AuthMech };
