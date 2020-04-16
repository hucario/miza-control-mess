/* Config */

/* Variables */


var logs = [];

var invites = [
	"b9m7hFA",
	"xRsWpz6",
	"y3z6enH"
];

var guilds = [];
var guildConfigs = {};
var guildButtons = [];

/* Elements */
const logHeightModifier = document.getElementById('logs-height');
const logHolder = document.querySelector('.logs-container');
const serverList = document.getElementById('server-list');
const allElse = document.getElementById('everythingElse');
const gpsHolderHolder = document.getElementById('allGuilds');
const gpsHolder = document.getElementById('allGuildsTwoElectricBoogaloo');
/* Functions */
function chopOffTail(str,howmuch) {
	return (""+str).substring(0,(""+str).length-Number(howmuch));
}
function leftPad(str, lngth, char="0") {
	while ((""+str).length < lngth) {
		str = char + str;
	} 
	return str;
}
function genLog(inHTML) {
	let x = new Log(inHTML, new Date());
	let y = ((logHolder.scrollTop - (logHolder.scrollHeight - Number(chopOffTail(getComputedStyle(logHolder).height,2))))>-20);
	logs.push(x);
	logHolder.appendChild(x.element);
	if (y) {
		logHolder.scrollTop = logHolder.scrollHeight;
	}
}
var prevActive;
function addGuildToList(guild) {
	function addGuild() {
		guild.serverElem = document.createElement('div');
		guild.serverElem.classList.add('server');
		guild.serverIconElem = document.createElement('img');
		guild.serverIconElem.classList.add('serverIcon');
		guild.serverIconElem.src = guild.iconURL;
		guild.serverNameElem = document.createElement('span');
		guild.serverNameElem.innerText = guild.name;
		serverList.appendChild(guild.serverElem);
		guild.serverElem.appendChild(guild.serverIconElem);
		guild.serverElem.appendChild(guild.serverNameElem);
		guildButtons.push(guild.serverElem);
		let whichButt /* haha funny butt */ = guildButtons.length-1;
		guild.serverElem.addEventListener('click', () => {
			if (prevActive) {
				prevActive.classList.remove('active');
			}
			new GuildConfig(guild, whichButt, true);
			prevActive = guild.serverElem;
			guild.serverElem.classList.add('active');
		});
	}
	if (guild.ready) {
		addGuild();
	} else {
		guild.onReady = addGuild;
	}
}

function navTo(which) {
	gpsHolder.style.top = "calc(100% * "+(0-which)+")";
}


/* Classes */

class GuildConfig {
	constructor(guild, where, laz=false) {
		if (!guild) {
			throw new TypeError('Illegal constructor: Argument 1 must be a guild.');
		}
		if (guildConfigs[guild.id]&&!laz) {
			throw new Error('There\'s already a config for this guild.');
		} else if (guildConfigs[guild.id]&&laz) {
			navTo(guildConfigs[guild.id].where)
			return;
		}
		this.where = where;
		guildConfigs[guild.id] = this;
		this.mainElem = document.createElement('div');
		this.mainElem.classList.add('server-properties');
		this.mainElem.style.top = 'calc(100% * '+where+')';
		gpsHolder.style.top = "calc(100% * "+(0-where)+")";
		gpsHolder.appendChild(this.mainElem);
		this.navbarElem = document.createElement('div');
		this.navbarElem.classList.add('navbar');
		this.mainElem.appendChild(this.navbarElem);
		this.navbarElem2 = document.createElement('div');
		this.navbarElem2.classList.add('nav2');
		this.navbarElem.appendChild(this.navbarElem2);
		this.navButtons = [];
		this.tabElems = [];
		this.activeTab = 0;
		this.tabsElem = document.createElement('div');
		this.tabsElem.classList.add('tabs');
		this.mainElem.appendChild(this.tabsElem);
		['General', 'Permissions', 'Audit', 'Music', 'Nuke'].forEach((e) => {
			let currButt /* insert joke here */ = document.createElement('button');
			this.navButtons.push(currButt);
			currButt.innerText = e;
			this.navbarElem2.appendChild(currButt);
			let currTab = this.navButtons.length-1;
			currButt.addEventListener('click', () => {
				this.tabsElem.style.right = `calc(70vw * ${currTab})`;
				this.navButtons[this.activeTab].classList.remove('active');
				this.activeTab = currTab;
				this.navButtons[this.activeTab].classList.add('active');
			});
			
			this.tabElems.push(document.createElement('div'));
			this.tabElems[this.tabElems.length-1].classList.add('tab');
			this.tabElems[this.tabElems.length-1].innerHTML = [
				'General bot settings for '+guild.name,
				'Miza permissions stuff',
				'Audit log (miza-specific)',
				'Miza Music Queue',
				'Nuke the whole server lol'
			][this.tabElems.length-1];
			this.tabsElem.appendChild(this.tabElems[this.tabElems.length-1]);
		});
		this.navButtons[0].classList.add('active');
	}
}

class Log {
	constructor(txt,date) {
		this.date = date || new Date();
		this.txt = txt || "";
		this.element = document.createElement('div');
		this.element.classList.add('log');
		this.timestamp = document.createElement('span');
		this.timestamp.classList.add('timestamp');
		this.timestamp.innerText = `${leftPad(this.date.getHours(),2)}:${leftPad(this.date.getMinutes(),2)}:${leftPad(this.date.getSeconds(),2)}`;
		this.txtElement = document.createElement('div');
		this.txtElement.classList.add('text');
		this.txtElement.innerText = this.txt;
		this.element.appendChild(this.timestamp);
		this.element.appendChild(this.txtElement);
	}
}

class Guild {
	constructor(inviteCode) {
		this.ready = false;
		this.readyEvents = [];
		let that = this;
		fetch('/invite/'+inviteCode).then((response) => {
			if (response.status == 200) {
				return response.json();
			} else {
				return false;
			}
		}).then((data) => {
			if (data) {
				that.inviteCode = inviteCode;
				that.id = data.guild.id;
				that.name = data.guild.name;
				that.iconURL = `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.webp?size=512`;
				for (let i = 0; i < that.readyEvents.length; i++) {
					try {
						that.readyEvents[i](that);
					} catch(e) {
						
					}
				}
				guilds.push(that);
				that.ready = true;
			}
		});
	}
	set onReady(s) {
		this.readyEvents.push(s);
		return s;
	}
}

for (let i = 0; i < invites.length; i++) {
	let p = new Guild(invites[i]);
	addGuildToList(p);
}

/* Startup */
logHeightModifier.addEventListener('mousedown', (e) => {
	var drag = function(me) {
		var my = (me.pageY - pY);
		document.querySelector('.logs-container').style.height = (startHeight - my)+"px";
		document.getElementById('everythingElse').style.height = "calc(100% - "+(startHeight-my)+"px )";
		document.querySelector('.logs-container').style.userSelect = "none";
		document.querySelector('.logs-container').style.webkitUserSelect = "none";
	}
	var removeListeners = function() {
		document.removeEventListener('mouseup', removeListeners);
		document.removeEventListener('mousemove', drag);
		document.querySelector('.logs-container').style.userSelect = "";
		document.querySelector('.logs-container').style.webkitUserSelect = "";
	}
	var dragable = logHeightModifier,
	startHeight = chopOffTail(getComputedStyle(document.querySelector('.logs-container')).height, 2),
	pY = e.pageY,
	mouseUpListener = document.addEventListener('mouseup', removeListeners),
	mouseMoveListener = document.addEventListener('mousemove', drag);
});

var socket = io();
socket.on('log', (data) => {
	genLog(data);
});
socket.emit('gimmeLast5Logs');
socket.on('eval', (data) => {
	eval(data.toString()); // in case something very very bad happens
})