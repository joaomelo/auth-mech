# Auth-mech

Abstracts authentication state from firebase auth module making easier to develop reactive auth UI.

## Motivation

[Firebase](https://firebase.google.com/) is awesome. It makes so easier for solo developers and small teams to build software with agility. And one of its main conveniences is the authentication module. You can read everything about it [here](https://firebase.google.com/docs/auth).

After a few times building login UI with firebase auth, I found myself repeating code to wrap or complement Firebase auth features. I decided to write this library to improve reusability and reduce bugs mainly to these use cases:

### General Observability of Authentication State.

Firebase auth offers a `onAuthStateChanged` method to observe state changes. But if you need to check on those from many points in app code you will need to implement some sort of central event architecture. You will need to create logic to transform the parameters values from onAuthStateChanged into status values. Is to given, for example, if the user is logged off or the auth engine didn't resolve the user yet.   

### Opinionated Security Measures

Although not enforced by Firebase, i find important to avoid abusing behavior from malicious users to aks for email verification on sign up and email changes. Auth-mech also demands re-authentication at every email and password changes.

### Auto Link to a Firestore collection

Firebase auth is not a good place to store user like preferences or profile. To do that you will need to create a collection in Firestore. Auth-mech takes the heavy lifting abstracting a fusion between the auth engine and the given collection. 

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

## Auth State

Auth-mech abstracts four auth states: `'UNSOLVED'`, `'SIGNEDOUT'`, `'UNVERIFIED'`, `'SIGNEDIN'`. The first one is the default initial state. It will hold until Firebase auth resolves the login status and is usefull to show a loading screen for example.

The others are determined by the most recent user object provided by Firebase auth. The `'SIGNEDOUT'` value is quite obvious. 

The choice between `'UNVERIFIED'` and `'SIGNEDIN'` is determined by if the current user verified its email That is useful, for example, for routing. You can send users to a pending verifications email or the default signed in page, depending on this status.

There are two ways to access the auth status: subscribing to auth state changes or syncournously reading the most recent state in a property on the AuthMech instance. 

### Subscribing to Auth Changes

You can set any number of observers functions to be called when auth state changes. The current user and the status values will be passed inside a payload object. The example bellow is extracted from the demo app available in the library repository. It shows a adequate html code depeding on the state.

    import { authMech } from './foobar';

    const adjusteRoute = ({user, status}) => {
        if (status === 'LOGGEDIN') {
          // User is signed in.
          // Now we should route to home page.
        } else {
          // User is signed out.
          // Let's get out to the login form.
        }
      }
    authMech.subscribe(adjusteRoute)

    const dummyCallback = ({status}) => console.log(`auth state changed to ${status}`)
    authMech.subscribe(dummyCallback)

Every call to the `subscribe` method will return an `unsubscribe` function. You can call it to terminate the contract.

### The Callback Can Be Old News

But if you are building reactive UIs with something like Vue, React, Angular or Svelte, you probably don't need the callback anymore.

I will use Vue to exemplify because it is where I am most comfortable. But, this can be achieved even with vanilla js.

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

    import { AuthMech } from '@joaomelo/auth-mech';

    const fireApp = firebase.initializeApp({
      //you firebase project config = data
    });

    const authMech = new AuthMech(fireApp.auth());
    export { authMech };

Cool. Now, inside our Vue main component, we can leverage the state machine to show the appropriate UI. To access the current auth state you just need to reference the `status` property of the `authMech` you created. Like this:

    <template>
        <component
          :is="page"
          :auth-mech="authMech"
        />
    </template>

    <script>
    import PageHome from './page-home';
    import PageLogin from './page-login';
    import PageLoading from './page-solving';

    import { authMech } from './auth';

    export default {
      name: 'App',
      data () {
        return { authMech };
      },
      computed: {
        page () {
          const components = {
            UNSOLVED: PageLoading,
            SIGNIN: PageHome,
            SIGNOUT: PageLogin
          };

          return components[this.authMech.status];
        }
      }
    };
    </script>

This way, every time the user state changes, Vue will automatically switch to the correct page.

### Firebase Auth is Still There, Don't Worry!

There is no ambition to create a facade over the firebase auth. The only copied state from fireauth is the user. This make easier to build reactive UI with frameworks like Vue or React. Any other properties or methods you want to use from firebase auth service are reachable by the `service` property in the `authMech` object. In a dummy home page, for example, we can do the `signOut` from a button. Check it out:

    <template>
      <div>
        <p>welcome {{ authMech.user.email }}</p>
        <button @click.prevent="signOut">
          sign out
        </button>
      </div>
    </template>

    <script>
    export default {
      name: 'PageHome',
      props: {
        authMech: {
          type: Object,
          required: true
        }
      },
      methods: {
        signOut () {
          this.authMech.service.signOut();
        }
      }
    };
    </script>

## Keep the User List in Firestore

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

## Wrapping up

So to use the package you import the `AuthMech` class and create instantiate an object passing the fireauth reference. Then, you can (1) access the user and user status by the `user` and `status` properties and (2) subscribe to auth state change events passing callbacks to the `subscribe` method. All fireauth functionality is accessible trough the `service` property. Simple as that.

## Using the Demo

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

Made by [João Melo](https://www.linkedin.com/in/joaomelo81/?locale=en_US) and licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details/
