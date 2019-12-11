import ArrivalPrediction from './ArrivalPredictions.js';

import readline from 'readline-sync';
import request from 'request';
import Coordinates from './Coordinates.js';

function getCoordinates(successCallback) {
  let postcode = readline.question('please enter the postcode:\t');
  let url = `https://api.postcodes.io/postcodes/${postcode}`;
      request(url, (error, response, body) => {
        if ( response.statusCode !== 200) {
          console.log('Invalid Postcode, please try again')
          getCoordinates(successCallback)
        } else {
          let location = JSON.parse(body);
          const coordinateObjects  = new Coordinates(location.result.longitude, location.result.latitude);
          successCallback(coordinateObjects);
        }
      }
      )};

function getNearestBusStops(coordinates, successCallback) {

  let url = `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius=2000&lat=${coordinates.latitude}&lon=${coordinates.longitude}&app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;

  request(url, function (error, response, body) {
    let nearest_stops = JSON.parse(body).stopPoints.slice(0,2);
    
    let stopcodes = nearest_stops.map(x => x.id);
    let stopnames = nearest_stops.map(x => x.commonName);

    if (stopcodes.length === 0){
      console.log('Sorry there are no bus stops within 2km, please try a different postcode...?');
      //getCoordinates(successCallback);
    }

    successCallback(stopcodes, stopnames);
  });

}


function getArrivalPredictions(stopcode, successCallback) {

  let url = `https://api.tfl.gov.uk/StopPoint/${stopcode}/Arrivals?app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;

  request(url, function (error, response, body) {
    let arrival_predictions = JSON.parse(body);
    
    const arrivalPredictionObjects  = arrival_predictions.map(prediction => new ArrivalPrediction(prediction.lineName, prediction.destinationName, prediction.timeToStation))
    successCallback(arrivalPredictionObjects);
  });

}

getCoordinates(coordinates =>
  getNearestBusStops(coordinates, (stopcodes, stopnames) => {
    for (let j = 0; j<stopcodes.length; j++) {
      getArrivalPredictions(stopcodes[j], arrivalPredictionObjects => {

        console.log("---------------------------------------------------------------")
        console.log(`Stop name:\t ${stopnames[j]}\n`);
        if (arrivalPredictionObjects.length === 0){
          console.log('Sorry there are no buses due at this bus stop at the moment');
        }
        for (let i = 0; i < 5; i++) {

          let prediction = arrivalPredictionObjects[i];
        
          
          console.log(`Line name:\t ${prediction.lineName}`);
          console.log(`Destination:\t ${prediction.destinationName}`);
          let minutes = parseInt(Number(prediction.timeToStation)/60);
          console.log(`Time to arrival:\t ${minutes} minutes\n`);


      }
    })
  }
  }));