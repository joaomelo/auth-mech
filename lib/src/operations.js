export function reauthenticate (service, email, password) {
  // long reaching for EmailAuthProvider class reference
  // to avoid importing the firebase module, sadly classes
  // are not directly available in auth service
  const provider = service
    .app.firebase_
    .auth.EmailAuthProvider;

  const credential = provider
    .credential(email, password);

  return service
    .currentUser
    .reauthenticateWithCredential(credential);
}

export function createOrGetFusedDocRef (user, config) {
  const docRef = config.fuse.collection.doc(user.uid);
  return docRef
    .get()
    .then(doc => {
      let initialData = {};
      // we don't mess with the fused doc data if the document already exists
      if (!doc.exists && config.fuse.onCreate) {
        initialData = { ...config.fuse.onCreate(user) };
      };

      return docRef
        .set(initialData, { merge: true })
        .then(() => docRef);
    });
}
