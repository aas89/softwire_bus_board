import ArrivalPrediction from './ArrivalPredictions.js';
import Coordinates from './Coordinates.js';
import StopInfo from './StopInfo.js';

import readline from 'readline-sync';
import request from 'request';
import express from 'express';

const app = express();
const port = 3001;
app.use(express.static('frontend'));

app.get('/', (req, res) => res.send('Please enter postcode:\tas search?postcode=<your_postcode>'));

app.get('/search?', (req, res) => {
  var postcode = req.query.postcode;

  getCoordinates(postcode)
    .then(coordinates => getNearestBusStops(coordinates))
    .then(stopInfoArray => getAllArrivalPredictions(stopInfoArray))
    .then((arrivalPredictionsArray) => res.send(arrivalPredictionsArray))
    .catch(error => res.send(error));

});



app.listen(port, () => console.log(`Example app listening on port ${port}!`));


function getCoordinates(postcode) {
  return new Promise(function (resolve, reject) {
    let url = `https://api.postcodes.io/postcodes/${postcode}`;

    request(url, (error, response, body) => {


      if (response.statusCode !== 200) {
        console.log('Invalid Postcode');
        reject('invalid postcode');
      } else {

        let location = JSON.parse(body);
        const coordinateObjects = new Coordinates(location.result.longitude, location.result.latitude);
        resolve(coordinateObjects)
      }

    });
  });
}

function getNearestBusStops(coordinates) {
  return new Promise(function (resolve, reject) {

    let url = `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius=2000&lat=${coordinates.latitude}&lon=${coordinates.longitude}&app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;
    request(url, function (error, response, body) {
      let nearest_stops = JSON.parse(body).stopPoints.slice(0, 2);
      const stopsInfo = nearest_stops.map(stop => new StopInfo(stop.commonName, stop.id));

      if (stopsInfo.length === 0) {
        console.log('Sorry there are no bus stops within 2km, please try a different postcode...?');
      }

      resolve(stopsInfo);
    })
  })
}

function getAllArrivalPredictions(StopInfoArray) {
  return Promise.all(StopInfoArray.map(stopInfo => getArrivalPredictions(stopInfo)));
}

function getArrivalPredictions(stopInfo) {

  let url = `https://api.tfl.gov.uk/StopPoint/${stopInfo.stopCode}/Arrivals?app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518`;
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {

      var arrivalPredictions = JSON.parse(body).slice(0, 5);
      arrivalPredictions = arrivalPredictions.map(prediction => new ArrivalPrediction(prediction.lineName, prediction.destinationName, Math.round((prediction.timeToStation) / 60)));
      resolve([arrivalPredictions, stopInfo]);
    })
  })
}