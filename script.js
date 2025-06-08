import { apiKey } from './config.js'; /* I have just learned that having your api key publically available is a bad thing, oops now I know */

document.getElementById("getWeatherButton").addEventListener("click", function() {

    
    console.log("button clicked");

    let cityName = document.getElementById("input").value;
    if (!cityName.trim()) {
        alert("Please enter a city name.");
        return;
    }
    console.log ("City entered:", cityName);
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;


    fetch(url) /* fetch() sends a get request (a request to get the data from that address) to OpenWeatherMap for the weather data of the selected city. The result of fetch(url) is a Promise, represents the process of the request being sent and waiting for a response. */
    .then(response => response.json()) /* When the server sends back a response, .then() runs. "response" is the raw response object, not yet usable data. .json() tells it to take the body of the response and parse it as JSON. */
    .then(data => {
        if (data.cod != 200) { /* data.cod checks for any error codes which indicate the api's response. If it doesn't return code 200 (all working) then it returns city not found (I realize there are other errors, i'll implement those later)*/
            let errorMessage = "An error occured.";

            if (data.cod == 404) {
                errorMessage = "City not found. Please check spelling.";
            } else if (data.cod == 401) {
                errorMessage = "Invalid API key. Please contact the developer.";
            } else if (data.cod == 429) {
                errorMessage = "Too many requests. Please try again in a moment.";
            } else if (data.cod >= 500) {
                errorMessage = "Server error. Please try again later.";
            }

            document.getElementById("weatherResult").innerHTML = `<p>${errorMessage}</p>`;
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

    if ("rain" in data) {
        if (data.rain?.["1h"]) { /* Check if data.rain has data for the last hour, if so set rainVolume to that data. */
            rainVolume = `${data.rain["1h"]} mm in the last hour`;
        } else if (data.rain?.["3h"]) {
            rainVolume = `${data.rain["3h"]} mm in the last 3 hours`;
        } else {
            rainVolume = "It hasn't rained in the last 3 hours.";
        }
    } else {
        rainVolume = "No data found in database.";
    }
    /* "`${...}`" is a simpler way of writing "blah blah blah" + x + "blah blah blah" + y ...   So it is actually displayed here as: hours + ":" + minutes + "AM/PM". .padStart(x,y) only works with strings (thats why we used toString() on minutes). padStart then ensures that: when the minutes string is less than 2 characters, add a leading zero. This ensures that it displays as 7:05 instead of 7:5 for example. */

         document.getElementById("location").innerHTML = `
         <h1> ${data.name}, ${data.sys.country} </h1>`

         document.getElementById("weatherResult").innerHTML = ` 
         <h2> Current Weather </h2>
         <p> Weather: ${data.weather[0].description}</p>
         <p> Temp: ${tempF}°F </p>
         <p> Feels Like: ${tempFFeel}°F </p>
         <p> Wind Speed: ${data.wind.speed} MPH </p>
         <p> Sunrise: ${formatted}</p>
         <p> Humidity: ${humidity}%</p>
         <p> Rain: ${rainVolume}</p>
         <h6> Time of data collection (in city's local time): ${timeCollectedFormatted}</h6>
         `; /* <h2> is a level of heading, it goes from <h1> (main title) to <h6> (tiniest heading). from my understanding, .innerHTML in this case takes weatherResult (from document.getElementByID) and when the script runs changes it to what is in the ``. Also, the data.x keys that display different data can be found on the API site. */
        
    
    let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`; /* New url for forecast */
    
    fetch(forecastUrl) /* new fetch for forecast url */
    .then (response => response.json())
    .then (forecastData =>{
        if (forecastData.cod != "200") {
            document.getElementById("forecastResult").innerHTML = '<p>City not found. Please try again</p>';
            return;
        }
        /* For the forecast data, the way the data is stored with the API is in 3 hour blocks in a list.  syntax will start with forecastData.list.xxxxxx. */

        let now = new Date();
        let todayDate = new Date(now.getTime() + timezoneOffset * 1000).getUTCDate();
        let todayMonth = new Date(now.getTime() + timezoneOffset * 1000).getUTCMonth();
        let todayYear = new Date(now.getTime() + timezoneOffset * 1000).getUTCFullYear();

        let todaysForecast = forecastData.list.filter(entry => { /* .filter() is a built in function that creates a new array containing only the elements for which the given function returns true. Goes through each entry in forecastData.list and keeps only the ones where my condition is true. */
            let entryDate = new Date((entry.dt + timezoneOffset) * 1000); /* Sets entryDate to a new Date where the dt (time of data forcasted in Unix UTC) of entry (created in the line above) + timezone * 1000 */
            return entryDate.getUTCDate() === todayDate; /* Sets the specific date of month (1-31) equal to Date.now() (current time in milliseconds) + the offset to shift the time into the city's local time on the specific day of the month (.getUTCDate()) */

        })

        let conditionsByTime = {
            earlyMorning: { conditions: new Set(), pops: [] },
            morning: { conditions: new Set(), pops: [] },
            afternoon: { conditions: new Set(), pops: [] },
            evening: { conditions: new Set(), pops: [] },
            night: { conditions: new Set(), pops: [] },
        }

        todaysForecast.forEach(entry => {
            let entryDate = new Date((entry.dt + timezoneOffset) * 1000 );
            let hour = entryDate.getUTCHours();
            let timePeriod = "";
            if (hour < 6) {
                timePeriod = "earlyMorning";
            } else if (hour < 13) {
                timePeriod = "morning";
            } else if (hour < 18) {
                timePeriod = "afternoon";
            } else if (hour < 22) {
                timePeriod = "evening";
            } else {
                timePeriod = "night";
            }

            conditionsByTime[timePeriod].conditions.add(entry.weather[0].main);
            if (typeof entry.pop === "number") {
                conditionsByTime[timePeriod].pops.push(entry.pop);
            }
        })

        function formatConditions(period) {
            let conditions = Array.from(conditionsByTime[period].conditions);
            let popList = conditionsByTime[period].pops;
            let avgPop = popList.length > 0 ? Math.round((popList.reduce((sum, p) => sum + p, 0) / popList.length) * 100) : 0;

            let conditionText = conditions.length > 0 ? conditions.join(", ") : "no data";
            return `${conditionText} (${avgPop}% chance of rain)`;
        }

        /* This will display "no data" when the time slot for the day is already passed. I may fix this in the future but for now I'm going to leave it as is. */
        let forecastSummary = `
        <p><strong> Today's Conditions:</strong></p>
        <p> Early Morning: ${formatConditions("earlyMorning")}</p>
        <p> Morning: ${formatConditions("morning")}</p>
        <p> Afternoon: ${formatConditions("afternoon")}</p>
        <p> Evening: ${formatConditions("evening")}</p>
        <p> Night: ${formatConditions("night")}</p>`;

        let tempHigh = Math.max(...todaysForecast.map(entry => entry.main.temp_max)); /* todaysForecast is an array set by the segment above. Math.max finds the highest number in a list of numbers. .map() loops through each item in todaysForecast and pulls out entry.main.temp_max for each entry building a new array of just the max temps from each 3 hour block. */
        let tempLow = Math.min(...todaysForecast.map(entry => entry.main.temp_min)); /* ... is called a spread operator. Math.max() expects individual arguments (a, b, c, ...) but .map(...) gives an array of values. ... spreads the array into individual arguments. */
        let maxF = (tempHigh * 9/5 + 32).toFixed(1); /* reminder toFixed(1) sets the max decimal places to 1 */
        let minF = (tempLow * 9/5 + 32).toFixed(1);

        let peakHumidity = Math.max(...todaysForecast.map(entry => entry.main.humidity));

let gustValues = todaysForecast.map(entry => entry.wind.gust).filter(gust => gust !== undefined);
let peakGust = gustValues.length > 0 ? Math.max(...gustValues) : "No gust data";



        /* Potential additions: peak humidity, peak wind gusts, precip percentage chance */
        document.getElementById("forecastResult").innerHTML = ` 
        <h2> Today's Forecast</h2>
        ${forecastSummary}
        <p> High: ${maxF}°F</p>
        <p> Low: ${minF}°F</p>
        <p> Peak Humidity: ${peakHumidity}%</p>
        <p> Peak Wind Gust: ${peakGust} ${typeof peakGust === "number" ? "MPH" : ""}</p>
        `
    });

    })
    .catch(error => {
        console.error("Something went wrong.", error);
    })
});

