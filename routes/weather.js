const express = require('express');
const router = express.Router();
const request = require('request');

console.log('✅ weather.js loaded');

// Weather route - GET
router.get('/weather', (req, res) => {
    console.log('🌤️ GET /weather - Rendering weather page');
    try {
        res.render('weather', {
            title: 'Weather Forecast - Berties Books',
            city: 'London',
            weather: null,
            error: null,  // ADD THIS - explicitly set error to null
            userId: req.session ? req.session.userId : null
        });
        console.log('✅ Weather page rendered successfully');
    } catch (err) {
        console.error('❌ Error rendering weather page:', err.message);
        res.status(500).send('Error loading weather page: ' + err.message);
    }
});

// Weather API call - POST
router.post('/weather', (req, res) => {
    const city = req.body.city || 'London';
    const apiKey = 'ba9934621c8833a7700f7911e0dc8404';

    console.log(`🌤️ POST /weather - Fetching weather for: ${city}`);
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, function (err, response, body) {
        if (err) {
            console.error('Weather API error:', err.message);
            return res.render('weather', {
                title: 'Weather Forecast - Berties Books',
                city: city,
                weather: null,
                error: 'Error fetching weather data: ' + err.message,
                userId: req.session ? req.session.userId : null
            });
        }

        try {
            const weather = JSON.parse(body);
            console.log('Weather API response code:', weather.cod);

            if (weather.cod !== 200) {
                console.error('Weather API returned error:', weather.message);
                return res.render('weather', {
                    title: 'Weather Forecast - Berties Books',
                    weather: weather,
                    city: city,
                    error: null,
                    userId: req.session ? req.session.userId : null
                });
            }

            console.log(`✅ Weather data received for ${weather.name}`);
            res.render('weather', {
                title: 'Weather Forecast - Berties Books',
                weather: weather,
                city: city,
                error: null,
                userId: req.session ? req.session.userId : null
            });
        } catch (parseErr) {
            console.error('Weather parse error:', parseErr.message);
            res.render('weather', {
                title: 'Weather Forecast - Berties Books',
                city: city,
                weather: null,
                error: 'Error parsing weather data: ' + parseErr.message,
                userId: req.session ? req.session.userId : null
            });
        }
    });
});

module.exports = router;
