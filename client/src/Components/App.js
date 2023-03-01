import React, { useState, useEffect, Component } from "react";
import { Link } from "react-router-dom";
import "../Styles/App.css";
import logo from "../Assets/images/logo.png";
import GraphQL from "../Server/graphQL";
// import { Chat } from '../Server/chat';

class App extends Component {
  state = {
    id: 0,
    canSignup: true,
    canPlay: false,
    player: null,
  };

  componentDidMount() {
    this.setState(
      {
        id: localStorage.getItem("ID") || 0,
      },
      () => {
        this.onIdChange();
      }
    );

    // if(!chat) {
    //   chat = new Chat();
    // }
  }

  changeValue = (e) => {
    const value = e.target.value;
    this.setState(
      {
        id: Number(value),
      },
      () => {
        this.onIdChange();
      }
    );
    localStorage.setItem("ID", Number(value));
  };

  onIdChange() {
    const { id } = this.state;
    this.getPlayer(id);
  }

  getPlayer = async (id) => {
    const player = await GraphQL.getPlayer(id);
    if(player.data.player) {
      this.setState({
        canPlay: true,
      });
    } else {
      this.setState({
        canPlay: false,
      });
    }
  };

  guest = async (e) => {
    e.preventDefault();
    this.setState({
      canSignup: false,
    });

    const guestId = localStorage.getItem("guest")
    if(guestId) {
      this.setState({
        id: guestId,
      });
      localStorage.setItem("ID", guestId);
      return;
    }
    const player = await GraphQL.guestPlayer();
    this.setState({
      id: player.data.createPlayer.player.id,
    },
    () => {
      this.onIdChange();
    });
    localStorage.setItem("guest", player.data.createPlayer.player.id);
    localStorage.setItem("ID", player.data.createPlayer.player.id);
  };

  render() {
    const { id, canSignup, canPlay } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <div className="field active ">
            <input
              id="input"
              type="text"
              value={id}
              placeholder="player ID"
              onChange={this.changeValue.bind(this)}
            />
            <label htmlFor={1}>Player ID</label>
          </div>
          <div
            id="signup"
            className={"App-guest " + (canSignup ? "" : "hidden")}
            onClick={this.guest}
          >
            Guest
          </div>
          <Link className={"App-link " + (canPlay ? "" : "disabled")} to={`/test/${id}?token=${Math.pow(Math.pow(Math.pow(id,2)+1,2)+1,2)}`}>
            PLAY
          </Link>
        </header>
        {
          //This is for some chat tests... will remove later.
          /* <div id="loginPage">
          <input id="usernameInput" type="text"></input>
          <button id="loginBtn">LOGIN</button>
          <button id="callPage">Call</button>
        </div>
        <div id="callPage">
          <input id="callToUsernameInput" type="text"></input>
          <button id="callBtn">Call</button>
          <button id="hangUpBtn">Hangup</button>
          <audio id ="localAudio" controls autoPlay></audio> 
          <audio id ="remoteAudio" controls autoPlay></audio> 
        </div> */
        }
      </div>
    );
  }
}

export default App;
