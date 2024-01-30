/**
 * @author Mathieu Chantot <mathieu.chantot@hes-so.ch>
 * @date 01/24
 * 
 * @todo look at all the todo
 * @todo configure every transition between states
 * @todo start integration
 */

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import PaintMode from "./draw/src/index.js";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DrawPath from './DrawPath'; // adjust the path as needed
import StaticMode from '@mapbox/mapbox-gl-draw-static-mode';
import Circle from 'mapbox-gl-circle';
import {PathComputing} from './PathComputing';
import * as turf from '@turf/turf';

import markerImage from "./img/Marker.png";

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

/**@todo Remove the  access token */
mapboxgl.accessToken = 'pk.eyJ1IjoibWF0aGlldWN0IiwiYSI6ImNscmo5a2pvdDAxMm0ybG53NXRlZGxoODUifQ.f56eMB0t3T9SqLPfeth2Nw';

export default function App(){

  // Element to be displayed on the map.
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const marker = useRef(null);
  const circle = useRef(null);
  const [zoom, setZoom] = useState(20);
  
  const [drawingMode, setdrawingMode] = useState('');
  
  // All those const should be modified when integrating or get from a json file
  const circleRadius = 3;
  const precision = 0.2;
  const maxAngle = 30;
  const turningRadius = 0.001;

  /**
   * @todo find another way to manage layer and source id
   */
  const drawLayerId = 'trajectory';
  const drawSourceId = 'trajectory';
  const computedlayerId = 'computedTrajectory';
  const computedsourceId = 'computedTrajectory';
  const rightLimitLayerId = 'rightLimit';
  const leftLimitLayerId = 'leftLimit';
  const rightLimitSourceId = 'rightLimit';
  const leftLimitSourceId = 'leftLimit';
  

  // This should be modified when integrating
  var vehiclePos = {lng:7.1474, lat:46.7968, angle:255};

  /**
   * @brief Initialize the map and the draw tool
   */

  // Called at initialization.
  useEffect(() => {
    // Initialize map
    if (map.current) return; 
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte-imagery.vt/style.json",
      center: [vehiclePos.lng, vehiclePos.lat],
      zoom: zoom
    });
    // Initialize draw tool
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      modes: Object.assign({
        draw_paint_mode: PaintMode,
        static_mode: StaticMode
      }, MapboxDraw.modes),
      defaultMode: 'static_mode'

    });
    map.current.addControl(draw.current); 
  });

  // Called when the map is initialized or when the vehicle position is updated.
  useEffect(() => {
    // Initialize starting polygon
    map.current.on('load', () => {
      const center = [vehiclePos.lng, vehiclePos.lat];
      const radius = 0.003; // radius in kilometers
      const bearing1 = vehiclePos.angle - maxAngle; // start bearing in degrees
      const bearing2 = vehiclePos.angle + maxAngle; // end bearing in degrees
      const options = {steps: 50, units: 'kilometers', properties: {fill: '#0f0'}};
      var sector = turf.sector(center, radius, bearing1, bearing2,options);
      /** @todo create a generic function for adding source and layer */
      map.current.addSource('sector', {
        'type': 'geojson',
        'data': sector
      });
      map.current.addLayer({
        'id': 'maine',
        'type': 'fill',
        'source': 'sector',
        'layout': {},
        'paint': {
        'fill-color': '#0080ff', // blue color fill
        'fill-opacity': 0.5
        }
        });
    })
    //Add vehicle marker
    if (!marker.current){
      const img = document.createElement("img");
      img.className = "marker";
      img.height = 70;
      img.src = markerImage;
      marker.current = new mapboxgl.Marker({ element: img });
      //Add circle
      circle.current = new Circle({lat: vehiclePos.lat, lng: vehiclePos.lng}, circleRadius, {
        minRadius: 2,
        fillColor: '#29AB87'
      }).addTo(map.current);
    }
    circle.current.setCenter({lat: vehiclePos.lat, lng: vehiclePos.lng});
    marker.current.setRotationAlignment("map");
    marker.current.setRotation(vehiclePos.angle);
    marker.current.setLngLat([vehiclePos.lng, vehiclePos.lat]);
    marker.current.addTo(map.current);    
  }, [vehiclePos]);

  /**
   * @brief Setup drawing mode.
   * @param {string} drawingMode - The drawing mode to set
   */
  function drawState(drawingMode){
    deleteAll();
    setdrawingMode(drawingMode);
    draw.current.changeMode(drawingMode === 'dot' ? 'draw_line_string' : 'draw_paint_mode');
    //disable map mouvement if needed
    if (drawingMode === 'line'){
      disableMovement();
    }else{
      enableMovement();
    } 
  }

  /**
   * @brief Setup moving mode.
   */
  function moveState(){
    if (!map.current) return; // wait for map to initialize
    setdrawingMode('move');
    deleteAll();
    draw.current.changeMode('static_mode');
    enableMovement();
  }

  /**
   * @brief Delete current draw.
   */
  function deleteAll(){
    draw.current.deleteAll();
    deleteLayer(drawLayerId, drawSourceId);
    deleteLayer(computedlayerId, computedsourceId);
    deleteLayer(rightLimitLayerId, rightLimitSourceId);
    deleteLayer(leftLimitLayerId, leftLimitSourceId);
  }

  /**
   * @brief Delete a specific layer and source.
   * @param {string} layerId - The layer id to delete
   * @param {string} sourceId - The source id to delete
   */
  function deleteLayer(layerId, sourceId){
    if(map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if(map.current.getSource(sourceId)){
      map.current.removeSource(sourceId);
    }
  }

  /**
   * @brief Enable map movement.
   */
  function enableMovement(){
    map.current["dragPan"].enable();
    map.current["scrollZoom"].enable();
    map.current["boxZoom"].enable();
    map.current["dragRotate"].enable();
    map.current["keyboard"].enable();
    map.current["doubleClickZoom"].enable();
    map.current["touchZoomRotate"].enable();
  }
  /**
   * @brief Disable map movement.
   */
  function disableMovement(){
    map.current["dragPan"].disable();
    map.current["scrollZoom"].disable();
    map.current["boxZoom"].disable();
    map.current["dragRotate"].disable();
    map.current["keyboard"].disable();
    map.current["doubleClickZoom"].disable();
    map.current["touchZoomRotate"].disable();
  }

  /**
   * @brief Exit the drawing subapp.
   */
  function exit(){
    //Go back to main menu
    alert("Exit");
  }

  /**
   * @brief Manage the validation of the drawing.
   */
  function buildPath(){
    // Go to validation "state"
    enableMovement();
    draw.current.changeMode('static_mode');
    
    //Features to be displayed
    let trajectory = [];
    let computedTrajectory = [];
    var limits = {right:[], left:[]};

    //Extract data points from map
    const features = draw.current.getAll();

    //Paint mode and draw line string doesn't store coordinates in the same way
    if (features.features.length > 0) {
      /** @todo there is anothere way to get the coordinates */
      trajectory = features.features[0].geometry.coordinates;
    }
    if(drawingMode === 'line'){
      trajectory = trajectory[0];
    }
    deleteAll();

    // Compute every features
    var pathComputing = new PathComputing(precision, vehiclePos, circleRadius, maxAngle, turningRadius);
    let result = pathComputing.computeTrajectory(trajectory.map(innerArray => [...innerArray]));
    //Check if a warning has been raised
    if(!result){
      console.warn("There is a problem with the trajectory");
      return;
    }
    [computedTrajectory, limits] = result;

    //Display computed features
    displayTrajectory(drawLayerId, drawSourceId, trajectory,  '#0000FF',"solid");
    displayTrajectory(computedlayerId, computedsourceId, computedTrajectory, '#FF0000',"solid");
    displayTrajectory(rightLimitLayerId, rightLimitSourceId, limits.rightLimit, '#FF0000',"dotted");
    displayTrajectory(leftLimitLayerId, leftLimitSourceId, limits.leftLimit , '#FF0000',"dotted");
    
    
    //Send data points to server
  }

  function displayTrajectory(layerID, sourceId, trajectory, color, lineType){
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: trajectory
        }
      }
    });
    map.current.addLayer({
      id: layerID,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': color,
        'line-width': 2,
        'line-dasharray': lineType === 'dotted' ? [1, 1] : [1]
      }
    });

  }

  return (
    <div>
      <div className="bar">
        <DrawPath drawingMode={drawingMode} moveState={moveState} drawState={drawState}  validation={buildPath} exit={exit} />
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

