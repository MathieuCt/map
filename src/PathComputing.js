/**
 * @author Mathieu Chantot <mathieu.chantot@hes-so.ch>
 * @date 01/24
 */

import {distance, bearing, destination, pointToLineDistance, along, lineString, sector, inside} from '@turf/turf';
import {Bezier} from "bezier-js";
import {Smooth} from './Smooth.js';

const turf = {distance, bearing, destination, pointToLineDistance, along, lineString, sector, inside};
/**
 * This class is used to compute the trajectory that will be sent to the vehicle.
 */
export class PathComputing{
	/**
	 * @param {number} maxPointDistance - Maximum distance between two points in meters.
	 * @param {object} vehiclePos - Position of the vehicle.
	 * @property {number} vehiclePos.lng - Longitude of the vehicle.
	 * @property {number} vehiclePos.lat - Latitude of the vehicle.
	 * @param {number} circleRadius - Radius of the circle around the vehicle in meters.
	 * @param {number} maxStartingAngle - Maximum angle between the vehicle and the first point out of the circle in degrees.
	 * @param {number} TurningRadius - Turning radius of the vehicle in meters.
	 */
	constructor(maxPointDistance,  vehiclePos, circleRadius, maxStartingAngle, turningRadius){
		this.maxPointDistance = maxPointDistance;
		this.vehiclePos = vehiclePos;
		this.circleRadius = circleRadius;
		this.maxStartingAngle = maxStartingAngle;
		this.turningRadius = turningRadius;
	}

	/**
	 * Main funtion for trajectory computing, it checks if the trajectory is valid and if it is, complete and smooth it.
	 * @param {Object[]} trajectory - User-defined trajectory.
	 * @property {number} trajectory[].x - The x-coordinate of the point.
	 * @property {number} trajectory[].y - The y-coordinate of the point.
	 * @returns {boolean|Object[]} - If valid, Computed trajectory
	 * @property {boolean} trajectory[].x - The x-coordinate of the point.
	 */
	computeTrajectory(trajectory){
		let computedTrajectory = [];
		this.addPoints(trajectory);
		if(!this.checkStartingAngle(trajectory)){
			return false;
		}
		let filter = new Smooth(10/(this.maxPointDistance));
		trajectory = filter.filter(trajectory)
		let bezier = this.bezierCurve(trajectory);
		computedTrajectory.push(...bezier.map(point => [point.x, point.y]));
		this.addTrajectory(computedTrajectory, trajectory);
		var Pathlimits = this.vehiclesSize(computedTrajectory);
		this.turningRadiusControl(computedTrajectory);
		return [computedTrajectory, Pathlimits];
	}

	/**
	 * Check if each trajectory angle is under the maximum turning radius.
	 * @param {object[]} trajectory 
	 * @returns 
	 */
	turningRadiusControl(trajectory){
		const maxAngle = 180/(Math.PI*this.turningRadius);
		console.log("maxAngle :", maxAngle);
		console.log(trajectory.length )
		for(let i = 0; i < trajectory.length - 2; i++){
			let angle = Math.abs(turf.bearing(trajectory[i], trajectory[i+1])- turf.bearing(trajectory[i+1], trajectory[i+2]));
			let distance = (turf.distance(trajectory[i], trajectory[i+1])+turf.distance(trajectory[i+1], trajectory[i+2]))*1000/2;
			/**Remove this log when everything is tested */
			if(angle > 180){
				angle = 360 - angle;
			}
			if(angle/distance > 10){
				console.log("angle/distance :", angle/distance,"angle", angle, "distance :", distance);
			}
			if(angle/distance > maxAngle ){
				console.log("Corner too sharp", trajectory[i]);
				console.log("turningRadius :", maxAngle)
				//return false;
			}
		}
		return true;
	}

	/**
	 * Build a limit line corresponding to the vehicle size on both side of the trajectory.
	 * @param {object[]} trajectory 
	 * @returns {object[]} - Right and left limit lines.
	 */
	vehiclesSize(trajectory){
		let rightLimit = [];
		let leftLimit = [];
		for (let i = 0; i < trajectory.length-1; i++){
			let bearing = turf.bearing(trajectory[i], trajectory[i+1]);
			/** @todo there is anothere way to get the coordinates */
			let right = turf.destination(trajectory[i], 0.001, bearing + 90).geometry.coordinates
			if(turf.pointToLineDistance(right, trajectory)>=0.00099){
				rightLimit.push(right);
			}
			/** @todo same */
			let left = turf.destination(trajectory[i], 0.001, bearing - 90).geometry.coordinates
			if(turf.pointToLineDistance(left, trajectory)>= 0.00099){
				leftLimit.push(left);
			}
		}
		return {rightLimit, leftLimit};
	}

	/**
	 * Add the user-defined trajectory to the computed trajectory.
	 * @param {object[]} trajectory 
	 */
	addTrajectory(computedTrajectory, trajectory){
		/** @todo if we cant just use trajectory */
		let cutPath  = trajectory.map(innerArray => [...innerArray]);
		let computedTrajectoryDist = turf.distance(computedTrajectory[computedTrajectory.length - 1], [this.vehiclePos.lng, this.vehiclePos.lat]);
		while(computedTrajectoryDist >= turf.distance(cutPath[0],[this.vehiclePos.lng, this.vehiclePos.lat])){
			cutPath.shift();
			if (cutPath.length === 0){
				break;
			}
		}
		computedTrajectory.push(...cutPath);
	}

	/**
	 * Build a bezier curve from the vehicle to the trajectory out of the circle.
	 * Using four points: 
	 * 	- The vehicle position.
	 * 	- A point one meter in front of the vehicle.
	 *  - The first trajectory point out of the circle.
	 * 	- A point following the trajectory on one meter.
	 * @param {object[]} trajectory
	 * @returns {object[]} - Bezier curve from vehicle to the trajectory out of the circle.
	 */
	bezierCurve(trajectory){
		let points = [];
		/**@todo why don't use push insteaf of concat */
		points = points.concat([this.vehiclePos.lng, this.vehiclePos.lat])
		/** @todo there is anothere way to get the coordinates */;
		points = points.concat(turf.destination([this.vehiclePos.lng, this.vehiclePos.lat], 0.001, this.vehiclePos.angle).geometry.coordinates);
		points = points.concat(trajectory[0]);
		/** @todo there is anothere way to get the coordinates */
		points = points.concat(turf.along(turf.lineString(trajectory),0.001).geometry.coordinates);
		let curve = new Bezier(points);
		//let curve = new Bezier();
		let bezier = curve.getLUT();
		return bezier;
	}

	/**
	 * Add points to the trajectory while the distance between two points is too big.
	 * @param {object[]} trajectory
	 * @returns {object[]} - Trajectory with added points.
	 */
	addPoints(trajectory){
		let i = 0;
		while(i < trajectory.length -1){
			let nextPoint = trajectory[i+1];
			if(this.maxPointDistance <= turf.distance(trajectory[i], trajectory[i+1])*1000){
				trajectory.splice(i+1,0,[(trajectory[i][0]+nextPoint[0])/2, (trajectory[i][1]+nextPoint[1])/2]);
			}else{
				i++;
			}
		}
		return trajectory;
	}

	/**
	 * Check if the user defined trajectory is a valid drawing.
	 * @param {object[]} trajectory
	 * @returns {boolean} - If the trajectory is valid drawing.
	 */
	checkStartingAngle(trajectory){
		/** @todo No need give a color sector wont be displayed */
		const options = {steps: 50, units: 'kilometers', properties: {fill: '#0ff'}};
		let sector = turf.sector([this.vehiclePos.lng, this.vehiclePos.lat], this.circleRadius + 0.002 , this.vehiclePos.angle - this.maxStartingAngle, this.vehiclePos.angle + this.maxStartingAngle, options)
		let insideRadius = true
		if(turf.distance(trajectory[0], [this.vehiclePos.lng, this.vehiclePos.lat])*1000 > this.circleRadius){
			return false;
		}
		let i = 0;
		while( i < trajectory.length && insideRadius){
			if(turf.distance(trajectory[i], [this.vehiclePos.lng, this.vehiclePos.lat])*1000 <= this.circleRadius){
				trajectory.splice(i,1);
			}else{
				insideRadius = false;
			}
		}
		if (insideRadius){
			console.log("The path does not go out of the circle");
			return false;
		}
		if(!turf.inside(trajectory[0], sector)){
			console.log("The path does not cross the arc in the sector");
			return false;
		}
		return true;
	}
}