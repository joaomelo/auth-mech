import { subscribe, publish } from '@joaomelo/bus';

class Mocker {
  constructor () {
    this.__topic = `MOCKER_ON_AUTH_STATE_CHANGED${Date.now()}`;
    this.updateState();
  }

  onAuthStateChanged (observer) {
    subscribe(this.__topic, observer, true);
  }

  updateState (user) {
    this.currentUser = user || null;
    publish(this.__topic, user);
  }

  createUserWithEmailAndPassword (email, password) {
    return this.signInWithEmailAndPassword(email, password);
  }

  signInWithEmailAndPassword (email, password) {
    if (email.includes('error')) {
      return Promise.reject(email);
    }

    const user = {
      email,
      emailVerified: !email.includes('pending'),
      sendEmailVerification: () => Promise.resolve()
    };

    this.updateState(user);
    return Promise.resolve(user);
  }

  signOut () {
    this.updateState();
  }
}

export { Mocker };
