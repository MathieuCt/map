import * as React from 'react';
import { Range } from 'react-range';

function Slider({setvalue}) {
state = { values: [50] };
	return (
		<Range
		step={0.1}
		min={0}
		max={1}
		values={this.state.values}
		onChange={(values) => this.setState({ values })}
		renderTrack={({ props, children }) => (
			<div
			{...props}
			style={{
				...props.style,
				height: '0.5em',
				width: '10em',
				backgroundColor: '#ccc'
			}}
			>
			{children}
			</div>
		)}
		renderThumb={({ props }) => (
			<div
			{...props}
			style={{
				...props.style,
				height: '1em',
				width: '1em',
				backgroundColor: '#999'
			}}
			/>
		)}
		/>
	);
}
export default Slider;