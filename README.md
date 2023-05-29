
# Magic-Home REST API

![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/koostamas/magic-home-rest) ![Docker Pulls](https://img.shields.io/docker/pulls/koostamas/magic-home-rest)

Simple REST API to control magic-home lights on the same network, built with [magic-home](https://github.com/jangxx/node-magichome) and [express](https://expressjs.com/).

The difference to the original project is that this API doesn't use device id's and automatic discovery (which were not working well for me).
Instead, it uses the device ip to control devices (the underlying library uses ip's as well), so you should set up static addresses in your DHCP server for your Magic Home devices. 

## How to run

### Via docker

- Pull the latest version using  `docker pull koostamas/magic-home-rest:latest`
- Run the image using `docker run --net=host --env PORT=3001 koostamas/magic-home-rest` (Customize port to your liking)

### Manually

- Clone this repository
- Make sure NPM/Node is installed
- Run `npm ci`
- Run `npm start`

## API

### Get device state

Gets a the state of a magic-home device, by it's IP address

**URL** : `/api/device`

**Method** : `POST`

#### Success Response

**Code** : `200 OK`

**Content example**

```json5
{
  "type": 51,
  "on": true,
  "mode": "color",
  "speed": 66.66666666666667,
  "color": {
    "red": 255,
    "green": 255,
    "blue": 0
  },
  "warm_white": 0,
  "cold_white": 0
}
```
### Change color

Change the color of a magic-home device, by it's IP address.

**URL** : `/api/color/`

**Method** : `POST`

**Data constraints**

```json5
{
    "address": "address of magic-home device, string, required",
    "color": "color to change to, string (hex) or number (decimal), required",
    "brightness": "brightness to adjust the color with, number, optional"
}
```

**Data example**

```json5
{
    "address": "192.168.69.198",
    "color": "#FF0000", // or "FF0000" or 16711680
    "brightness": "100"
}
```

#### Success Response

**Condition** : Color commands were sent

**Code** : `200 OK`

### Turn on/off

Change the power state of a magic-home device, by it's IP address.

**URL** : `/api/power/`

**Method** : `POST`

**Data constraints**

```json5
{
    "address": "address of magic-home device, string, required",
    "power": "power state to set, required"
}
```

**Data example**

```json5
{
    "address": "192.168.69.198",
    "power": false
}
```

#### Success Response

**Condition** : Power commands were sent

**Code** : `200 OK`

### Activate an effect

Activate an effect on a magic-home device, by it's IP address.

**URL** : `/api/effect/`

**Method** : `POST`

**Data constraints**

See [this repository](https://github.com/jangxx/node-magichome#built-in-patterns) for a list of patterns.

```json5
{
    "address": "address of magic-home device, string, required",
    "effect": "effect pattern to set, required",
    "speed": "speed of the effect, number of 1 - 100, optional"
}
```

**Data example**

```json5
{
    "address": "192.168.69.198",
    "effect": "seven_color_cross_fade",
    "speed": 50
}
```

### Success Response

**Condition** : Effect commands were sent

**Code** : `200 OK`

