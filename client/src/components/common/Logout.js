import API from "./util/API";
import firebase from "firebase";
import React from "react";
import { Redirect } from "react-router";

class Logout extends React.Component {
  componentDidMount() {
    firebase.auth().signOut().then(() => {
      API.logout();
      sessionStorage.clear();
    }).catch(error => {
      console.log("firebase auth signout error: ",error);
    });
  }

  render() {
    return <Redirect to="/" />;
  }
}

export default Logout;