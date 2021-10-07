# Sunny-Parks

### API

- express.js

### Dev Setup

```bash
npm install
npm run dev
```

- api-backend will launch at: http://localhost:3000/
- endpoint /parks
- Please create .env file and add API_KEY = `weather api key`
- Must pass in lat, lng, radius as body
- ex. {"lat": 42, "lng": -70, "radius": 80}
- return ranked parks along with their temperature and weather conditions
- temperature and weather conditions are used for best park ranking algorithm
