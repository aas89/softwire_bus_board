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
    let nearest_two = [nearest_stops.stopPoints[0],nearest_stops.stopPoints[1]];
    let stopcodes = [nearest_two[0].id, nearest_two[1].id];
    let stopnames = [nearest_two[0].commonName, nearest_two[1].commonName];

    successCallback(stopcodes, stopnames);
  });

}


function getArrivalPredictions(stopcode, successCallback) {

  let url = `https://api.tfl.gov.uk/StopPoint/${stopcode}/Arrivals?app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;

  request(url, function (error, response, body) {
    let arrival_predictions = JSON.parse(body);

    successCallback(arrival_predictions);
  });

}

getCoordinates(postcode, coordinates =>
  getNearestBusStops(coordinates, (stopcodes, stopnames) => {
    for (let j = 0; j<stopcodes.length; j++) {
      getArrivalPredictions(stopcodes[j], arrival_predictions => {

        console.log("---------------------------------------------------------------")
        console.log(`Stop name:\t ${stopnames[j]}\n`);
        for (let i = 0; i < 5; i++) {

          let prediction = arrival_predictions[i];
        
          
          console.log(`Line name:\t ${prediction.lineName}`);
          console.log(`Destination:\t ${prediction.destinationName}`);
          let minutes = parseInt(Number(prediction.timeToStation)/60);
          console.log(`Time to arrival:\t ${minutes} minutes\n`);


      }
    })
  }
  }));