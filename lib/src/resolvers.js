import { EVENTS, STATUSES } from './types';
import { Mocker } from './mocker';

function resolveConfig (options) {
  const config = {};

  if (!options.service) {
    throw new Error('No service property was found in options parameter');
  };

  config.service = options === 'mock' ? new Mocker() : options.service;

  return config;
}

export function resolveUserData (event, payload) {
  if ([EVENTS.AUTH_MECH_CREATED, EVENTS.USER_SIGNEDOUT].includes(event)) {
    return null;
  }

  if (event === EVENTS.PASSWORD_UPDATED) {
    return payload.userData;
  }

  // from now on
  // or auth changed to signing or PENDING
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

export { resolveOptions };
