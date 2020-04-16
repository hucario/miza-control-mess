/* Requires */
const express = require('express');			// webserver stuff
const axios = require('axios');				// performs requests
const bodyParser = require('body-parser');	// parses requests
const socketio = require('socket.io');		// websocket stuff
const fs = require('fs');					// filesystem
const chalk = require('chalk');				// debug

/* Variables */
var port;
var serverCache = {};
var userCache = {};
var iconCache = {};
var invitesCache = {};
var musicQueues = {};
var last5Logs = [];

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
io.on('connect', (socket) => {
	let thisSocket = {
		"failedAuth": 0,
		"isMiza": false
	};
	socket.on('gimmeLast5Logs', () => {
		for (let i = 0; i < last5Logs.length;i++) {
			socket.emit('log', last5Logs[i]);
			console.log('Broadcasting '+last5Logs[i]);
		}
	})
	socket.on('authMeBB', (data) => {
		if (data == auth.web_token && thisSocket.failedAuth<3) {
			socket.emit('authAccepted');
			io.emit('log', 'Miza connected');
			thisSocket.isMiza = true;
		} else {
			socket.emit('authDenied');
			console.log('Miza auth failed');
			failedAuth++;
		}
	});
	socket.on('log', (d) => {
		if (thisSocket.isMiza) {
			io.emit('log', d);
			if (last5Logs.length == 5) {
				last5Logs.shift();
				list5Logs.push(d);
			}
		}
	});
});

/* Routing */
app.get('/queue/:id', async (req, res) => {
	res.send('Not yet');
});

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

app.get('/userpic/:id', async (req, res) => {
	try {
		if (!userCache[req.params.id] || !userCache[req.params.id].avatarURL) {
			var resp1 = await axapi.get('/users/'+req.params.id);
			userCache[req.params.id] = resp1.data;
			userCache[req.params.id].avatarURL = `https://cdn.discordapp.com/avatars/${req.params.id}/${resp1.data.avatar}.webp?size=512`
			res.redirect(userCache[req.params.id].avatarURL)
			userCache[req.params.id].avatarURL = `https://cdn.discordapp.com/avatars/${req.params.id}/${resp1.data.avatar}.webp?size=512`
		} else {
			res.redirect(userCache[req.params.id].avatarURL);
		}
	} catch (e) {
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

var auth;
/* Auth */
if (!process.env.BOT_TOKEN && !process.env.WEB_TOKEN) {
	try {
		auth = JSON.parse(fs.readFileSync(__dirname + "/auth.json").toString());
		if (!auth.bot_token) {
			throw "auth.json needs bot_token property to do pretty much anything";
		}
		if (!auth.web_token) {
			throw "auth.json needs web_token property to interface with Miza properly";
		}
	} catch(e) {
		console.error(chalk.bold.redBright('Error reading auth.json: '),e);
		process.exit();
	}
}

/* Axios */
const axapi = axios.create({
  baseURL: 'https://discordapp.com/api/',
  headers: {'Authorization': 'Bot '+auth.bot_token}
});

