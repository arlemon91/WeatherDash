let defaultCityArr = [
  "Austin",
  "Chicago",
  "New York",
  "Orlando",
  "San Francisco",
  " Seattle",
  "Denver",
  "Atlanta",
];
let cities = [];

$(document).ready(function () {
  let appID = "2283f8cb8d1d8568c222f4ed3459c3b4";
  let mapquestID = "Ro62gR6y6GdOzLZCJbOTDKhK50QK8o1r";
  let lat;
  let lon;
  let state;
  let searchCity;

  function initailLocale(lat, lon) {
    LatLonStateFinder(currentWeather, forecastData);
    $("#date").html(moment().format(" (M/D/YYYY) "));
  }

  function currentWeather(fxn) {
    let weather =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      searchCity +
      "&APPID=" +
      appID;
    $.getJSON(weather, function (json) {
      console.log("This is the current weather data: ");
      console.log(json);
      searchCity = json.name;
      $("#currentCity").html(searchCity);
      $("#weather_image").attr(
        "src",
        "https://openweathermap.org/img/w/" + json.weather[0].icon + ".png"
      );
      $("#temp").html(
        (((json.main.temp - 273.15) * 9) / 5 + 32).toFixed(1) + "&#8457"
      );
      $("#humidity").html(json.main.humidity + "%");
      $("#windspeed").html((json.wind.speed * 2.237).toFixed(1) + " MPH");
      $("#description").html("Description: " + json.weather[0].description);
      lat = json.coord.lat;
      lon = json.coord.lon;
      console.log(
        "lat is " +
          lat +
          " and lon is " +
          lon +
          ". Data taken from current weather json"
      );
      console.log("The saved search city name is " + searchCity);
      makeCityArr();
      populateCity(cities);
      if (fxn !== undefined) {
        fxn();
      }
    });
  }

  function LatLonStateFinder(waitfxn1, waitfxn2) {
    let locationurl =
      "https://www.mapquestapi.com/geocoding/v1/reverse?key=" +
      mapquestID +
      "&location=" +
      lat +
      "," +
      lon +
      "&includeRoadMetadata=true&includeNearestIntersection=true";
    $.ajax({
      url: locationurl,
      method: "GET",
    }).then(function (address) {
      console.log("This is the address given the lat and lon: ");
      console.log(address);
      state = address.results[0].locations[0].adminArea3;
      searchCity = address.results[0].locations[0].adminArea5;
      console.log("After running latlon the city is " + searchCity);
      $("#currentState").html(
        ", " + address.results[0].locations[0].adminArea3
      );
      let mapurl =
        "https://www.mapquestapi.com/staticmap/v5/map?key=" +
        mapquestID +
        "&center=" +
        searchCity +
        "," +
        state +
        "&size=@2x";
      $("#mapquest").attr("src", mapurl);
      if (waitfxn1 !== undefined) {
        waitfxn1();
      }
      if (waitfxn2 !== undefined) {
        waitfxn2();
      }
    });
  }

  function makeCityArr() {
    cities = [];
    let counter = 0;
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (searchHistory === null) {
      searchHistory = [];
    } else {
      searchHistory = searchHistory.reverse();
    }
    for (let i = 0; i < 8; i++) {
      if (searchHistory[i] !== undefined) {
        cities.push(searchHistory[i]);
        counter++;
      } else {
        break;
      }
    }
    if (cities.length < 8) {
      for (let j = 0; counter < 8; j++) {
        if (cities.indexOf(defaultCityArr[j]) === -1) {
          cities.push(defaultCityArr[j]);
          counter++;
        }
      }
    }
    return cities;
  }

  function populateCity(arr) {
    let cityId = 1;
    for (let i = 0; i < 8; i++) {
      $("#city" + cityId).html(arr[i]);
      cityId++;
    }
  }

  populateCity(makeCityArr());

  //get initial weather data using current position from geolocation
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    console.log("lat is " + lat + " and lon is " + lon);
    initailLocale(lat, lon);
  });

  //button listeners to select data for selected cities
  $("button").on("click", function () {
    event.preventDefault();

    if ($(this).attr("id") === "searchbtn") {
      searchCity = $(this).prev().val().trim();
    } else {
      searchCity = $(this).text();
    }
    console.log("The inputed city is " + searchCity);
    currentWeather(LatLonStateFinder);
    forecastData();
  });

  //clear search history on click
  $("#clear").on("click", setDefault);
});
