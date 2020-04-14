/* Requires */
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const socketio = require('socket.io');



/* Variables */
var port;
var serverCache = {};
var userCache = {};
var iconCache = {};
var invitesCache = {};



/* Express setup */
var app = express();
app.use(express.static('public'))
app.use(bodyParser.json());

/* Start up web stuff */
if ((process.getuid && (process.getuid() === 0))) {
	port = 80;
} else {
	port = process.env.PORT || 3000;
}
var server = app.listen(port, () => {
	console.log("Started server at  "+server.address().address+':'+server.address().port);
});

/* SocketIO */
const io = socketio.listen(server);

/* Routing */
app.get('/user/:id', async (req, res) => {
	try {
		if (!userCache[req.params.id]) {
			var response = await axapi.get('/users/'+req.params.id);
			userCache[req.params.id] = response.data;
			res.status(response.status);
			res.set({
				"x-ratelimit-bucket": response.headers["x-ratelimit-bucket"],
				"x-ratelimit-remaining": response.headers["x-ratelimit-remaining"],
				"x-ratelimit-reset": response.headers["x-ratelimit-reset"],
				"x-ratelimit-reset-after": response.headers["x-reset-after"]
			});
			res.send(response.data);
		} else {
			res.send(userCache[req.params.id]);
		}
	} catch (e) {
		res.status(400);
		res.send(false);
	}
});

app.get('/invite/:code', async (req, res) => {
	try {
		if (!invitesCache[req.params.code]) {
			var response = await axapi.get('/v6/invite/'+req.params.code+'?with_counts=true');
			invitesCache[req.params.code] = response.data;
			res.status(response.status);
			res.set({
				"x-ratelimit-bucket": response.headers["x-ratelimit-bucket"],
				"x-ratelimit-remaining": response.headers["x-ratelimit-remaining"],
				"x-ratelimit-reset": response.headers["x-ratelimit-reset"],
				"x-ratelimit-reset-after": response.headers["x-reset-after"]
			});
			serverCache[response.data.guild.id] = response.data.guild;
			res.send(response.data);
		} else {
			res.send(invitesCache[req.params.code]);
		}
	} catch (e) {
		res.status(400);
		res.send(false);
	}
});

/* Axios */
const axapi = axios.create({
  baseURL: 'https://discordapp.com/api/',
  headers: {'Authorization': 'Bot Njk5NDM4NjU0Njk0ODgzMzkw.XpUcUw.eNxL4Qko28kQo5b_OBjz-R3VIQA'}
});