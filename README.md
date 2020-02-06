# Auth Machine

Abstracts authentication state from firebase auth module making easier to develop reactive auth ui

## Motivation

[Firebase](https://firebase.google.com/) is awesome. It makes do easier for solo developers and small teams build software with agility. And one of it main conveniences is it's authentication module. You can read everything about it [here](https://firebase.google.com/docs/auth) and i will assume from now on that you have basic understand of it.

But after building a few login uis i found myself repeating some code to compensate to more string abstraction about the authentication state. Let's look to it in detail.

The recommended approach to monitor react to auth changes in the app is to register a callback function (observer) in the `onAuthStateChanged` method from the auth object in the firebase project. Like this.

    import * as firebase from 'firebase/app';
    import 'firebase/auth';

    const fireApp = firebase.initializeApp({
      // config data
    });

    fireApp.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        // Now we should route to home page.
      } else {
        // User is signed out.
        // Let's get out to the login form.
      }
    });

This is cool and probably everything you will ever need. So we can end this chat right now. Best of luck :).

But if you are still here, the first thing that i kept dealing with is the fact the state change callback take some time to execute.

You see, based on configuration and local cached data after loaded do some logic to check if the user is already loggedin or not. After deciding that it will trigger the auth state change and run the callback.

So now you need to do something for your iser during this time. Maybe run a spinner or show a "solving user message". A common aprroach would be use booleand variable like this.

    //firebase init code

    let isUserSolved = false;
    fireApp.auth().onAuthStateChanged(function(user) {
      isUserSolved = true;
      if (user) {
        // User is signed in.
        // Now we should route to home page.
      } else {
        // User is signed out.
        // Let's get out to the login form.
      }
    });

The variable `isUserSolved` can now be used by the ui code to the with that initial state. 

But a more resilient architecture should avoid this isolate booleans to represent multiple software state, as this can easily get code maintainability in trouble. This is beautifully distilled by David Khourshid in a magnificent [article](https://dev.to/davidkpiano/no-disabling-a-button-is-not-app-logic-598i) and also in a great podcast [episode](http://www.fullstackradio.com/130)

To deal with that i keep repeating some sort of very simple and not that impressive (at all) state management code for auth status. To avoid bugs and keep things DRY i decided to make a package of it.

## Usage

The library provides a way to create an `AuthMachine` which will track and expose the auth state as `'UNSOLVED'`, `'LOGGEDIN'` or `'LOGGEDOUT'`. This will luckily make reactive UIs slightly easier to build.

### Installation

Install with npm with the command `npm install @joaomelo/auth-machine`.

### Getting Started

To use it, first initialize firebase as usual than add an additional step to create the authMachine object passing the firebase Auth instance and an optionally one or more callbacks you want to call in auth state change.

    import * as firebase from 'firebase/app';
    import 'firebase/auth';
    import { AuthMachine } from '@joaomelo/auth-machine';

    const fireApp = firebase.initializeApp({
      // config data
    });

    const authStateChangeCallback = ({user, authStatus}) => {
        if (authStatus === 'LOGGEDIN') {
          // User is signed in.
          // Now we should route to home page.
        } else {
          // User is signed out.
          // Let's get out to the login form.
        }
      }
    const authMachine = new AuthMachine(fireApp.auth(), authStateChangeCallback) 

    export { authMachine }

### The Callback Can Be Old News

But if you are building reactive UIs with something like Vue, Reactive, Angular or Svelte, you would probably don't need the callback any more.

I will use Vue because is where i am most comfortable but this can be derived even to vanilla js.

Wh

### Firebase Auth is Still There Don't Worry

You can access using the auth property and do all the thind like register, login, logout and acess the current user.

## Wrapping up

Maybe some ending message to state pitfalls or trade-offs. Totally optional.

## Using the Demo

To run the demo, clone the repository, install all dev dependencies and setup firebase.

    git clone https://github.com/joaomelo/bus.git
    npm install
    npm test

## License

Made by [João Melo](https://www.linkedin.com/in/joaomelo81/?locale=en_US) and licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details