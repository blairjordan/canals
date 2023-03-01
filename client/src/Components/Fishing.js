import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../Styles/App.css';
import { FishingScene } from '../Three/Scene/FishingScene';

function Fishing() {
    const changes = useRef(0); 
    let { id } = useParams();
    const [playerId, setPlayerId] = useState({
      id: null,
   });

   useEffect(() => {
    if(changes.current===0) {
        console.log('load test')
        const finishScene = new FishingScene(id);
        finishScene.init();
        changes.current += 1
    }
  },[id])

    // useEffect(() => {
    //   //http://localhost:3000/api/player

    //   console.log('Test useEffect')

    //   let testScene;

    //   axios.get('http://localhost:3000/api/player')
    //   .then(async (response) => {
    //     console.log(response.data)
    //     console.log('axios request')
    //     setPlayerId(response.data)
    //   })
    //   .catch(async (error) => { 
    //     //retry or show error here.
    //   })
    //   .finally(async () => {
    //     if(playerId.id !== null) {
    //       testScene = new TestScene(playerId.id);
    //       testScene.init();
    //     }
    //   })
    //     return () => {
    //       console.log("shouldn't get here right?")
    //       //exit app and destroy 3js stuff.
    //       //lazy approach is to nav somewhere.
    //   };
    // },[playerId])

  return (
    <div className="App">
      <div id="canvasContainer"/>
    </div>
  );
}

export default Fishing;
