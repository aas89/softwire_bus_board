import ArrivalPrediction from './ArrivalPredictions.js';
import Coordinates from './Coordinates.js';
import StopInfo from './StopInfo.js';

import readline from 'readline-sync';
import request from 'request';



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
    const stopInfo = nearest_stops.map(stop => new StopInfo(stop.commonName, stop.id));

    if (stopInfo.length === 0){
      console.log('Sorry there are no bus stops within 2km, please try a different postcode...?');
    }

    successCallback(stopInfo);
  });

}


function getArrivalPredictions(stopInfoSingle, successCallback) {
  
    let url = `https://api.tfl.gov.uk/StopPoint/${stopInfoSingle.stopCode}/Arrivals?app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;
   
    request(url, function (error, response, body) {
      
      var arrival_predictions = JSON.parse(body).slice(0,5);
      var arrivalPredictionObjects  = arrival_predictions.map(prediction => new ArrivalPrediction( prediction.lineName, prediction.destinationName, prediction.timeToStation))

      successCallback(arrivalPredictionObjects,stopInfoSingle);
      
    });
  
}



function printPredictions(busStopsPredictions,stopInfoSingle,successCallback){
    console.log("---------------------------------------------------------------");
    console.log(`Stop name:\t ${stopInfoSingle.stopName}\n`);
    if (busStopsPredictions.length === 0){
      console.log('Sorry there are no buses due at this bus stop at the moment');
    } else{
      for (let i = 0; i < 5; i++) {

        let prediction = busStopsPredictions[i];
      
        console.log(`Line name:\t ${prediction.lineName}`);
        console.log(`Destination:\t ${prediction.destinationName}`);
        let minutes = parseInt(Number(prediction.timeToStation)/60);
        console.log(`Time to arrival:\t ${minutes} minutes\n`);
  
  
      }
    }

}



getCoordinates(coordinates =>
  getNearestBusStops(coordinates, stopInfo => {
    for (let j = 0; j<2; j++){
      getArrivalPredictions(stopInfo[j], (busStopsPredictions,stopInfoSingle) => {
        printPredictions(busStopsPredictions, stopInfoSingle)

        
      })
    }
    
      
    })
);
       