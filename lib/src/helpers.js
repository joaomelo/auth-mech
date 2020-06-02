function cleanUser (serviceUser) {
  const user = {};

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
    user[field] = serviceUser[field];
  });

  return user;
}

export { cleanUser };
