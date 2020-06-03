import { subscribe, publish } from '@joaomelo/bus';
import { EVENTS } from './types';
import { resolveConfig, resolveStatus, resolveUserData } from './resolvers';
import { sendEmailVerification, reauthenticate } from './operations';

class AuthMech {
  constructor (options) {
    this.config = resolveConfig(options);

    this.__notify(EVENTS.AUTH_MECH_CREATED);
    this.__linkService();
  }

  __linkService () {
    this.options.service.onAuthStateChanged(user => {
      if (!this.options.fuse) {
        this.__notify(EVENTS.AUTH_SERVICE_UPDATED, { user });
      }

      if (this.options.fuse && !user) {
        this.config.fuse.docRef = null;
        this.__notify(EVENTS.AUTH_SERVICE_UPDATED, { user });
      }

      if (this.options.fuse && user) {
        const docRef = this.config.fuse.collection.doc(user.uid);
        this.config.fuse.docRef = docRef;

        docRef
          .set({}, { merge: true }) // creates document without affecting any data if already exists
          .then(() => { // avoids double trigger if set concludes after the first snapshot
            this.config.fuse.docRef.onSnapshot(doc => {
              this.__notify(EVENTS.FUSE_SERVICE_UPDATED, { user, doc });
            });
          });
      }
    });
  }

  __notify (event, payload = {}) {
    this.state.status = resolveStatus(event, payload);
    this.state.userData = resolveUserData(event, payload);
    publish(EVENTS.AUTH_STATE_CHANGED, { ...this.state });
  }

  subscribe (observer) {
    return subscribe(EVENTS.AUTH_STATE_CHANGED, observer, true);
  }

  signUp (email, password) {
    return this.options.service
      .createUserWithEmailAndPassword(email, password)
      .then(() => sendEmailVerification(this.config.service))
      .catch(error => error);
  }

  signIn (email, password) {
    return this.options.service
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        return {
          isSuccess: true,
          message: 'user signed in'
        };
      })
      .catch(error => error);
  }

  signOut () {
    return this.options.service.signOut();
  }

  update (updateData, password) {
    const promises = [];

    if (updateData.newEmail) {
      promises.push(this.updateEmail(updateData.newEmail, password));
    }

    if (updateData.newPassword) {
      promises.push(this.updatePassword(updateData.newPassword, password));
    }

    if (this.config.fuse) {
      const propsKeys = Object.keys(updateData).filter(key => !['email', 'password'].includes(key));
      if (propsKeys.length > 0) {
        const propsData = {};
        propsKeys.forEach(k => { propsData[k] = updateData[k]; });
        promises.push(this.updateProps(propsData));
      }
    }

    return Promise.all(promises);
  }

  updateEmail (newEmail, password) {
    const currentEmail = this.state.userData.email;

    if (newEmail === currentEmail) {
      return Promise.resolve({
        isSuccess: false,
        message: 'new email must differ from current'
      });
    }

    if (!password) {
      return Promise.resolve({
        isSuccess: false,
        message: 'must provide current password to confirm'
      });
    }

    const service = this.config.service;
    const email = this.state.userData.email;
    return reauthenticate(service, email, password)
      .then(({ user }) => user.verifyBeforeUpdateEmail(newEmail))
      .then(() => {
        return {
          isSuccess: true,
          message: 'email will update after verification'
        };
      })
      .catch(error => error);
  }

  updatePassword (newPassword, password) {
    if (newPassword === password) {
      return Promise.resolve({
        isSuccess: false,
        message: 'new password must differ from current'
      });
    }

    if (!password) {
      return Promise.resolve({
        isSuccess: false,
        message: 'must provide current password to confirm'
      });
    }

    const service = this.config.service;
    const email = this.state.userData.email;
    return reauthenticate(service, email, password)
      .then(({ user }) => user.updatePassword(newPassword))
      .then(() => {
        this.__notify(EVENTS.PASSWORD_UPDATED, { ...this.state });
        return {
          isSuccess: true,
          message: 'password updated'
        };
      })
      .catch(error => error);
  }

  updateProps (props) {
    if (!this.options.fuse) {
      throw new Error('Props updates are available only when fuse option is activated');
    };

    // onSnapshot will see the update
    // and trigger the notification
    return this.options.docRef.update(props);
  }
};

export { AuthMech };
