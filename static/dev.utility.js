/**
 * 补齐数字
 * 
 */
function fix_number( number, length ) {
    if( arguments.length != 2 ) return false;
    number = number.toString();

    while( number.length < length ) 
        number = '0' + number;

    return number;
}


/**
 * DEBUG
 * 
 */
function debug( message ) {
    if( message && DEBUG ) {
        if( arguments.length > 1 )
            console.log( arguments );
        else
            console.log( message );
    }
}


/**
 * GET COOKIE
 * 
 */
function get_cookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}