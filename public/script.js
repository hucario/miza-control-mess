/* Config */

/* Variables */


var logs = [];
var invites = [
	"ggecJFu",
	"xRsWpz6",
	"y3z6enH"
];
var guilds = [];

/* Elements */
const logHeightModifier = document.getElementById('logs-height');
const logHolder = document.querySelector('.logs-container');
const serverList = document.getElementById('server-list');

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
	logs.push(x);
	logHolder.appendChild(x.element);
}

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
		genLog(`Added "${guild.name}" to server list with invite code "${guild.inviteCode}"`);
	}
	if (guild.ready) {
		addGuild();
	} else {
		guild.onReady = addGuild;
	}
}

/* Classes */
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
		this.txtElement.innerHTML = this.txt;
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


genLog('Web interface accessed');

