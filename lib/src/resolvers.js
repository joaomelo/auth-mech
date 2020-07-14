import { Mocker } from './mocker';

function resolveConfig (options) {
  const config = {};

  if (!options.service) {
    throw new Error('No service property was found in options argument');
  };

  config.service = options.service === 'mock' ? new Mocker() : options.service;

  return config;
}

export function resolveUserData (user) {
  if (!user) return null;

  const userData = {};
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
    userData[field] = user[field];
  });

  return userData;
}

export { resolveConfig };
