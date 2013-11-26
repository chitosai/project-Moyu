var DEBUG = false;
var URL = 'moyu.php';

/**
 * 摸呀摸
 * 
 */
var MOYU = {
    // 初始化
    init : function() {
        // 显示用户信息
        MOYU.show_user();
        // 检查是否已在摸鱼
        MOYU.check();
    },

    // 显示用户信息
    show_user : function() {
        if( get_cookie('weibo_user') && get_cookie('weibo_avatar') ) {
            $('#signin').hide();
            $('#user-name').text(decodeURIComponent(get_cookie('weibo_user')));
            $('#user-avatar').attr('src', get_cookie('weibo_avatar'));
            $('#user').show();
        }
    },

    // 检查是否已经在摸鱼
    check : function() {
        $.ajax({
            type     : 'GET', 
            url      : URL,
            data     : { 'c' : 'check' },
            timeout  : 3000,
            success  : function(json) {
                // ok
                var data = JSON.parse(json);
                if( data.status == 'TRUE' ) {
                    $('#moyu-end').show();
                    $('#moyu-start').hide();
                }
            },
            error   : function(xhr, type) {
                console.log('查询状态超时 - INIT');
            }
        });
    },

    // 发出记录请求
    log : function( type ) {
        // 判断类型
        if( type != 'start' && type != 'end' )
            return false;
        // GO
        $.ajax({
            type     : 'GET', 
            url      : URL,
            data     : { 'c'         : type,
                         'timestamp' : new Date().getTime() 
                       },
            timeout  : 3000,
            success  : function(json) {
                // ok
                var data = JSON.parse(json);
                if( data.status == 'OK' ) {
                    $('#wrapper a').show();
                    $('#moyu-' + type).hide();
                } else {
                    debug(data);
                }
            },
            error   : function(xhr, type) {
                console.log(xhr, type);
            }
        });
    }
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
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}

$(document).ready(MOYU.init);