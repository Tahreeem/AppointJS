import React from "react";
import _ from "lodash";
import API from "../common/util/API";
import Autocomplete from "../common/util/AutoComplete";
import ConnectionInfo from "./ConnectionInfo";
import ConnectionCalendar from "./ConnectionCalendar";

class ConnectionList extends React.Component {
  state = {
    user: null,
    approverList: [],
    userList: [],
    connectionRequestList: []
  };

  componentDidMount() {
    let token = sessionStorage.getItem("token");
    let tokenEntire = sessionStorage.getItem("tokenEntire");
    console.log("---Token---" + token);
    API.retrieveUserPost(token,tokenEntire)
      .then(session => session.data.user)
      .then(userId => {
        console.log("---userId---" + userId);
        this.setState({ userId: userId });
      });

    API.retrieveAllUsers()
      .then(result => {
        if (result.status === 200) {
          console.log("---retrieveAllUsers.result.data---");
          console.log(result.data);

          let user = result.data.filter(user => {
            return user._id === this.state.userId;
          })[0];
          console.log("---user---");
          console.log(user);

          let approverList = [];
          if (user) {
            approverList = result.data.filter(approver => {
              console.log("---App.user.approverList---");
              console.log(user.approverList);
              return user.approverList.includes(approver._id);
            });
          }

          let userList = [];
          if (user) {
            userList = result.data.filter(userVar => {
              //  true;
              return (
                !user.approverList.includes(userVar._id) &&
                userVar._id !== this.state.userId
              );
            });
            console.log("---userList---");
            console.log(userList);
          }

          console.log("---approverList---");
          console.log(approverList);

          this.setState({
            user: user,
            userList: userList,
            approverList: approverList
          });
        }
      })
      .catch(ex => {
        console.log("---Exception---");
        console.log(ex);
      });
  }

  updateUser = (attendeeId, operation) => {
    console.log("---operation---");
    console.log(operation);

    console.log("---attendeeId---");
    console.log(attendeeId);

    let attendee;
    if (operation == "add") {
      attendee = attendeeId
        ? this.state.userList.filter(user => user.userId === attendeeId)[0]
        : null;
    } else {
      attendee = attendeeId
        ? this.state.approverList.filter(user => user.userId === attendeeId)[0]
        : null;
    }

    console.log("---attendee---");
    console.log(attendee);

    if (this.state.user) {
      console.log("---Old user---");
      console.log(this.state.user);

      let user = this.state.user;
      if (attendee) {
        if (operation === "add") {
          user.approverList = [
            ...user.approverList.filter(userId => userId != attendee._id),
            attendee._id
          ];
        } else {
          user.approverList = [
            ...user.approverList.filter(userId => userId != attendee._id)
          ];
        }
      }
      let updateUser = {};
      updateUser.approverList = _.chain(user.approverList)
        .uniq()
        .compact();
      console.log("---updateUser---");
      console.log(updateUser);

      API.updateUser(this.state.userId, updateUser)
        .then(result => {
          if (result.status === 200) {
            if (operation === "add") {
              console.log("---state---");
              console.log(this.state);
              this.setState((state, props) => {
                return {
                  approverList: [...state.approverList, attendee],
                  user: user,
                  userList: this.state.userList.filter(
                    user => user.userId !== attendeeId
                  )
                };
              });
            } else {
              this.setState((state, props) => {
                return {
                  userList: [...state.userList, attendee],
                  user: user,
                  approverList: this.state.approverList.filter(
                    user => user.userId !== attendeeId
                  )
                };
              });
            }
          } else {
            console.log("error updating approver list");
          }
        })
        .catch(err => console.log("exception caught updating approver list"));
    }
  };

  onSelect = attendeeId => {
    this.updateUser(attendeeId, "add");
  };

  removeApprover = attendeeId => {
    this.updateUser(attendeeId, "remove");
  };

  render() {
    console.log("---render state---");
    console.log(this.state);
    const username = this.state.user ? this.state.user.name : "no name";
    const userId = this.state.user ? this.state.user.userId : "no id";
    var userSuggestions = [];
    if (this.state.userList) {
      userSuggestions = this.state.userList.map(user => user.userId);
    }
    console.log("---userSuggestions---");
    console.log(userSuggestions);
    return (
      <div>
        <div className="row center">
          <div className="col s12 m12 col-content center">
            <ul>
              <li>
                <h3 className="teal-text">You</h3>
              </li>
              <li>
                <h2>{username}</h2>
              </li>
              <li>{userId}</li>
            </ul>
          </div>{" "}
          <div className="col s12 m12 col-content center" />{" "}
          <Autocomplete
            suggestions={userSuggestions}
            onSelect={this.onSelect}
          />
          <div className="col s12 m12 col-content center">
            {" "}
            <ConnectionInfo
              approverList={this.state.approverList}
              removeApprover={this.removeApprover}
            />
          </div>
          <div className="col s12 m12 col-content center">
            {" "}
            <ConnectionCalendar
              userId={this.state.userId}
              approverList={this.state.approverList}
              refresh={"true"}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ConnectionList;
