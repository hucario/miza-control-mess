/* Config */

/* Variables */


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
					z.td1 = document.createElement('td');
					z.td2 = document.createElement('td');
					z.td3 = document.createElement('td');
					z.main.appendChild(z.td1);
					z.td1.appendChild(z.icon);
					z.main.appendChild(z.td2);
					z.discriminatorSpan = document.createElement('span');
					let thatUserData = await fetch('/user/'+guild.users[p]);
					let thatUserJson = await thatUserData.json();
					z.td2.innerText = thatUserJson.username;
					z.discriminatorSpan.innerText = `#${thatUserJson.discriminator}`;
					z.td2.appendChild(z.discriminatorSpan);
					z.main.appendChild(z.td3);
					z.numInput = document.createElement("input");
					z.numInput.setAttribute("type","number");
					z.numInput.setAttribute("size","1");
					if (guild.permissions[guild.users[p]]!== undefined && (guild.permissions[guild.users[p]]=="NaN" || guild.permissions[guild.users[p]]=="inf")) {
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


