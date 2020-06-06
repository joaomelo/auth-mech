import { subscribe, publish } from '@joaomelo/bus';
import { EVENTS } from './types';
import { resolveConfig, resolveStatus, resolveUserData } from './resolvers';
import { reauthenticate } from './operations';

class AuthMech {
  constructor (options) {
    this.config = resolveConfig(options);

    this.__reactToStateChange(EVENTS.AUTH_MECH_CREATED);
    this.__linkService();
  }

  __linkService () {
    this.config.service.onAuthStateChanged(user => {
      if (!user) return this.__reactToStateChange(EVENTS.USER_SIGNEDOUT);
      if (!this.config.fuse) return this.__reactToStateChange(EVENTS.UNFUSED_USER_SIGNEDIN, { user });

      // from now on we have a fused user signed in
      const docRef = this.config.fuse.collection.doc(user.uid);
      this.config.fuse.docRef = docRef;
      docRef
        .set({}, { merge: true }) // creates document without affecting any data if already exists
        .then(() => { // avoids double trigger if set concludes after the first snapshot
          this.config.fuse.docRef.onSnapshot({
            next: doc => this.__reactToStateChange(EVENTS.FUSED_USER_SIGNEDIN_OR_UPDATED, { user, doc }),
            error: error => console.error(error) // on sign out won't break app workflow
          });
        });
    });
  }

  __reactToStateChange (event, payload = {}) {
    if (event === EVENTS.USER_SIGNEDOUT && this.config.fuse) {
      this.config.fuse.docRef = null;
    }

    this.state = {
      status: resolveStatus(event, payload),
      userData: resolveUserData(event, payload)
    };

    publish(EVENTS.AUTH_STATE_CHANGED, { ...this.state });
  }

  subscribe (observer) {
    return subscribe(EVENTS.AUTH_STATE_CHANGED, observer, true);
  }

  signUp (email, password) {
    const service = this.config.service;
    return service
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        const serviceUser = service.currentUser;
        serviceUser.sendEmailVerification();
      });
  }

  signIn (email, password) {
    return this.config.service.signInWithEmailAndPassword(email, password);
  }

  signOut () {
    return this.config.service.signOut();
  }

  updateEmail (newEmail, password) {
    const currentEmail = this.state.userData.email;

    if (newEmail === currentEmail) throw new Error('new email must differ from current');
    if (!password) throw new Error('must provide current password to confirm');

    const service = this.config.service;
    const email = this.state.userData.email;
    return reauthenticate(service, email, password)
      .then(({ user }) => user.verifyBeforeUpdateEmail(newEmail));
  }

  updatePassword (newPassword, password) {
    if (newPassword === password) throw new Error('new password must differ from current');
    if (!password) throw new Error('must provide current password to confirm');

    const service = this.config.service;
    const email = this.state.userData.email;
    return reauthenticate(service, email, password)
      .then(({ user }) => user.updatePassword(newPassword));
  }

  updateProps (props) {
    if (!this.config.fuse) {
      throw new Error('Unable to find fuse configuration');
    };

    // onSnapshot will see the update
    // and trigger the state change
    return this.config.fuse.docRef.update(props);
  }
};

export { AuthMech };
