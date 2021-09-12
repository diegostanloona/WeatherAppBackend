const express = require('express');
const bodyParser = require('body-parser');
const HttpError = require('./models/http-error');
const fetch = require('node-fetch');

let weather = [];
const cities = [2442047, 2459115, 9807, 116545, 368148, 418440, 468739, 455825, 766273, 638242, 2122265, 1290062, 1398823, 1521894, 1582504, 1313090, 1940345, 28743736, 2151330, 1047378, 1225448, 1105779, 1118370, 2423945];

const fetchWeathers = async () => {
	cities.forEach(async city => {
		try {
				const response = await fetch(`https://www.metaweather.com/api/location/${city}/`, {
							 method: 'GET',
							 headers: {
								'Content-Type': 'application/json'
							 }
					 });
				weather.push(await response.json());
		} catch (e) {
				console.log(e);
				const error = new HttpError('Something went wrong.', 500);
				return next(error);
		}
	});
	console.log("Weathers fetched")
}

fetchWeathers();


setInterval(() => {
	fetchWeathers();
}, 300000)

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', 'https://weatherapp-ac8db.web.app');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
	next();
});

app.get('/', (req, res, next) => {
    res.json({test: "test"});
});

app.get('/weather', async (req, res, next) => {
    if(req.method === 'OPTIONS'){
        return next();
    }

    if (!weather) {
        return next(new HttpError('No weather have been found.', 404));
    }

    res.json({ weather: weather});
});

app.use((req, res, next) => {
	return next(new HttpError('Could not find this route.', 404));
});

app.use((err, req, res, next) => {
    console.log("TEST");
    res.status(err.code || 500).json({ message: err.message || "Error." });
});

const server = app.listen(process.env.PORT || 5000);
console.log("Listening on port " + (process.env.PORT || 5000));
