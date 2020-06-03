import { EVENTS, STATUSES } from './types';

export function resolveConfig (options) {
  if (!options.service) {
    throw new Error('No service property was found in options parameter');
  };

  if (options.fuse && typeof options.fuse !== 'string') {
    throw new TypeError('fuse option parameter must be a string');
  };

  if (options.fuse && !options.service.app.firestore) {
    throw new Error('firestore must be available in your firebase project to use fuse option');
  };

  const config = {
    service: options.service
  };

  if (options.fuse) {
    const db = options.service.app.firestore();
    const name = options.fuse;

    config.fuse = {
      collection: db.collection(name),
      docRef: null
    };
  }

  return config;
}

export function resolveStatus (event, payload) {
  if (EVENTS.AUTH_MECH_CREATED) {
    return STATUSES.UNSOLVED;
  }

  if (!payload.user) {
    return STATUSES.SIGNEDOUT;
  }

  return payload.user.emailVerified ? STATUSES.SIGNEDIN : STATUSES.UNVERIFIED;
}

export function resolveUserData (event, payload) {
  if (EVENTS.AUTH_MECH_CREATED) {
    return null;
  }

  if (EVENTS.PASSWORD_UPDATED) {
    return payload.userData;
  }

  if (EVENTS.AUTH_SERVICE_UPDATED || !payload.user) {
    return null;
  }

  const serviceData = {};
  const businessFields = [
    'uid',
    'displayName',
    'email',
    'emailVerified',
    'isAnonymous',
    'phoneNumber',
    'photoURL'
  ];
  businessFields.forEach(field => {
    serviceData[field] = payload.user[field];
  });

  const userData = payload.doc
    ? { ...payload.doc.data(), ...serviceData }
    : serviceData;

  return userData;
}
