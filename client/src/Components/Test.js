
import React, { Component } from 'react';
import GraphQL from '../Server/graphQL';
import '../Styles/App.css';
import '../Styles/Game.css';
import { TestScene } from '../Three/Scene/TestScene';
import { useParams } from "react-router-dom";

function withParams(Component) {
  return props => <Component {...props} params={useParams()} />;
}

class Test extends Component {
  state = {
    speed: 0,
  };

  componentDidMount() {
    let { id } = this.props.params;

    const SEARCHPARAMS = new URLSearchParams(window.location.search);

    let tokenValid = false
    const token = SEARCHPARAMS.get('token') !== null ? SEARCHPARAMS.get('token') : null;
    if(token) {
      //Reverse
      //Math.pow(
      //  Math.pow(Math.pow(id,2)+1,2)+1
      //,2)
      const t1 = Math.sqrt(token)-1;
      const t2 = Math.sqrt(t1)-1;
      const t3 = Math.sqrt(t2);
      if(t3 === Number(id))  {
        tokenValid = true;
      }
    }

    if(tokenValid) {
      this.loadScene(id);
    }
  }

  updateSpeed(speed) {
    this.setState({
      speed: speed,
    });
  }

  loadScene = async (id) => {
    var storedPlayer = localStorage.getItem("Player");
    const player = JSON.parse(storedPlayer);
    const testScene = new TestScene(player, this.updateSpeed.bind(this));
    testScene.init();
  }

  render() {
    const { speed } = this.state;
    return (
      <div className="App">
        <div id="canvasContainer"/>

        <div id="gameUI">
          <div id="playerSpeed">{speed} mph</div>
          <div id="fishingAction" className='hidden'></div>
          <div id="fishCaught" className='hidden'></div>
        </div>
      </div>
    );
  }
}

export default withParams(Test);
