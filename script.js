import apiKey from config.js;

document.getElementById("getWeatherButton").addEventListener("click", function() {

    
    console.log("button clicked");

    let cityName = document.getElementById("input").value;
    if (!cityName.trim()) {
        alert("Please enter a city name.");
        return;
    }
    console.log ("City entered:", cityName);
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    fetch(forecastUrl)
    .then(response => response.json())
    .then(forecastData => {
        if (data.cod != 200) {
            document.getElementById("weatherResult").innerHTML = '<p>City not found. Please try again.</p>'
        }
    })




    fetch(url) /* fetch() sends a get request (a request to get the data from that address) to OpenWeatherMap for the weather data of the selected city. The result of fetch(url) is a Promise, represents the process of the request being sent and waiting for a response. */
    .then(response => response.json()) /* When the server sends back a response, .then() runs. "response" is the raw response object, not yet usable data. .json() tells it to take the body of the response and parse it as JSON. */
    .then(data => {
        if (data.cod != 200) { /* data.cod checks for any error codes which indicate the api's response. If it doesn't return code 200 (all working) then it returns city not found (I realize there are other errors, i'll implement those later)*/
            document.getElementById("weatherResult").innerHTML = '<p>City not found. Please try again.</p>';
            return;
        }
         console.log(data); /* this .then() runs once the JSON has been parsed. data is now a regular JavaScript object that contains all the weather info.  */ /* This logs the data into the console.  Keys i'll find in data: data.name, data.main.temp, data.weather[0].description, data.wind.speed */
        
         /* In the future I'd like to put the following in a function to make it a bit cleaner but I'll worry about that in the future so I don't mess up my comments */
    let tempC = data.main.temp;
    let tempF = (tempC * (9/5) + 32).toFixed(1);
    let tempCFeel = data.main.feels_like;
    let tempFFeel = (tempCFeel * (9/5) + 32).toFixed(1);
    let humidity = data.main.humidity;
    let sunrise = data.sys.sunrise;
    let timezoneOffset = data.timezone;
    let sunriseDate = new Date((sunrise + timezoneOffset) * 1000); /* First, to figure out the sunrise time convert the seconds to milliseconds */
    let hours = sunriseDate.getUTCHours(); /* getHours() and getMinutes() are built in JS functions, make sure to convert from seconds to milliseconds like I did above because JS uses milliseconds. the Date class that was declared above is also a built in JS */
    let minutes = sunriseDate.getUTCMinutes(); /* NOTE: Previously used getHours() and getMinutes() but that made it use only my local time zone, getUTCHours() and getUTCMinutes() is a great way to fix this and is also a built in function. */
    let ampm = hours >= 12 ? "PM" : "AM"; /* ampm = if hours is greater than or equal to 12 then ampm = PM, otherwise ampm = AM. */
    hours = hours % 12 || 12; /* converts 0 to 12 */
    let formatted = `${hours}:${minutes.toString().padStart(2, 0)} ${ampm}`;

    let timeCollected = new Date((data.dt + timezoneOffset) * 1000); /* Display at the bottom of the page what time the weather data being displayed was collected in the local time of the city searched */
    let timeCollectedHours = timeCollected.getUTCHours();
    let timeCollectedMins = timeCollected.getUTCMinutes();
    let collectedAMPM = timeCollectedHours >= 12 ? "PM" : "AM";
    timeCollectedHours = timeCollectedHours % 12 || 12;
    let timeCollectedFormatted = `${timeCollectedHours}:${timeCollectedMins.toString().padStart(2, 0)} ${collectedAMPM}`;

    let rain = data.rain;
    let rainVolume = "";

    if (data.rain?.["1h"]) { /* Check if data.rain has data for the last hour, if so set rainVolume to that data. */
        rainVolume = `${data.rain["1h"]} mm in the last hour`;
    } else if (data.rain?.["3h"]) {
        rainVolume = `${data.rain["3h"]} mm in the last 3 hours`;
    } else {
        rainVolume = "It hasn't rained in the last 3 hours.";
    }
    /* "`${...}`" is a simpler way of writing "blah blah blah" + x + "blah blah blah" + y ...   So it is actually displayed here as: hours + ":" + minutes + "AM/PM". .padStart(x,y) only works with strings (thats why we used toString() on minutes). padStart then ensures that: when the minutes string is less than 2 characters, add a leading zero. This ensures that it displays as 7:05 instead of 7:5 for example. */

         document.getElementById("location").innerHTML = `
         <h1> ${data.name}, ${data.sys.country} </h1>`

         document.getElementById("weatherResult").innerHTML = ` 
         <h2> Current Weather </h2>
         <p> Weather: ${data.weather[0].description}</p>
         <p> Temp: ${tempF}° F </p>
         <p> Feels Like: ${tempFFeel}° F </p>
         <p> Wind Speed: ${data.wind.speed} MPH </p>
         <p> Sunrise: ${formatted}</p>
         <p> Humidity: ${humidity}%</p>
         <p> Rain: ${rainVolume}</p>
         <h6> Time of data collection (in city's local time): ${timeCollectedFormatted}</h6>
         `; /* <h2> is a level of heading, it goes from <h1> (main title) to <h6> (tiniest heading). from my understanding, .innerHTML in this case takes weatherResult (from document.getElementByID) and when the script runs changes it to what is in the ``. Also, the data.x keys that display different data can be found on the API site. */
        
        document.getElementById("forecastResult").innerHTML = `
        
        `

    })
    .catch(error => {
        console.error("Something went wrong.", error);
    })
});

