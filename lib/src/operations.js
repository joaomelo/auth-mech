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