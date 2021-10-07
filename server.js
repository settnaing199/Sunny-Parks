const express = require('express');
const {
  findParksWithinRadius,
  rankBestParks,
  getWeatherForParks,
} = require('./helper');

const app = express();
app.use(express.json());

let port = 3000;

app.post('/parks', async (req, res) => {
  const { lat, long, radius } = req.body;

  const parks = findParksWithinRadius(lat, long, radius);
  const parksWithWeather = await getWeatherForParks(parks);
  const bestParks = rankBestParks(parksWithWeather);
  res.send(bestParks);
});

app.listen(port, () => {
  console.log(`server is running local host ${port}`);
});
