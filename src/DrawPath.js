/**
 * @author Mathieu Chantot <mathieu.chantot@hes-so.ch>
 * @date 01/24
 */

import RangeSlider from 'react-range-slider-input';
//import 'react-range-slider-input/dist/style.css';
import React, { useEffect, useState } from 'react';
import SuperSimple from './range.js';
import './DrawPath.css';

function DrawPath({drawingMode, moveState, drawState, validation, exit}){
  const [moveColor, setMoveColor] = useState('lightgrey');
  const [dotColor, setDotColor] = useState('white');
  const [lineColor, setLineColor] = useState('white');
  const [validationColor, setValidationColor] = useState('white');
  const [sliderValue, setSliderValue] = useState(0.5);
  const activeColor = 'lightgrey';
  const inactiveColor = 'white';

  useEffect(() => {
	setLineColor(inactiveColor);
	setDotColor(inactiveColor);
	setMoveColor(inactiveColor);
	setValidationColor(inactiveColor);
	if (drawingMode === 'dot') {
	  setDotColor(activeColor);
	}
	if (drawingMode === 'line'){
	  setLineColor(activeColor);
	}
	if (drawingMode === 'move'){
	  setMoveColor(activeColor);
	}
	if (drawingMode === 'validation'){ 
	  setValidationColor(activeColor);
	}
  }, [drawingMode]);

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
		<div id = "slider" className="btn">
		  <SuperSimple />
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