import { subscribe, publish } from '@joaomelo/bus';

class Mocker {
  constructor () {
    this.__topic = `MOCKER_ON_AUTH_STATE_CHANGED${Date.now()}`;
  }

  onAuthStateChanged (observer) {
    subscribe(this.__topic, observer);
  }

  createUserWithEmailAndPassword (email, password) {
    this.signInWithEmailAndPassword(email, password);
  }

  signInWithEmailAndPassword (email, password) {
    publish(this.__topic, { email });
  }
}

export { Mocker };
