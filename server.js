/* Requires */
const express = require('express');				// webserver stuff
const axios = require('axios');					// performs requests
const bodyParser = require('body-parser');		// parses requests
const socketio = require('socket.io');			// websocket stuff
const fs = require('fs');						// filesystem
const chalk = require('chalk');					// debug c o l o r s
const ejs = require('ejs');						// Embedded Javasscript in HTML
const querystring = require('querystring');		// Query string-ify JSON
const cookieParser = require('cookie-parser');	// Parses cookies

/* Variables */
var port;
var serverCache = {};
var userCache = {};
var iconCache = {};
var invitesCache = {};
var musicQueues = {};
var last5Logs = [];
var botServers = {};


var sampleQueueItems = [
	{
		'name': 'Gamer music part 1',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 2',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 3',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 4',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 5',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 6',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 7',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 8',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 9',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 10',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 11',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 12',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 13',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 14',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 15',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 16',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 17',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 18',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 19',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 20',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 21',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 22',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 23',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 24',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 25',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 26',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 27',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 28',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 29',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	},
	{
		'name': 'Gamer music part 30',
		'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	}
]

/* Express setup */
var app = express();
app.use(express.static('public'))
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', (__dirname + '/views'));
app.use(cookieParser());

/* Start up web stuff */
if ((process.getuid && (process.getuid() === 0))) {
	port = 80;
} else {
	port = process.env.PORT || 8085;
}


var server = app.listen(port, () => {
	console.log("Started server at  "+server.address().address+':'+server.address().port);
});

/* Terminal input */
var stdin = process.openStdin();
stdin.addListener('data',function(d) {
	if (!d.toString().includes('rs')) {
		try {
			console.log(eval(d.toString()));
		} catch(data) {
			console.log((data));
		}
	}


});

/* SocketIO */
const io = socketio.listen(server);
io.on('connect', (socket) => {
	let thisSocket = {
		"failedAuth": 0,
		"isMiza": false
	};
	console.log("Socket has connected");
	socket.on('gimmeLast5Logs', () => {
		for (let i = 0; i < last5Logs.length;i++) {
			socket.emit('log', last5Logs[i]);
		}
	})
	socket.on('iAm', (d) => {
		if (users[d]) {
			if (!users[d].shownWelcome) {
				users[d].shownWelcome = true;
				setTimeout(() => {
					socket.emit('toast','success', `Logged in as ${users[d].username}<span style="opacity: 0.3">#${users[d].discriminator}</span>`);
				}, 1500); // I don't know why, it's just more satisfying that way
			}
		}
	});
	socket.on('authMeBB', (data) => {
		if (data == auth.web_token && thisSocket.failedAuth<3) {
			socket.emit('authAccepted');
			io.emit('log', 'Miza connected');
			console.log("Hey, it's Miza!");
			thisSocket.isMiza = true;
		} else if (thisSocket.failedAuth<3) {
			console.log('Miza auth failed');
			failedAuth++;
			socket.emit('authDenied', 'Wrong token. Tries remaining: '+(3-thisSocket.failedAuth));
		} else {
			socket.emit('authDenied', 'Ran out of attempts.');
		}
	});
	socket.on('myServers', (d) => {
		if (thisSocket.isMiza) {
			console.log(d);
		}
	});
	
	socket.on('log', (d) => {
		if (thisSocket.isMiza) {
			d = d.toString()
			for (let i = 0; i < auth.nothanks.length; i++) {
				while (d.includes(auth.nothanks[i][0])) {
					d = d.replace(auth.nothanks[i][0], auth.nothanks[i][1]);
				}
			}
			io.emit('log', d);
			if (last5Logs.length == 5) {
				last5Logs.shift();
			}
			last5Logs.push(d);
		}
	});
	socket.on('newmusic', (serverid, name, requester, url) => {
		if (thisSocket.isMiza) {
			if (!musicQueues[serverid]) musicQueues[serverid] = [];
			musicQueues[serverid].unshift({
				'name': name,
				'requester': requester,
				'url': url
			});
			console.log(musicQueues[serverid]);
		}
	});
	socket.on('mus_newItem', (serverid, d) => {
		if (thisSocket.isMiza) {
			console.log(d);
		}
	});
});

/* Functions */
function gen_uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/* Routing */
app.get('/queue/:id', async (req, res) => {
	if (!serverCache[req.params.id]) {
		res.sendFile(__dirname + '/public/queue/workingindex.html');	
	} else {
		let currGuild = serverCache[req.params.id];
		if (!currGuild.queue) {
			currGuild.queue = sampleQueueItems;
		}
		res.render('queue', {
			"serverName": currGuild.name,
			"serverIcon": `https://cdn.discordapp.com/icons/${currGuild.id}/${currGuild.icon}.webp?size=256`,
			"musicItems": currGuild.queue.slice(0,20),
			"more": (currGuild.queue.length>20)
		});
	}
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
			if (response.status == 200) {
				invitesCache[req.params.code] = response.data;
				res.set({
					"x-ratelimit-bucket": response.headers["x-ratelimit-bucket"],
					"x-ratelimit-remaining": response.headers["x-ratelimit-remaining"],
					"x-ratelimit-reset": response.headers["x-ratelimit-reset"],
					"x-ratelimit-reset-after": response.headers["x-reset-after"]
				});
				serverCache[response.data.guild.id] = response.data.guild;
				res.send(response.data);
			} else {
				res.status(response.status).send(response.data);
			}
		} else {
			res.send(invitesCache[req.params.code]);
		}
	} catch (e) {
		res.status(400);
		res.send(false);
	}
});

/* Auth */

var auth = {};
var required_auth = ['bot_token', 'web_token', 'app_client_id', 'app_client_secret', 'working_url'];
function read_auth() {
	try {
		auth = JSON.parse(fs.readFileSync(__dirname + "/auth.json").toString());
	} catch(e) {
		console.error(chalk.bold.redBright('Error reading auth.json: '),e);
		process.exit();
	}
}
for (let i = 0; i < required_auth.length; i++) {
	if (!process.env[required_auth[i]]) {
		if (!auth) {
			read_auth();
		}
		if (!auth[required_auth[i]]) {
			throw new Error(`auth.json is missing ${required_auth[i]} property`);
		}
	} else {
		auth[required_auth[i]] = process.env[required_auth[i]];
	}
}
if (!process.env.nothanks && !auth.nothanks) {
		auth.nothanks = [];
}


/* Axios */
const axapi = axios.create({
  baseURL: 'https://discordapp.com/api/',
  headers: {'Authorization': 'Bot '+auth.bot_token}
});

var users = {};
/* OAuth */
app.get('/login', (req, res) => {
	res.redirect(`https://discord.com/oauth2/authorize?response_type=code&client_id=${auth.app_client_id}&scope=identify&redirect_uri=${auth.working_url}/authorize&prompt=none`);
});
app.get('/authorize', async (req, res) => {
	if (!req.query.code) {
		res.redirect('/login');
		return;
	}
	let details = await axapi.post('/oauth2/token', querystring.stringify({
		client_id: auth.app_client_id,
		client_secret: auth.app_client_secret,
		grant_type: 'authorization_code',
		code: req.query.code,
		redirect_uri: auth.working_url + '/authorize'
	}));
	let userdetails = await axios.get('https://discord.com/api/users/@me', {
		headers: {
			Authorization: "Bearer "+details.data.access_token
		}
	}).catch((e) => {
		console.log(e);
	});
	userdetails = userdetails.data;
	console.log(`${userdetails.username} logged in`);
	var uuid = gen_uuidv4();
	users[uuid] = userdetails;
	users[uuid].shownWelcome = false;
	res.cookie('dont_touch_this', uuid, {SameSite: 'Strict'});
	res.redirect('/');
	return;
});




