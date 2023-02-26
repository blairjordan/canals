
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../Styles/App.css';
import { TestScene } from '../Three/Scene/TestScene';

function Test() {
    const changes = useRef(0); 
    let { id } = useParams();

    useEffect(() => {
        if(changes.current===0) {
            console.log('load test')
            const testScene = new TestScene(id);
            testScene.init();
            changes.current += 1
        }
    },[changes, id])

  return (
    <div className="App">
      <div id="canvasContainer"/>
    </div>
  );
}

export default Test;
