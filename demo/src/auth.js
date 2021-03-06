import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { AuthMech } from '__lib'; // @joaomelo/auth-mech

const fireapp = firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
});

const auth = fireapp.auth();
const authMech = new AuthMech({
  service: auth,
  fuse: {
    name: 'profiles',
    onCreate: user => {
      const pos = user.email.indexOf('@');
      const localPart = user.email.slice(0, pos);
      return {
        localPart
      };
    }
  }
});

export { authMech };
