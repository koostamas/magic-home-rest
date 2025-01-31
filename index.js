const { Control, Discovery } = require('magic-home');
const express = require("express");

const PORT = process.env.PORT || 3000;

const successMessage = {success: true};

// Functions

const hexToRgb = (hex) => {

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const newHex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(newHex);

    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        }
        : null;
}

// Express

const app = express();

// Middleware

app.use(express.json());
app.use((err, req, res, next) => {

    if (err) {

        res.status(500).send(`Something went wrong! (${err})`);

    } else {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    }
});

// Endpoints

// Color endpoint
app.post("/api/color", (req, res) => {

    try {

        const color = req.body.color;
        const brightness = req.body.brightness ? req.body.brightness : 100;
        const address = req.body.address;

        if (typeof color === 'undefined') {
            res.status('500').send(`'color' must be defined`);
            return;
        }

        let r = 255, g = 255, b = 255;

        if (typeof color === 'number') {

            const c = req.body.color
            r = Math.floor(c / (256 * 256));
            g = Math.floor(c / 256) % 256;
            b = c % 256;

        } else if (typeof color === 'string') {

            const rgb = hexToRgb(color);

            if (rgb == null) throw "Couldn't parse color string"

            r = rgb.r;
            g = rgb.g;
            b = rgb.b;

        } else {

            res.status('500').send(`'color' must be of type string (hex) or number (decimal)`);
            return;
        }

        const control = new Control(address, {
            wait_for_reply: false
        });
        control.setColorWithBrightness(r, g, b, brightness)
            .then(() => res.status(200).send(successMessage))
            .catch(err => res.status(500).send(err.message));

    } catch (e) {

        res.status(500).send(e);
    }

});

// Power endpoint
app.post("/api/power", (req, res) => {

    try {
        const address = req.body.address;
        const power = req.body.power;

        if (typeof power !== 'boolean') {

            res.status('500').send(`'power' must be a boolean`);
            return;
        }

        const control = new Control(address, {
            wait_for_reply: false,
        })
        control.setPower(power)
            .then(() => res.status(200).send(successMessage))
            .catch(err => res.status(500).send(err.message));

    } catch (e) {

        res.status(500).send(e);
    }
});

//Test effects
app.post("/api/effect", (req, res) => {
    try {

        const address = req.body.address;
        const effect = req.body.effect;
        speed = req.body.speed;

        if (typeof effect !== 'string') {

            res.status('500').send(`'effect' must be a string`);
            return;
        }

        if (typeof speed !== 'number') {
            speed = 100;
        }

        const control = new Control(address, {
            wait_for_reply: false,
        })
        control.setPattern(effect, speed)
            .then(() => res.status(200).send(successMessage))
            .catch(err => {
                res.status(500).send(err.message)
            });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Device endpoint
// This is a POST endpoint, because IP can't be put in the url, so it has to be in the body,
// but some clients do not support sending a body with GET requests (looking at you, Angular)
app.post("/api/device", (req, res) => {

    const address = req.body.address;

    if (typeof address === 'undefined') {

        res.status(500).send(`'address' must be defined`);
        return;
    }

    new Control(address)
        .queryState()
        .then(state => res.json(state))
        .catch(err => res.status(500).send(err));
})

// Start listening for requests

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
