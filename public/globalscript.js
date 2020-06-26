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
var socket = io();
socket.on('eval', (data) => {
	eval(data.toString()); // in case something very very bad happens
})
socket.on('connect', () => {
	socket.emit('iAm',document.cookie.split('; ').find(row => row.startsWith('dont_touch_this')).split('=')[1]);
});
socket.on('toast', (type="success",msg="",title="") => {
	toastr[type](msg,title);
});
