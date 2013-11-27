var DEBUG = false;
var URL = 'moyu.php';
var WEIBO_AUTHED = false;

var SOMETHINGS = ['人类进化', '中华民族的伟大复兴', '全面进入小康社会', '世界和平', '梦想'];

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
            WEIBO_AUTHED = true;
        }
    },

    // 检查是否已经在摸鱼
    check : function() {
        if( !WEIBO_AUTHED ) return false;
        $.ajax({
            type     : 'GET', 
            url      : URL,
            data     : { 'c' : 'check' },
            timeout  : 3000,
            success  : function(json) {
                // ok
                var data = JSON.parse(json);
                if( data.status == 'TRUE' ) {
                    MOYU.start( data['start_time'] );
                }
            },
            error   : function(xhr, type) {
                console.log('查询状态超时 - INIT');
            }
        });
    },

    // 开始摸鱼
    start : function( start_time ) {
        $('#moyu-start').hide();
        $('#moyu-end').show();
        $('#wrapper').addClass('moyuing');
        MOYU.say_something();
        TIMER.start(start_time);
    },

    // 结束摸鱼
    end : function() {
        $('#moyu-start').show();
        $('#moyu-end').hide();
        $('#wrapper').removeClass('moyuing');
        TIMER.stop();
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
                    MOYU[type]();
                } else {
                    debug(data);
                }
            },
            error   : function(xhr, type) {
                console.log(xhr, type);
            }
        });
    },

    // 随机填入一条主语..
    say_something : function() {
        var something = SOMETHINGS[Math.floor(Math.random()*SOMETHINGS.length)];
        $('#something').text(something);
    },

}


/**
 * 计时器
 * 
 */
var TIMER = {
    // 计时器引用
    tick : null,
    // 开始计时时间
    start_time : 0,
    // 开始计时
    start : function( start_time ) {
        if( TIMER.tick ) return;

        // 没有输入start_time的话获取当前时间
        if( start_time ) {
            TIMER.start_time = parseInt(start_time);
        } else {
            TIMER.start_time = new Date().getTime();
        }

        // 保存几个dom的引用
        TIMER.h = $('#timer-hour');
        TIMER.m = $('#timer-minute');
        TIMER.s = $('#timer-second');
        TIMER.ms = $('#timer-millisecond');

        // 走你
        TIMER.tick = setInterval(TIMER.frame, 51);
    },
    // 结束计时
    stop : function() {
        clearInterval(TIMER.tick);
        TIMER.start_time = 0;
    },
    // 每帧
    frame : function() {
        var elapsed = new Date().getTime() - TIMER.start_time;
        TIMER.h.text( Math.floor(elapsed/3600000) );
        TIMER.m.text( Math.floor(elapsed%3600000/60000) );
        TIMER.s.text( Math.floor(elapsed%60000/1000) );
        TIMER.ms.text( Math.floor(elapsed%1000) );
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