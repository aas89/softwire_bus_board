var readline = require('readline-sync');
var request = require('request');
let postcode = readline.question('please enter the postcode:\t');

function getCoordinates(postcode, successCallback) {
  let url = `https://api.postcodes.io/postcodes/${postcode}`;

  request(url, (error, response, body) => {
    let location = JSON.parse(body);
    let longitude = location.result.longitude;
    let latitude = location.result.latitude;
    successCallback([longitude, latitude]);
  });
}

function getNearestBusStops(coordinates, successCallback) {

  let url = `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&lat=${coordinates[1]}&lon=${coordinates[0]}&app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;

  request(url, function (error, response, body) {
    let nearest_stops = JSON.parse(body);
    successCallback(nearest_stops.stopPoints[0].id);
  });

}


function displayArrivalPredictions(stopcode, successCallback){

  let url = `https://api.tfl.gov.uk/StopPoint/${stopcode}/Arrivals?app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;

  request(url, function (error, response, body) {
    let arrival_predictions = JSON.parse(body);
    successCallback(arrival_predictions);
  });

}

getCoordinates(postcode, coordinates =>
  getNearestBusStops(coordinates, function(stopcode) {
    displayArrivalPredictions(stopcode, function(arrival_predictions){


    for (let i = 0; i<5 ; i++){
  
      let prediction = arrival_predictions[i];
      
      console.log(`Line name:\t ${prediction.lineName}`);
      console.log(`Destination:\t ${prediction.destinationName}`);
      console.log(`expected arrival:\t ${prediction.expectedArrival} \n`);
  
    }
  })
  })
);




