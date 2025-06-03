document.getElementById("getWeatherButton").addEventListener("click", function() {

    
    console.log("button clicked");

    let cityName = document.getElementById("input").value;
    console.log ("City entered:", cityName);
    let apiKey = "4e8ddf8786f8126d264f95a3d70a0f72";
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Something went wrong.", error);
    })
});

