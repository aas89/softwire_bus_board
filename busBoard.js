import ArrivalPrediction from './ArrivalPredictions.js';

import readline from 'readline-sync';
import request from 'request';
import Coordinates from './Coordinates.js';
import StopInfo from './StopInfo.js';

let postcode = readline.question('please enter the postcode:\t');


function getCoordinates(postcode) {
  let url = `https://api.postcodes.io/postcodes/${postcode}`;

  request(url, (error, response, body) => {
    let location = JSON.parse(body);
    const coordinateObjects  = new Coordinates(location.result.longitude, location.result.latitude);
    return coordinateObjects;
  });
}

function getNearestBusStops(coordinates) {

  let url = `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&lat=${coordinates.latitude}&lon=${coordinates.longitude}&app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;

  request(url, (error, response, body) => {
    let nearest_stops = JSON.parse(body).stopPoints.slice(0,2);

    const stopInfo = nearest_stops.map(stop => new StopInfo(stop.commonName, stop.id))
    
    // let stopcodes = nearest_stops.map(x => x.id);
    // let stopnames = nearest_stops.map(x => x.commonName);

    return stopInfo;
  });

}


function getArrivalPredictions(stopInfo) {

  for (let j = 0; j<stopInfo.length; j++) {

    let url = `https://api.tfl.gov.uk/StopPoint/${stopInfo[j].stopCode}/Arrivals?app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;

    request(url, (error, response, body) => {
      let arrival_predictions = JSON.parse(body);
      const arrivalPredictions  = arrival_predictions.map(prediction => new ArrivalPrediction(prediction.lineName, prediction.destinationName, prediction.timeToStation));
      
    });

  }

  return arrivalPredictions;

}



function print(arrivalPredictionObjects, stopnames){
  
  for (let j = 0; j<stopcodes.length; j++) {
    getArrivalPredictions(stopcodes[j], arrivalPredictionObjects => {

      console.log("---------------------------------------------------------------")
      console.log(`Stop name:\t ${stopnames[j]}\n`);
      for (let i = 0; i < 5; i++) {

        let prediction = arrivalPredictionObjects[i];
      
        
        console.log(`Line name:\t ${prediction.lineName}`);
        console.log(`Destination:\t ${prediction.destinationName}`);
        let minutes = parseInt(Number(prediction.timeToStation)/60);
        console.log(`Time to arrival:\t ${minutes} minutes\n`);


    }
  })
}
}



getCoordinates(postcode)
.then(coordinates => getNearestBusStops(coordinates))
.then((stopcodes,stopnames) => getArrivalPredictions(stopcodes, stopnames))
.then((arrivalPredictionObjects, stopnames) => print(arrivalPredictionObjects, stopnames));
