
import React, { Component } from 'react';
import GraphQL from '../Server/graphQL';
import '../Styles/App.css';
import { TestScene } from '../Three/Scene/TestScene';
import { useParams } from "react-router-dom";

function withParams(Component) {
  return props => <Component {...props} params={useParams()} />;
}

class Test extends Component {
  state = {
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

  loadScene = async (id) => {
    const player = await GraphQL.getPlayer(Number(id));
    const testScene = new TestScene(player.data.player);
    testScene.init();
  }

  render() {
    return (
      <div className="App">
        <div id="canvasContainer"/>
      </div>
    );
  }
}

export default withParams(Test);
