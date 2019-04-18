import API from "../common/util/API";
import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase";
import * as firebaseui from 'firebaseui';
require('dotenv').config();

// Configure Firebase.
const config = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_DATABASEURL,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID
};

firebase.initializeApp(config);


class Login extends React.Component {
  // The component's Local state.
  constructor(props) {
    super(props);
    this.state = {
      isSignedIn: false // Local signed-in state.
    };
  }

  // Configure FirebaseUI.
  uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: "popup",
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // defaultCountry: 'CA',
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: () => {
        var currentUser = firebase.auth().currentUser;
        var user = {
          userId: currentUser.email,
          name: currentUser.displayName
        }
        API.initializeUser(user);
        currentUser = JSON.stringify(currentUser);
        currentUser = JSON.parse(currentUser);
        //sessionStorage.setItem("expirationTime", currentUser.stsTokenManager.expirationTime);
        var tokenSignature = currentUser.stsTokenManager.accessToken;
        tokenSignature = tokenSignature.split(".")[2];
        sessionStorage.setItem("token", tokenSignature);
        //sessionStorage.setItem("full",currentUser.stsTokenManager.accessToken);
        window.location.href = "/appointments"
      }
    }
  };

  // Listen to the Firebase Auth state and set the local state.
  componentDidMount() {
    this.unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged(user => {
        this.setState({ isSignedIn: !!user });
        // user = JSON.stringify(user);
        // user = JSON.parse(user);
        var token = sessionStorage.getItem("token");
        var user = {
          email: user.email,
          name: user.displayName,
          token: token
        };
        if (token) { 
          API.validateFirebase(user); 
          window.location.href = "/appointments";
        }
      });

  }

  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    if (!this.state.isSignedIn) {
      return (
        <div>
          <StyledFirebaseAuth
            uiConfig={this.uiConfig}
            firebaseAuth={firebase.auth()}
          />
        </div>
      );
    }
    return (
      <div>
        <h1>My App</h1>
        <p>
          Welcome {firebase.auth().currentUser.displayName}! You are now
          signed-in!
         </p>
        <a href="/" onClick={() => firebase.auth().signOut()}>
          Sign-out
         </a>
        {/* {window.location.href = "/appointments"} */}

      </div>

    );
  }
}

export default Login;