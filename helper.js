const locations = require('./locations.json');
const fetch = require('node-fetch');

/*
find distance between two points(sphere) using Haversine Formula
MIT open-source implmentation below
https://simplemaps.com/resources/location-distance
*/
function getDistanceFromLatLng(lat1, lng1, lat2, lng2, miles) {
  // miles optional
  if (typeof miles === 'undefined') {
    miles = false;
  }
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  function square(x) {
    return Math.pow(x, 2);
  }
  var r = 6371; // radius of the earth in km
  lat1 = deg2rad(lat1);
  lat2 = deg2rad(lat2);
  var lat_dif = lat2 - lat1;
  var lng_dif = deg2rad(lng2 - lng1);
  var a =
    square(Math.sin(lat_dif / 2)) +
    Math.cos(lat1) * Math.cos(lat2) * square(Math.sin(lng_dif / 2));
  var d = 2 * r * Math.asin(Math.sqrt(a));
  if (miles) {
    return d * 0.621371;
  } //return miles
  else {
    return d;
  } //return km
}

function findParksWithinRadius(lat, long, radius) {
  let parks = [];
  for (let i = 0; i < locations.length; ++i) {
    let distance = getDistanceFromLatLng(
      lat,
      long,
      locations[i]['lat'],
      locations[i]['lng'],
      true
    );
    if (radius > distance) {
      parks.push(locations[i]);
    }
  }
  return parks;
}

/*
join parks with its corresponding weather data
*/
const getWeatherForParks = async (parks) => {
  let parkswithWeatherData = [];
  for (let i = 0; i < parks.length; ++i) {
    let { lat, lng } = parks[i];
    parkswithWeatherData.push(
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=b4bc98201ef4fbaca2e89f55e1553217`
      )
        .then((res) => res.json())
        .then((data) => ({ park: parks[i], weather: data }))
    );
  }
  try {
    return Promise.all(parkswithWeatherData);
  } catch (e) {
    console.e(`fail to make api calls`);
  }
};

/*
Ranking Algorthims Conditions: 
1. rank by weather conditions(Clean, Clouds, Drizzle, Rain. Snow, Thunderstom ) in this order
2. Asuumed that ideal summer temperature is 68, find the deviation from ideal temparture and rank
*/
const rankBestParks = (data) => {
  const weatherConditions = {
    Clear: [],
    Clouds: [],
    Drizzle: [],
    Snow: [],
    Rain: [],
    Thunderstom: [],
  };
  for (let i = 0; i < data.length; ++i) {
    let weatherCondition = data[i].weather.weather[0].main;
    //deviation from optimal temperature
    let deviation = Math.abs(68 - data[i].weather.main.temp);
    let temp = data[i].weather.main.temp;
    let parkName = data[i].park.name;
    if (weatherConditions[weatherCondition]) {
      weatherConditions[weatherCondition].push({
        deviation: deviation,
        parkName: parkName,
        temp: temp,
        condition: weatherCondition,
      });
    }
  }
  const bestParks = [];
  //sort the parks by temperature deviations
  for (let data in weatherConditions) {
    weatherConditions[data].sort((a, b) => a.deviation - b.deviation);
    weatherConditions[data].forEach((e) => bestParks.push(e));
  }
  return bestParks;
};

module.exports = {
  getDistanceFromLatLng,
  findParksWithinRadius,
  rankBestParks,
  getWeatherForParks,
};
