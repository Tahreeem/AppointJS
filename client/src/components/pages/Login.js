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
        sessionStorage.setItem("token",currentUser.stsTokenManager.accessToken);
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
        var user = {
          email: user.email,
          name: user.displayName,
          token: sessionStorage.getItem("token")
        };
        API.validateFirebase(user);
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
      </div>
    );
  }
}

export default Login;

/* <div className="g-signin2" data-onsuccess="onSignIn" /> */
/* {$("button.firebaseui-idp-button.mdl-button.mdl-js-button.mdl-button--raised.firebaseui-idp-google.firebaseui-id-idp-button").addClass("g-signin2")} */



// {"uid":"RcGj4nLWpFgWtxPR8H8qS7IOD6q1",
// "displayName":"Tahreem Butt",
// "photoURL":"https://graph.facebook.com/10155907171701174/picture",
// "email":"tahreem.butt@mail.utoronto.ca",
// "emailVerified":false,
// "phoneNumber":null,
// "isAnonymous":false,
// "providerData":[{"uid":"10155907171701174","displayName":"Tahreem Butt","photoURL":"https://graph.facebook.com/10155907171701174/picture","email":"tahreem.butt@mail.utoronto.ca","phoneNumber":null,"providerId":"facebook.com"}],
// "apiKey":"AIzaSyA2ZZ3rSSFBbbsDb49MwceKMsc3K9Jfcd0",
// "appName":"[DEFAULT]",
// "authDomain":"project3-8b62e.firebaseapp.com",
// "stsTokenManager":
// {"apiKey":"AIzaSyA2ZZ3rSSFBbbsDb49MwceKMsc3K9Jfcd0","refreshToken":"AEu4IL15N7UQhbmo6XgdNnpOKI6CRkL2kzX9SSdV9gBRPWZYvpT-ohJtqjlX_sG7c9EOhewJziH85-JJJU-b_yaucZQ1w69veshHTiKs59d66gT--_RroG1ib3wldeok1JfhJosk-RzSrTQj7pZvQCVzNLECHKHqPBj4th4CIHhjSLstwk5SuQZaZ23bkzAZs4hlXRiq2vAJDicVNbPP9wMZnfbrONysjh6vfVW3eqcbGaR6aQpGAqkkZdCAWvnpcdA0U-cl8541tkwOC7FDymZlw8JO8NFbJUyYLh1_fX_HX-ei5VhDv10zrgh0bOEIGD_5Y5Cqr6Bv","accessToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjVmYjMyOWRmNjdiYjY4NDVkNDk1NDNiMGM0OWIzNWM4ODg1NzllYmEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiVGFocmVlbSBCdXR0IiwicGljdHVyZSI6Imh0dHBzOi8vZ3JhcGguZmFjZWJvb2suY29tLzEwMTU1OTA3MTcxNzAxMTc0L3BpY3R1cmUiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcHJvamVjdDMtOGI2MmUiLCJhdWQiOiJwcm9qZWN0My04YjYyZSIsImF1dGhfdGltZSI6MTU1NTMyMzEyNCwidXNlcl9pZCI6IlJjR2o0bkxXcEZnV3R4UFI4SDhxUzdJT0Q2cTEiLCJzdWIiOiJSY0dqNG5MV3BGZ1d0eFBSOEg4cVM3SU9ENnExIiwiaWF0IjoxNTU1MzIzMTI0LCJleHAiOjE1NTUzMjY3MjQsImVtYWlsIjoidGFocmVlbS5idXR0QG1haWwudXRvcm9udG8uY2EiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZmFjZWJvb2suY29tIjpbIjEwMTU1OTA3MTcxNzAxMTc0Il0sImVtYWlsIjpbInRhaHJlZW0uYnV0dEBtYWlsLnV0b3JvbnRvLmNhIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZmFjZWJvb2suY29tIn19.kesY6fmoE6G-pTdthz8taAa3etTOuBIgNUKWOe5c-HLUXDReqV69CZ3Nrb4s4VhfTuzJY0u-0rbOktBd6sBZsC4BGtpBU9r_CxNYa2fvuSKQh8Uv2UVP35y1qQ2lwHW7J6rIAWoObyocRBEKXlYxAvQwvenYuCAWZIXFBCcCyziiij5rKXmfK0B0cchQCcEraqnuJL0_hVN3_eVxHWdSGCMUqUBfNNvCqNz2oP-L-FA-ELERH-leFtmQqjUOBplVXjKwlGKYRSi3ly55orYH0evV2P6pQrxiSzd2t4MH823sfgMEJ4ZHocTwulBlogYu6aSHULY2g1iVA6p8AsGQSw","expirationTime":1555326724115},
// "redirectEventId":null,
// "lastLoginAt":"1555323105991",
// "createdAt":"1553940824175"}
