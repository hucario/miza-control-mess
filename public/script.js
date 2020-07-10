/* Config */

/* Variables */

var last_ratelimit_reset = 0;
var logs = [];
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
	guild.serverElem = document.createElement('div');
	guild.serverElem.classList.add('server');
	if (!guild.iconIsNull) {
		guild.serverIconElem = document.createElement('img');
		guild.serverIconElem.classList.add('serverIcon');
		guild.serverIconElem.src = guild.iconURL;
	} else {
		guild.serverIconElem = document.createElement('div');
		guild.serverIconElem.classList.add('serverIcon');
		guild.serverIconElem.classList.add('noIcon');
		guild.innerServerIconElem = document.createElement('span');
		guild.initials = "";
		for (let i = 0; i < guild.name.split(' ').length; i++) {
			guild.initials += guild.name.split(' ')[i][0].toUpperCase();
		}
		guild.innerServerIconElem.innerText = guild.initials;
	}
	guild.serverNameElem = document.createElement('span');
	guild.serverNameElem.innerText = guild.name;
	serverList.appendChild(guild.serverElem);
	guild.serverElem.appendChild(guild.serverIconElem);
	if (guild.iconIsNull) {
		guild.serverIconElem.appendChild(guild.innerServerIconElem);
	}
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
		['General', 'Permissions', 'Audit', 'Music', 'Nuke'].forEach(async (e) => {
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
			this.tabsElem.appendChild(this.tabElems[this.tabElems.length-1]);
			this.tabElems[this.tabElems.length-1].classList.add('tab');
			let top = this.tabElems[this.tabElems.length-1];
			if (this.tabElems.length == 1) {
				// general bot settings

			} else if (this.tabElems.length == 2) {
				console.log('test');
				// permissions
				let permsTableOuter = document.createElement('table');
				let permsTable = document.createElement('tbody');
				this.tabElems[this.tabElems.length-1].appendChild(permsTableOuter);
				permsTableOuter.appendChild(permsTable);
				this.permsTable = [];
				for (let p = 0;p < guild.users.length;p++) {
					let z = {}
					z.main = document.createElement('tr');
					permsTable.appendChild(z.main);
					z.icon = document.createElement('img');
					z.icon.src = "/userpic/"+guild.users[p];
					if (z.icon.src.includes("null")) {
						z.icon.src="data:image/png;base64,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";
					}
					z.td1 = document.createElement('td');
					z.td2 = document.createElement('td');
					z.td3 = document.createElement('td');
					z.main.appendChild(z.td1);
					z.td1.appendChild(z.icon);
					z.main.appendChild(z.td2);
					z.discriminatorSpan = document.createElement('span');
					let thatUserJson = await recursionwhoa(guild.users[p]);
					async function recursionwhoa(id,depth=0) {
						if (depth > 0) {
							console.log(`Recursing on id ${id} with depth ${depth}`)
						}
						if (depth >= 8) {
							return false;
						}
						z.td2.innerText = "loading, please wait";
						for (let i = 0; i < depth; i++) {
							z.td2.innerText += ".";
						}
						var temp1 = await fetch('/user/'+id);
						var temp2 = await temp1.json();
						if (temp2.ratelimit_reset) {
							last_ratelimit_reset = Number(temp2.ratelimit_reset)*1000;
						}
						if (temp2.ratelimit_remaining < 3) {
							if (last_ratelimit_reset > Date.now()) {
								console.log(last_ratelimit_reset - Date.now());
								z.td2.innerText = "loading, please wait..."
								await sleep(last_ratelimit_reset - Date.now());
							} else {
								z.td2.innerText = "loading, please wait"
								await sleep(500);
							}
							console.log("Done waiting for rate limit to reset")
						}
						if (temp2.username == "undefined" || temp2.username == undefined) {
							if (last_ratelimit_reset > Date.now()) {
								console.log(last_ratelimit_reset - Date.now());
								z.td2.innerText = "loading, please wait.."
								await sleep(last_ratelimit_reset - Date.now());
								console.log("Done waiting for rate limit to reset")
							}
							return await recursionwhoa(id,depth+1);
						}
						return temp2;
					}
					if (thatUserJson == false) {
						continue;
					}
					z.td2.innerText = thatUserJson.username;
					z.discriminatorSpan.innerText = `#${thatUserJson.discriminator}`;
					z.td2.appendChild(z.discriminatorSpan);
					z.main.appendChild(z.td3);
					z.numInput = document.createElement("input");
					z.numInput.setAttribute("type","number");
					z.numInput.setAttribute("size","1");
					if (guild.permissions[guild.users[p]]!== undefined && (isNaN(guild.permissions[guild.users[p]]))) {
						z.numInput.setAttribute('type', 'text');
						z.numInput.value = guild.permissions[guild.users[p]];
						z.numInput.readonly = true;
						z.numInput.setAttribute('readonly', 'readonly');
					} else {
						z.numInput.value = (guild.permissions[guild.users[p]]!=undefined?guild.permissions[guild.users[p]]:0);
						z.numInput.addEventListener('input', () => {
							socket.emit('setperms', guild.users[p], guild.id, z.numInput.value)
						})
					}
					z.td3.appendChild(z.numInput);

				}


			} else if (this.tabElems.length == 3) {
				//  audit log

			} else if (this.tabElems.length == 4) {
				// music

			} else if (this.tabElems.length == 5) {
				// nuke

			}






		});
			/*
	<table>
	<tbody><tr>
	<th></th>
		<th>User</th>
		<th>Permissions level</th>
	</tr>
	
	<tr>
		<td><img src="http://flavortown.non/userpic/132300143608201216"></td><td>IdiocyMan<span>#8326</span></td><td><input type="number" value="2" size="1"></td>
	</tr><tr>
		<td><img src="http://flavortown.non/userpic/145351267256893440"></td><td>Brayconn<span>#5328</span></td><td><input type="number" value="2" size="1"></td>
	</tr>
	</tbody></table>
	*/
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
		this.timestamp.innerHTML = `${leftPad(this.date.getHours(),2)}:${leftPad(this.date.getMinutes(),2)}:${leftPad(this.date.getSeconds(),2)} <span class="logSeparatorDiv">|</span> `;
		this.txtElement = document.createElement('div');
		this.txtElement.classList.add('text');
		this.txtElement.innerText = this.txt;
		this.element.appendChild(this.timestamp);
		this.element.appendChild(this.txtElement);
	}
}

class Guild {
	constructor(data) {
		this.ready = false;
		this.readyEvents = [];
		this.id = data.id;
		this.name = data.name;
		this.users = data.users;
		this.permissions = data.permissions;
		this.iconIsNull = ("" + data.icon).includes("null");
		this.iconURL = `https://cdn.discordapp.com/icons/${data.id}/${data.icon}.webp?size=512`;
		guilds.push(this);
	}
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

socket.on('log', (data) => {
	genLog(data);
});
socket.on('connect', () => {
	socket.emit('gimmeLast5Logs');
})
socket.on('guilds', (guilds) => {
	for (let i = 0; i < guilds.length; i++) {
		addGuildToList(new Guild(guilds[i]))
	}
});


