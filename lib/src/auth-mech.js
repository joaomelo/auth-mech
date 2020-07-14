import { subscribe, publish } from '@joaomelo/bus';
import { EVENTS, STATUSES } from './types';
import { resolveConfig, resolveUserData } from './resolvers';
import { reauthenticate } from './operations';

class AuthMech {
  constructor (options) {
    const KEY = Date.now();
    this.__stateChangedTopic = `AUTH_STATE_CHANGED_${KEY}`;
    this.__userCreatedTopic = `USER_CREATED_${KEY}`;
    this.__userUpdatedTopic = `USER_UPDATED_${KEY}`;

    this.trigger(EVENTS.AUTH_MECH_CREATED);

    if (options) {
      this.connect(options);
    };
  }

  connect (options) {
    if (this.config) throw new Error('cannot invoke connect method on an already connected instance');
    this.config = resolveConfig(options);
    this.linkService();
  }

  linkService () {
    const service = this.config.service;
    service.onAuthStateChanged(user => {
      if (user) {
        const event = user.emailVerified
          ? EVENTS.USER_SIGNEDIN
          : EVENTS.UNVERIFIED_USER_SIGNEDIN;
        this.trigger(event, user);
      } else {
        this.trigger(EVENTS.USER_SIGNEDOUT);
      }
    });
  }

  trigger (event, payload) {
    const oldUserData = this.userData;
    const oldStatus = this.status;

    switch (event) {
      case EVENTS.AUTH_MECH_CREATED:
        this.status = STATUSES.UNSOLVED;
        this.userData = null;
        break;

      case EVENTS.USER_SIGNEDIN:
        this.status = STATUSES.SIGNEDIN;
        this.userData = resolveUserData(payload);
        break;

      case EVENTS.UNVERIFIED_USER_SIGNEDIN:
        this.status = STATUSES.PENDING;
        this.userData = resolveUserData(payload);
        break;

      case EVENTS.USER_SIGNEDOUT:
        this.status = STATUSES.SIGNEDOUT;
        this.userData = null;
        break;

      default:
        throw new Error('trigger method called with invalid event');
    }

    const stateChangedPayload = {
      status: this.status,
      userData: this.userData,
      oldStatus,
      oldUserData
    };

    publish(this.__stateChangedTopic, stateChangedPayload);
  }

  subscribe (observer) {
    return subscribe(this.__stateChangedTopic, observer, true);
  }

  signUp ({ email, password }) {
    const service = this.config.service;
    return service
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        const serviceUser = service.currentUser;
        serviceUser.sendEmailVerification();
      });
  }

  signIn ({ email, password }) {
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

  sendEmailVerification () {
    return this.config.service.currentUser.sendEmailVerification();
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
