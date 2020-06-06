# Auth-mech

Complements Firebase Authentication service with opinionated approaches to state change observation, treat email verification as default, and fuse user data from the auth engine and an arbitrary Firestore collection.

# Motivation

[Firebase](https://firebase.google.com/) gives agility to solo developers and small teams. One of its main conveniences is the [authentication service](https://firebase.google.com/docs/auth).

After a few times building login UI with Firebase Authentication (Fireauth), I found myself repeating code to wrap or complement its features. I decided to write this library to improve reusability and reduce bugs surrounding the following use cases.

## Fuse Data with Firestore

Fireauth holds some profile information but is not the best of places to expand [storage of user preferences](https://firebase.google.com/docs/auth/users#user_properties). An excellent alternative is to use Firestore, but now you have to sync two datasets. Auth-mech abstracts a data fusion between the auth engine and a given Firestore collection reducing infrastructure code. 

## Observability of Authentication State.

Fireauth offers an `onAuthStateChanged` method to observe state changes. But if you need to check on that from many points, soon you will need to implement some event architecture to deal with subscriptions and transform context into actual status values. Auth-mech provides a `subscribe` method that will notify observers passing processed status and user data values. 

## Opinionated Security Measures

Although not enforced by Firebase, Auth-mech always asks for email verification on sign up and email updates. The library also demands re-authentication at every email and password change.

But code is the more eloquent way to explain all this. Let me show how to get started.

# Getting Started

Install with npm.

    npm install @joaomelo/auth-mech

First, initialize Firebase as usual, then create an `AuthMech` instance. The `AuthMech` class constructor takes an options object as the only parameter. The service property of that object is where we pass the reference to Fireauth. Take a look:

``` js
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { AuthMech } from '@joaomelo/auth-mech';

const fireApp = firebase.initializeApp({
  // config data
});

const authMech = new AuthMech({
  service: fireApp.auth()
});
export { authMech }
```

Now you are good to go about using Auth-mech features 😏.

# Reading Auth State

Auth-mech considers authentication state the combination of current user data and auth status. If any of those information changes, the AuthMech instance will trigger an update event. 

## Status

The four recognized statuses are: `'UNSOLVED'`, `'SIGNEDOUT'`, `'UNVERIFIED'`, `'SIGNEDIN'`. 

The initial status is `'UNSOLVED'`. It will hold until Fireauth resolves the first login verification.  It is useful to control a start loading screen, for example.

While `'SIGNEDOUT'` status meaning is evident, the choice between `'UNVERIFIED'` and `'SIGNEDIN'` signals if the current user has verified its email. That is useful for routing, for example. You can choose to send users to a pending email verification screen or the default signed in page.

## User Data

To access user information, Auth-mech provides the `userData` object with properties found in the standard Fireauth [user](https://firebase.google.com/docs/reference/js/firebase.User#properties). 

Auth-mech adds an `emailLocalPart` property with the string that comes before the "@" char in emails. It can also fuse fields from a document in Firestore, but we will talk about that in another section. 

Keep in mind that `userData` is a simple object without any methods.

Therefore, we have two ways to read status and user data: subscribing to auth state changes or synchronously reaching for properties on the AuthMech instance.

## Subscribing to State Changes

To listen to auth state changes, you pass an observer function to the `subscribe` method in the AuthMech instance. The current user data and status will be given inside a payload object to all observer functions every time auth state changes. 

The example below is adapted from the demo app available in the library (repository)[https://github.com/joaomelo/auth-mech]. It renders adequate Html depending on the state.

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

The `subscribe` method returns an `unsubscribe` function. We can call it to terminate the contract.

## An Auth State Store

For some reason, you might not want to read data from an asynchronous event-driven approach like we did with the subscribe `method` in the last section.

Maybe you just need the last user data to show a message, or you are building reactive UIs like those in Vue and React frameworks.

In that case, AuthMech instances have a `state` property object that works like a data store. Inside that object, you will find `userData` and `status` properties updated with the latest auth state.

Using the state object, we could write a function to render a simple unverified email screen. 

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

Auth-mech builds a few auth operations on top of Fireauth. Nothing fancy, but still aiming to reduce code repetition between apps. 

## Sign Methods with Email Verification

AuthMech provides the standard `signUp`, `signIn` and `signOut` methods. The last two will just call the corresponding method on Fireauth. Signup will add the step of sending a verification email after creating the user.

Signup and sign methods take email and password as parameters and return a Promise that will resolve or reject with an error depending on the operation success.

Regarding the email verification, until the user confirms her email, the auth status will be set to `'UNVERIFIED'`. If you ever need to send that email again, just call the `sendEmailVerification` method. It, too, will return a Promise that resolves or rejects depending on Firebase server's response.

If we had a page with buttons for these three operations, we could set their click behavior to something like this.

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

Fireauth supports updating email and password without providing a user password. It maybe demands re-authentication based on the last time the user signed in. I find that behavior a little unpredictable and also believes that users should always confirm password when doing those updates.

AuthMech instances provide `updateEmail` and `updatePassword` methods. They take the new email or password string as the first parameter and the current password as the second one.

They will always attempt a re-authentication before updating and will return a Promise, which resolves or rejects based on Firebase response.

The email will not update until the user confirms the link sent to him. But `updatePassword`, otherwise, will update immediately.

Let's see an example implemented for those updates.

``` js
// helper functions
const el = id => document.getElementById(id);
const getVal = id => el(id).value;
const addMsg = str => { el('msg').innerText = str; } ;

el('updateEmail').onclick = () => authMech
  .updateEmail(getVal('email'), getVal('password'))
  .then(() => addMsg('email verification sent'))
  .catch(error => addMsg(error.message));

el('updatePassword').onclick = () => authMech
  .updatePassword(getVal('newPassword'), getVal('password'))
  .then(() => addMsg('password updated'))
  .catch(error => addMsg(error.message));
```

# Extend User Data Using Firestore

The auth service is a nonideal service to handle user preferences. If you choose [Firestore](https://firebase.google.com/docs/firestore) to manage that extra user data, Auth-mech can give you a hand with that. 

The options object passed to the AuthMech constructor accepts a `fuse` property. The value must be a string corresponding to the Firestore collection you want to save user data. By activating this behavior, AuthMech will create a document for every new user to hold any extra data we want to be associated with users like preferences or profile information. 

``` js
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { AuthMech } from '@joaomelo/auth-mech';

const fireApp = firebase.initializeApp({
  // config data
});

const authMech = new AuthMech({
  service: fireApp.auth(),
  fuse: 'profiles'
});
export { authMech }
```

## Reading Fused Properties

The `userData` object passed to observer functions and also available in the state property of every AuthMech instance will fuse data both from the user in the Fireauth and from that Firestore document. We could write a function to render extended user data after Sign In.

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

When we need to update those other properties, we call the `updateProps` method on `AuthMech` instances. It accepts an object as parameters. The data will be merged into the Firestore document, and AuthMech will trigger a state change.

If we wanted to update the same properties of the last example. We could do something like this.

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

Fireauth is a powerful library, and it is reasonable to assume that you will find the need to use it even if installing the Auth-mech library. In that case, you can always export the auth instance from whatever module you are initializing Firebase or, for convenience, access it directly from the AuthMech instance. It is kept inside the `config` object in the `service` property, like so:

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

// do advance stuff with the Fireauth of your preference
// ...
```

# Using the Demo

There is a demo app you can play to explore what I said here. Start by cloning the repository.

    git clone https://github.com/joaomelo/auth-mech.git

Create a `demo.env` file inside the `demo/config` folder with the variables assignments bellow. Replace the values with the real ones for your Firebase project.

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

Thank you, and have fun 🎉.

## License

Made by [João Melo](https://twitter.com/joaomeloplus) and licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
