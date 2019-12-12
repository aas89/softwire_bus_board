function loadData(postcode) {
    var xhttp = new XMLHttpRequest();

    xhttp.open('GET', `http://localhost:3001/search?postcode=${postcode}`)

    xhttp.setRequestHeader('Content-Type', 'application/json');


    xhttp.onload = function () {


        try {
            var predictions = JSON.parse(this.response);
        }
        catch(err) {
            document.querySelector("#results").innerHTML = `<h1> Invalid postcode, try again </h1>`

        }



        document.querySelector("#results").innerHTML = `

        
            <h3>${predictions[0][1].stopName}</h3>
            <ul>
                <li>${predictions[0][0][0].timeToStation} minutes: ${predictions[0][0][0].lineName} to ${predictions[0][0][0].destinationName}</li>
                <li>${predictions[0][0][1].timeToStation} minutes: ${predictions[0][0][1].lineName} to ${predictions[0][0][1].destinationName}</li>
                <li>${predictions[0][0][2].timeToStation} minutes: ${predictions[0][0][2].lineName} to ${predictions[0][0][2].destinationName}</li>
                <li>${predictions[0][0][3].timeToStation} minutes: ${predictions[0][0][3].lineName} to ${predictions[0][0][3].destinationName}</li>
                <li>${predictions[0][0][4].timeToStation} minutes: ${predictions[0][0][4].lineName} to ${predictions[0][0][4].destinationName}</li>
            </ul>
            <h3>${predictions[1][1].stopName}</h3>
            <ul>
                <li>${predictions[1][0][0].timeToStation} minutes: ${predictions[1][0][0].lineName} to ${predictions[1][0][0].destinationName}</li>
                <li>${predictions[1][0][1].timeToStation} minutes: ${predictions[1][0][1].lineName} to ${predictions[1][0][1].destinationName}</li>
                <li>${predictions[1][0][2].timeToStation} minutes: ${predictions[1][0][2].lineName} to ${predictions[1][0][2].destinationName}</li>
                <li>${predictions[1][0][3].timeToStation} minutes: ${predictions[1][0][3].lineName} to ${predictions[1][0][3].destinationName}</li>
                <li>${predictions[1][0][4].timeToStation} minutes: ${predictions[1][0][4].lineName} to ${predictions[1][0][4].destinationName}</li>
            </ul>`


    };

    xhttp.send();

};