# Auth-mech

Complements Firebase auth with opinionated approaches to observation of auth state changes, treat email verification as default and fuse user data from auth with an arbitrary collection in Firestore.

## Motivation

[Firebase](https://firebase.google.com/) is awesome. It makes easier for solo developers and small teams to build software with agility. One of its main conveniences is the authentication module. You can check everything about it [here](https://firebase.google.com/docs/auth).

After a few times building login UI with Firebase auth, I found myself repeating code to wrap or complement Firebase auth features. I decided to write this library to improve reusability and reduce bugs mainly to these use cases:

### General Observability of Authentication State.

Firebase auth offers a `onAuthStateChanged` method to observe state changes. But if you need to check on those from many points in app code you will need to implement some sort of central event architecture. You will need to create logic to transform the parameters values from onAuthStateChanged into status values. Is to given, for example, if the user is logged off or the auth engine didn't resolve the user yet.   

### Opinionated Security Measures

Although not enforced by Firebase, i find important to avoid abusing behavior from malicious users to aks for email verification on sign up and email changes. Auth-mech also demands re-authentication at every email and password changes.

### Auto Link to a Firestore collection

*THIS FEATURE IS STILL IN DEVELOPMENT, DO NOT CONSIDER IT YET AS REASON TO USE THE LIBRARY.*

Firebase auth is not the best of places to store user like preferences or profile. To do that you will need to create a collection in Firestore. Auth-mech takes the heavy lifting abstracting a fusion between the auth engine and the given collection. 

But code is the more eloquent way to explain all this. Let me show how to get started.

## Getting Started

Install with npm.

    npm install @joaomelo/auth-mech

First, initialize firebase as usual then add an additional step to create an auth-mech instance. The AuthMech's constructor takes as only parameter a config object. The service property of that object is the place to pass the reference to the Firebase auth object. See:

``` js
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { AuthMech } from '@joaomelo/auth-mech';

const fireApp = firebase.initializeApp({
  // config data
});

authMech = new AuthMech({
  service: fireApp.auth()
});
export { authMech }
```

Now you are good to go about using auth-mech features 😏.

## Reading Auth State

Auth-mech abstracts four auth states: `'UNSOLVED'`, `'SIGNEDOUT'`, `'UNVERIFIED'`, `'SIGNEDIN'`. 

The first one is the default initial state. It will hold until Firebase auth resolves the login status. `'UNSOLVED'` is useful to control a start loading screen, for example. The others states are determined by the most recent user object provided by Firebase auth. 

While `'SIGNEDOUT'` value is quite obvious, the choice between `'UNVERIFIED'` and `'SIGNEDIN'` is determined by if the current user verified its email. That is useful, for example, for routing. You can send users to a pending verifications email screen or the default signed in page.

There are two ways to access the auth status: subscribing to auth state changes or synchronously reading the most recent state in a property on the AuthMech instance. 

### Subscribing to Auth Changes

To listen to auth state changes, you pass a observer function to the `subscribe` method in the AuthMech instance. The current user data and status values will be passed inside a payload object to the observer functions every time auth state changes. 

The example bellow is adapted from the demo app available in the library (repository)[https://github.com/joaomelo/auth-mech]. It renders adequate Html depending on the state.

``` js
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { AuthMech } from '@joaomelo/auth-mech'

const fireapp = firebase.initializeApp({
  // config data
});

const authMech = new AuthMech({ 
  service: fireapp.auth() 
});

authMech.subscribe(payload => {
  const renderFunctions = {
    UNSOLVED: renderLoading,
    SIGNEDOUT: renderLogin,
    UNVERIFIED: renderUnverified,
    SIGNEDIN: renderSignedIn
  };

  const render = renderFunctions[payload.status];
  render(payload);
});
```

The `subscribe` method returns an `unsubscribe` function. You can call it to terminate the contract.

### An Auth State Store

For some reason you might not want to read data from a asynchronous event driven approach like youwe did with the subscribe `method`.

Maybe you just need the last user data to show a message or if you are building reactive UIs you want to proxy setter and getters like the Vue framework does.

For those cases the AuthMech instance has a `state` property that works like a data store. Inside that property you will always find an `userData` and `status` sub-properties updated with the latest auth state.

Building upon the last section example, a function to render a simple unverified user email screen could be like that. 

``` js
// initialization code
const authMech = new AuthMech({ 
  service: fireapp.auth() 
});
// ...
// after 'UNVERIFIED' state is determined 
// this function could be called
function renderUnverified () {
  const email = authMech.state.userData.email;
  const el = document.getElementById('container')
  el.innerHTML = `
    <button id="resendEmail">
      Resend Email
    </button>      
    <p>please verify ${email}</p>  
  `;
}
```

The `userData` object will hold what the standard Firebase auth [user](https://firebase.google.com/docs/reference/js/firebase.User#properties) would, plus a `emailLocalPart` property with the string email part before the "@" char. The userData is a simple data object without any methods.

# Auth Operations

Auth-mech build a few auth operations on top of Firebase auth. Nothing fancy, but anyhow reduce repetition between apps. 

## Sign Methods with Email Verification

The first ones provided in `signUp` and `signIn` methods. They take email and password strings as parameters and return a Promise that will resolve in a object with a message property and a `isSuccess` property if no error happened.

SignUp will by default send a email verification. Until the user confirms his email, the auth state will be set to `'UNVERIFIED'` after successful `signIn`.

If you ever need to send that email again, just call the `sendEmailVerification` method. It too will return a Promise that will resolve in a object with a message property.

`AuthMech` instances also exposes a signOut method that will do exactly what Firebase auth does: sign out the user and return a Promise.

If we had a page with buttons for those operations we could set their click behavior to something like this.

``` js
// helper functions
const el = id => document.getElementById(id);
const val = id => el(id).value;
const addMsg = str => { el('msg').innerText = str; } ;

// set buttons to take advantage if AuthMech methods
// and log the operations resulting messages 
el('signUp').onclick = () => authMech
  .signUp(getVal('email'), getVal('password'))
  .then(result => addMsg(result.message));

el('resendEmail').onclick = () => authMech
  .sendEmailVerification()
  .then(result => addMsg(result.message));

el('signIn').onclick = () => authMech
  .signIn(getVal('email'), getVal('password'))
  .then(result => addMsg(result.message));

el('signOut').onclick = () => authMech
  .signOut()
  .then(() => addMsg('user signed out'));
```

## Updating Email Credentials

Firebase Auth supports updating email and password without providing user password. It maybe demands re-authentication based on the last time the user signed in.

I find that behavior a little unpredictable and also think that users should also confirm password when doing those updates.

AuthMech instances provide `updateEmail` and `updatePassword` methods. They take the new email or password string as first parameter and the current password as second.

They will always attempt a re-authentication before updating and return a Promise resolving in that typical object with a message property and eventually a isSuccess property if everything went alright.

updateEmail will also take advantage of Firebase User `verifyBeforeUpdateEmail` method. That is, the email will just really change after the user confirms an email message sent to her.

As in our last example let's exercise how this methods could be implemented.

``` js
// helper functions
const el = id => document.getElementById(id);
const val = id => el(id).value;
const addMsg = str => { el('msg').innerText = str; } ;

el('updateEmail').onclick = () => authMech
  .updateEmail(getVal('email'), getVal('password'))
  .then(result => addMsg(result.message));

el('updatePassword').onclick = () => authMech
  .updatePassword(getVal('newPassword'), getVal('password'))
  .then(result => addMsg(result.message));
```

## Keep More User Data in Firestore
*THIS FEATURE IS STILL IN DEVELOPMENT, DO NOT USE IT YET.*

The auth service has constraints that make it a non ideal service to handle user preferences. If you choose [Firestore](https://firebase.google.com/docs/firestore) to manage that extra user data, auth-mech can give you a hand with that. It make sure users have a corresponding document in the Firestore collection of your choice.

The AuthMech constructor accepts a optional second parameter. You can pass a options object with the property `pushTo` with a Firestore collection reference as value. By activating this behavior, every time a user Login the AuthMech will check if exists a document on that collection with the same id as the user. If the document isn't found, the AuthMech will create it with an `userId` and `email` fields filled. Let's see that in code:

    import * as firebase from 'firebase/app';
    import 'firebase/auth';
    import 'firebase/firestore';
    import { AuthMech } from @joaomelo/auth-mech

    const fireapp = firebase.initializeApp({
      // config data
    });

    const auth = fireapp.auth();
    const db = fireapp.firestore();
    const profiles = db.collection('profiles');

    const authMech = new AuthMech(auth, { pushTo: profiles });
    export { authMech };

# Firebase is Still There

Firebase auth is a powerful library and is reaseonable to asume that you will need to use it even if installing auth-mech library. 

You can always export tha auth instance from wheteaver module you are initializing Firebase or, for conviniece sake access it from the AuthMech instance. If it is the case, it kept inside the `options` property, like so:

``` js
const fireauth = authMech.options.service;

// here do advance stuff with fireauth methods 
// ...
```

# Using the Demo

There is a demo app you can play to explore what I said here. Start by cloning the repository.

    git clone https://github.com/joaomelo/auth-mech.git

Create a `demo.env` file inside the `demo/config` folder with the variables assignments bellow. Replace the values with the real ones for your firebase project.

    FIREBASE_API_KEY=foobar
    FIREBASE_AUTH_DOMAIN=foobar.firebaseapp.com
    FIREBASE_DATABASE_URL=https://foobar.firebaseio.com
    FIREBASE_PROJECT_ID=foobar
    FIREBASE_STORAGE_BUCKET=foobar.appspot.com
    FIREBASE_MSG_SENDER_ID=foobar
    FIREBASE_APP_ID=1:foobar

Then, install the dependencies and run the start script:

    npm install
    npm start

Thank you and have fun 🎉.

## License

Made by [João Melo](https://twitter.com/joaomeloplus) and licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
