import { EVENTS, STATUSES } from './types';

export function resolveConfig (options) {
  if (!options.service) {
    throw new Error('No service property was found in options parameter');
  };

  if (options.fuse && typeof options.fuse.name !== 'string') {
    throw new TypeError('fuse.collection is required option of the string type');
  };

  if (options.fuse && !options.service.app.firestore) {
    throw new Error('firestore must be available in your firebase project to use fuse option');
  };

  if (options.fuse && options.fuse.onCreate && typeof options.fuse.onCreate !== 'function') {
    throw new TypeError('fuse.onCreate option must be a function');
  };

  const config = {
    service: options.service
  };

  if (options.fuse) {
    const db = options.service.app.firestore();
    const name = options.fuse.name;

    config.fuse = {
      collection: db.collection(name),
      onCreate: options.fuse.onCreate || null,
      docRef: null
    };
  }

  return config;
}

export function resolveStatus (event, payload) {
  if (event === EVENTS.AUTH_MECH_CREATED) {
    return STATUSES.UNSOLVED;
  }

  if (event === EVENTS.USER_SIGNEDOUT) {
    return STATUSES.SIGNEDOUT;
  }

  return payload.user.emailVerified
    ? STATUSES.SIGNEDIN
    : STATUSES.UNVERIFIED;
}

export function resolveUserData (event, payload) {
  if ([EVENTS.AUTH_MECH_CREATED, EVENTS.USER_SIGNEDOUT].includes(event)) {
    return null;
  }

  if (event === EVENTS.PASSWORD_UPDATED) {
    return payload.userData;
  }

  // from now on
  // or auth changed to signing or unverified
  // or fused user was updated
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

  if (event === EVENTS.UNFUSED_USER_SIGNEDIN) {
    return serviceData;
  }

  // surely a fused user signed in or was updated
  return { ...payload.doc.data(), ...serviceData };
}
