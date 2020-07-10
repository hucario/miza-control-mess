toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "100",
  "hideDuration": "100",
  "timeOut": "5000",
  "extendedTimeOut": "0",
  "showEasing": "swing",
  "hideEasing": "swing",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
async function sleep(ms) {
  return new Promise(resolve => {setTimeout(resolve, ms);});
}
var socket = io();
var myPermsLevel = 0;
socket.on('eval', (data) => {
	eval(data.toString()); // in case something very very bad happens
})
socket.on('connect', () => {
	if (!document.cookie.includes('dont_touch_this')) {
		toastr.warning("You will be unable to view or change much.", "You are logged out.")
		if (genLog) {
			genLog("You are logged out. You will be unable to change or view anything until you log in.")
		}
		return;
	}
	socket.emit('iAm',document.cookie.split('; ').find(row => row.startsWith('dont_touch_this')).split('=')[1]);
});
socket.on('yourperms', (a) => {
	myPermsLevel = a;
});
socket.on('toast', (type="success",msg="",title="") => {
  toastr[type](msg,title);
});
