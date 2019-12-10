var readline = require('readline-sync');
var request = require('request');

let postcode = readline.question('please enter the postcode:      ');

postcode_to_LonLat_url = 'https://api.postcodes.io/postcodes/'+postcode;
console.log(postcode_to_LonLat_url);



request(postcode_to_LonLat_url, function (error, response, body) {
  console.log(body);
  let location = JSON.parse(body);
  console.log(location.longitude)
});




let stopcode = readline.question('please enter stopcode:   ')

request_url = 'https://api.tfl.gov.uk/StopPoint/'+stopcode+'/Arrivals'+'?app_id=343014cd&app_key=9847cc3d0bbe15906723b4186e3aa518'


request(request_url, function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  let arrival_predictions = JSON.parse(body); 

  for (let i = 0; i<5 ; i++){

    let prediction = arrival_predictions[i]
    
    console.log('Line name:   ' +  prediction.lineName);
    console.log('Destination:  '+ prediction.destinationName);
    console.log('expected arrival:   '+ prediction.expectedArrival + "\n");

    

  }
  
});