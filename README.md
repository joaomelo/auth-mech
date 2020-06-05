# Auth-mech

Complements Firebase auth with opinionated approaches to state change observation, treat email verification as default, and fuse user data from the auth engine and an arbitrary Firestore collection.

# Motivation

[Firebase](https://firebase.google.com/) gives agility to solo developers and small teams. One of its main conveniences is the [authentication module](https://firebase.google.com/docs/auth).

After a few times building login UI with Firebase auth, I found myself repeating code to wrap or complement its features. I decided to write this library to improve reusability and reduce bugs surrounding the following use cases.

## Fuse Data with Firestore

Firebase auth holds some user properties but is not the best of places to expand [storage of user preferences](https://firebase.google.com/docs/auth/users#user_properties). A nice alternative is to use a Firestore collection, but now you have to sync two datasets. Auth-mech abstracts a data fusion between the auth engine and a given Firestore collection. 

## Observability of Authentication State.

Firebase auth offers an `onAuthStateChanged` method to observe state changes. But if you need to check on that from many points, soon you will need to implement some event architecture to deal with subscriptions and transform context into actual status values. Auth-mech provides a `subscribe` method that will notify observers with updated status and user data. 

## Opinionated Security Measures

Although not enforced by Firebase, Auth-mech always asks for email verification on sign up and email updates. The library also demands re-authentication at every email and password change.

But code is the more eloquent way to explain all this. Let me show how to get started.

# Getting Started

Install with npm.

    npm install @joaomelo/auth-mech

First, initialize firebase as usual then add an additional step to create an `AuthMech` instance. The `AuthMech` class constructor takes an options object as the only parameter. The service property of that object is the place to pass the reference to Firebase auth. Take a look:

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

Now you are good to go about using Auth-mech features 😏.

# Reading Auth State

Auth-mech considers authentication state the combination of current user data and auth status. 

## Status

The four recognized statuses are: `'UNSOLVED'`, `'SIGNEDOUT'`, `'UNVERIFIED'`, `'SIGNEDIN'`. 

The default initial status is `'UNSOLVED'`. It will hold until Firebase auth resolves the login status.  It is useful to control a start loading screen, for example.

While `'SIGNEDOUT'` status is obvious, the choice between `'UNVERIFIED'` and `'SIGNEDIN'` signals if the current user has verified its email. That is useful for routing, for example. You choose to send users to a pending verifications email screen or the default signed in page.

## User Data

To access user information, Auth-mech provides the `userData` object with user properties found in the standard Firebase auth [user](https://firebase.google.com/docs/reference/js/firebase.User#properties). Auth-mech adds an `emailLocalPart` property with the string that comes before the "@" char in emails. 

It can also fuse fields from a document in Firestore but we will talk about how setup that in another section. Keep in mind that the `userData` is a simple object without any methods.

So, we have two ways to read status and user data: subscribing to auth state changes or synchronously reaching for properties on the AuthMech instance.

## Subscribing to State Changes

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

## An Auth State Store

For some reason you might not want to read data from a asynchronous event driven approach like we did with the subscribe `method`.

Maybe you just need the last user data to show a message or you are building reactive UIs like the ones in Vue and React frameworks.

For those cases the AuthMech instance has a `state` property object that works like a data store. Inside that object you will always find an `userData` and `status` properties updated with the latest auth state.

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

Auth-mech also provides features to manipulate the state.

# Auth Operations

Auth-mech build a few auth operations on top of Firebase auth. Nothing fancy, but still aiming to reduce code repetition between apps. 

## Sign Methods with Email Verification

AuthMech provides the standard `signUp`, `signIn` and `signOut` methods. The last two will just call the corresponding method on Firebase auth. Signup will add the step of sending an verification email after creating the user.

So, like the official methods, Signup and signin take the email and password as parameters and return a Promise that will resolve or reject with a error depending on the operation success.

Regarding the email verification, until the user confirms his email the auth status will be set to `'UNVERIFIED'`. If you ever need to send that email again, just call the `sendEmailVerification` AuthMech method. It too will return a Promise that will resolve or reject.

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
  .then(() => addMsg('verification email sent'))
  .catch(error => addMsg(error.message));

el('resendEmail').onclick = () => authMech
  .sendEmailVerification()
  .then(() => addMsg('email sent'));

el('signIn').onclick = () => authMech
  .signIn(getVal('email'), getVal('password'))
  .then(() => addMsg('signed in'))
  .catch(error => addMsg(error.message));

el('signOut').onclick = () => authMech
  .signOut()
  .then(() => addMsg('user signed out'));
```

## Updating Credentials

Firebase Auth supports updating email and password without providing user password. It maybe demands re-authentication based on the last time the user signed in. I find that behavior a little unpredictable and also believe that users should always confirm password when doing those updates.

AuthMech instances provide `updateEmail` and `updatePassword` methods. They take the new email or password string as first parameter and the current password as second.

They will always attempt a re-authentication before updating and return a Promise which resolves or rejects based on Firebase response.

The email will not update until the user confirms the link sent to him or her. But `updatePassword`, otherwise, will update immediately and trigger a AuthMech state change.

Let's see a example implemented for those updates.

``` js
// helper functions
const el = id => document.getElementById(id);
const getVal = id => el(id).value;
const addMsg = str => { el('msg').innerText = str; } ;

el('updateEmail').onclick = () => authMech
  .updateEmail(getVal('email'), getVal('password'))
  .then(() => addMsg('verification email sent'));

el('updatePassword').onclick = () => authMech
  .updatePassword(getVal('newPassword'), getVal('password'))
  .then(() => addMsg('email sent'));
```

# Extend User Data Using Firestore

The auth service has constraints that make it a non ideal service to handle user preferences. If you choose [Firestore](https://firebase.google.com/docs/firestore) to manage that extra user data, Auth-mech can give you a hand with that. 

The options object passed to the AuthMech constructor accepts a fuse property. The value must be a string corresponding to the Firestore collection you want to save user data. By activating this behavior AuthMech will create a document for every new user to hold any extra data we want associated to users like preferences or profile. 

## Reading Fused Properties

The `userData` object passed to observer functions and also available in the state property of every AuthMech instance will fuse data both from the user in the Firebase auth and from that Firestore document. We could write a function to render user extended data after Sign In.

``` js
const el = id => return document.getElementById(id);
const setVal = (id, value) => { el(id).value = value };

function renderSignedIn () {
  const data = authMech.state.userData;
  data.preference && setVal('preference', data.preference);
  data.option && setVal('option', data.option);

  addMsg(`signed in as ${data.email}`);
}
```

When we need to update those extra properties, we call the `updateProps` method on `AuthMech` instances. The method accepts a object as parameters. The data will be merged to the Firestore document and AuthMech will trigger a state change.

If we wanted to update the same properties of the last example. We could something like this.

``` js
el('setButton').onclick = () => authMech
  .updateProps({
    preference: getVal('preference'),
    option: getVal('option')
  })
  .then(() => addMsg('props updated'))
  .catch(error => addMsg(error.message));
```

We are almost done now.

# Firebase is Still There

Firebase auth is a powerful library and is reasonable to assume that you will find need to use it even if installing auth-mech library. In that case, you can always export tha auth instance from whatever module you are initializing Firebase or, for convenience sake, access it directly from the AuthMech instance. It is kept inside the `config` object in the `service` property, like so:

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

const hereWeHaveFireAuth = fireApp.auth();
const hereTheSameFireauthAgain = authMech.config.service;

// do advance stuff with the Firebase auth of your preference
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
