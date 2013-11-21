function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    expiredays = expiredays ? expiredays : 7;
    console.log(expiredays)
    exdate.setDate( exdate.getDate() + expiredays )
    document.cookie = c_name + "=" + escape(value) 
        + ( (expiredays == null) ? "" : ";expires=" + exdate.toGMTString() );
}
function do_login() {
	var password = document.querySelector('#password').value;
	var time = new Date().getTime();
	var auth = CryptoJS.SHA256( password + '^^^' + time ).toString();
	setCookie('time', time);
	setCookie('auth', auth);
}