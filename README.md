# Fireauth Machine

Abstracts authentication state from firebase auth module making easier to develop reactive auth UI.

## Motivation

[Firebase](https://firebase.google.com/) is awesome. It makes so easier for solo developers and small teams to build software with agility. And one of its main conveniences is the authentication module. You can read everything about it [here](https://firebase.google.com/docs/auth) and I will assume from now on that you have a basic understanding of it.

After a few times building login UI with firebase auth, I found myself repeating the same code to wrap fireauth logic with authentication state abstraction. Let me show you the issue in detail.

The recommended approach to react to auth changes is to register a callback function (observer) in the `onAuthStateChanged` method from the auth object. Like this:

    import * as firebase from 'firebase/app';
    import 'firebase/auth';

    const fireApp = firebase.initializeApp({
      // config data
    });

    fireApp.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        // Now we could route to home page.
      } else {
        // User is signed out.
        // Let's go back to the login form.
      }
    });

This is cool and probably everything you will ever need. So we can end this chat right now. Best of luck 😄.

But if you are still here... the first thing that caught my attention was the need to deal with the fact that the callback takes some time to execute. Based on the configuration and cached data, firebase will probably check if the user is already signed in. It will decide that first and just then, trigger the auth state change and run your registered callback.

The consequence is that you need to do something for your user during this time of unsolved status. Maybe run a spinner or show a "solving user message". A common approach to solve this would be to use a boolean variable:

    // firebase init code

    let isUserSolved = false;
    fireApp.auth().onAuthStateChanged(user => {
      isUserSolved = true;
      if (user) {
        // User is signed in.
        // Now we should route to home page.
      } else {
        // User is signed out.
        // Let's get out to the login form.
      }
    });

The variable `isUserSolved` can now be used by the UI to deal with that initial state. 

But resilient architectures should avoid isolated booleans variables to represent software state. This can easily get code maintainability in trouble. The concept is beautifully distilled by David Khourshid in a magnificent [article](https://dev.to/davidkpiano/no-disabling-a-button-is-not-app-logic-598i) and also in a great podcast [episode](http://www.fullstackradio.com/130)

That is how this package was born. I decided some sort of state machine was needed every time I dealt with firebase auth and wanted to avoid repeating code between apps. Even so, the code is short and unimpressive, seemed good sense to avoid bugs and keep things DRY.

## Usage

The library provides a way to create an `AuthMachine` object which will track and expose the user auth state as `'UNSOLVED'`, `'SIGNIN'` or `'SIGNOUT'`. This will make reactive UIs slightly easier to build.

### Installation

Install with npm.

    npm install @joaomelo/fireauth-machine

### Getting Started

First, initialize firebase as usual then add an additional step to create the `AuthMachine` object passing the firebase Auth instance. One or more callbacks can optionally be passed as the second argument if you want them called in any auth state change.

    import * as firebase from 'firebase/app';
    import 'firebase/auth';
    import { AuthMachine } from '@joaomelo/fireauth-machine';

    const fireApp = firebase.initializeApp({
      // config data
    });
    const fireAuth = fireApp.auth();

    const authStateChangeCallback = ({user, status}) => {
        if (status === 'LOGGEDIN') {
          // User is signed in.
          // Now we should route to home page.
        } else {
          // User is signed out.
          // Let's get out to the login form.
        }
      }

    const anotherCallback = () => console.log('auth state changed')

    // you can pass multiple callbacks inside an array
    const authMachine = new AuthMachine(fireAuth, [authStateChangeCallback, anotherCallback]) 

    // pass just one callback
    // const authMachine = new AuthMachine(fireAuth, authStateChangeCallback) 

    // or none
    // const authMachine = new AuthMachine(fireAuth) 

    export { authMachine }

### The Callback Can Be Old News

But if you are building reactive UIs with something like Vue, React, Angular or Svelte, you probably don't need the callback anymore.

I will use Vue to exemplify this because it is where I am most comfortable. But, this can be achieved even with vanilla js.

Let's start by creating our Vue app:

    // index.js
    import Vue from 'vue';
    import App from './app.vue';

    const vueApp = new Vue({
      render: h => h(App)
    });

    vueApp.$mount('#app');

Then we can initialize firebase auth service and our state machine:

    // auth.js
    import * as firebase from 'firebase/app';
    import 'firebase/auth';

    import { AuthMachine } from '@joaomelo/fireauth-machine';

    const fireApp = firebase.initializeApp({
      //you firebase project config = data
    });

    const authMachine = new AuthMachine(fireApp.auth());
    export { authMachine };

Cool. Now, inside our Vue main component, we can leverage the state machine to show the appropriate UI. To access the current auth state you just need to reference the `status` property of the `authMachine` you created. Like this:

    <template>
        <component
          :is="page"
          :auth-machine="authMachine"
        />
    </template>

    <script>
    import PageHome from './page-home';
    import PageLogin from './page-login';
    import PageLoading from './page-solving';

    import { authMachine } from './auth';

    export default {
      name: 'App',
      data () {
        return { authMachine };
      },
      computed: {
        page () {
          const components = {
            UNSOLVED: PageLoading,
            SIGNIN: PageHome,
            SIGNOUT: PageLogin
          };

          return components[this.authMachine.status];
        }
      }
    };
    </script>

This way, every time the user state changes, Vue will automatically switch to the correct page.

### Firebase Auth is Still There, Don't Worry!

There is no ambition to create a facade over the firebase auth. The only copied state from fireauth is the user. This make easier to build reactive UI with frameworks like Vue or React. Any other properties or methods you want to use from firebase auth service are reachable by the `service` property in the `authMachine` object. In a dummy home page, for example, we can do the `signOut` from a button. Check it out:

    <template>
      <div>
        <p>welcome {{ authMachine.user.email }}</p>
        <button @click.prevent="signOut">
          sign out
        </button>
      </div>
    </template>

    <script>
    export default {
      name: 'PageHome',
      props: {
        authMachine: {
          type: Object,
          required: true
        }
      },
      methods: {
        signOut () {
          this.authMachine.service.signOut();
        }
      }
    };
    </script>

## Wrapping up

So to use the package you import the `AuthMachine` class and create instantiate an object passing the fireauth reference. Then, you can access the the user status by the `status` property and all fireauth functionality trough the `service` property. Simple as that.

## Using the Demo

There is a demo app you can play to explore what I said here. Start by cloning the repository.

    git clone https://github.com/joaomelo/fireauth-machine.git

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

Made by [João Melo](https://www.linkedin.com/in/joaomelo81/?locale=en_US) and licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details/
