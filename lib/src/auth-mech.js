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
      userData: null,
      status: STATUSES.UNSOLVED
    };
    this.__notifyStateChange();
  }

  __linkService () {
    this.options.service.onAuthStateChanged(user => {
      this.state.userData = user ? { ...user } : null;

      if (user) {
        const email = user.email;
        this.state.userData.emailLocalPart = email.substring(0, email.indexOf('@'));
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

  signUp (email, password) {
    return this.options.service
      .createUserWithEmailAndPassword(email, password)
      .then(() => this.sendEmailVerification())
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

  sendEmailVerification () {
    return this.options.service
      .currentUser
      .sendEmailVerification()
      .then(() => {
        return {
          isSuccess: true,
          message: 'email successfully sent'
        };
      })
      .catch(error => error);
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

    return this
      .reauthenticate(password)
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

    return this
      .reauthenticate(password)
      .then(({ user }) => user.updatePassword(newPassword))
      .then(() => {
        return {
          isSuccess: true,
          message: 'password updated'
        };
      })
      .catch(error => error);
  }

  reauthenticate (password) {
    // long reaching for EmailAuthProvider class reference
    // to avoid importing the firebase module, sadly classes
    // are not directly available in auth service
    const provider = this
      .options.service
      .app.firebase_
      .auth.EmailAuthProvider;

    const credential = provider
      .credential(this.state.userData.email, password);

    return this.options.service
      .currentUser
      .reauthenticateWithCredential(credential);
  }
};

export { AuthMech };
