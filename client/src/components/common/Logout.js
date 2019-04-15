import firebase from "firebase";
import React from "react";
import { Redirect } from "react-router";

class Logout extends React.Component {
  componentDidMount() {
    firebase.auth().signOut().then(() => {
      sessionStorage.clear();
    }).catch(error => {
      console.log(error);
    });
  }

  render() {
    return <Redirect to="/" />;
  }
}

export default Logout;



