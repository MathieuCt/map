import React, { useEffect, useState } from 'react';
import './DrawPath.css'; // adjust the path as needed
//import { copyFileSync } from 'original-fs';

function DrawPath({mode, moveState, drawState, validation, exit}){
  const [moveColor, setMoveColor] = useState('lightgrey');
  const [dotColor, setDotColor] = useState('white');
  const [lineColor, setLineColor] = useState('white');
  const [validationColor, setValidationColor] = useState('white');
  const activeColor = 'lightgrey';
  const inactiveColor = 'white';

  useEffect(() => {
    setLineColor(inactiveColor);
    setDotColor(inactiveColor);
    setMoveColor(inactiveColor);
    setValidationColor(inactiveColor);
    if (mode === 'dot') {
      setDotColor(activeColor);
    }
    if (mode === 'line'){
      setLineColor(activeColor);
    }
    if (mode === 'move'){
      setMoveColor(activeColor);
    }
    if (mode === 'validation'){ 
      setValidationColor(activeColor);
    }
  }, [mode]);

/*  function Start(){
    if (tablett){
      return(
        <div id ="start" className="btn">
        <button onClick={() => startDrawing()}>
          Start
        </button>
      </div>
      )
    }else{
      return
    }
  }*/ 

  return (
    <div id="header">
      <div id= "menu">
        <div id="delete" className="btn">
          <button style={{backgroundColor: moveColor}} onClick={() => moveState()}>
            Move
          </button>
        </div>
        <div id="mode" className="btn">
          <button id="dot" style={{backgroundColor: dotColor}} onClick={() => drawState('dot')}>
            Dot
          </button>
          <button id="line" style={{backgroundColor: lineColor}} onClick={() => drawState('line')}>
            Line 
          </button>
        </div>
        <div id="validate" className="btn">
          <button style={{backgroundColor: validationColor}} onClick={() => validation()}>
            Validate
          </button>
        </div>
      </div>
      <div id="exit" className="btn">
        <button onClick={()=> exit()}>
          Exit
        </button> 
      </div>
    </div>
  );
};

export default DrawPath;