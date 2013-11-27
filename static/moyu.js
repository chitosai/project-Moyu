var DEBUG = true;
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
        // 初始化返回值弹层
        RESULT.init();
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
                RESULT.hide();
            },
            error   : function(xhr, type) {
                RESULT.hide();
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
                RESULT.hide();
            },
            error   : function(xhr, type) {
                console.log(xhr, type);
                RESULT.hide();
            }
        });
    },

    // 随机填入一条主语..
    say_something : function() {
        var something = SOMETHINGS[Math.floor(Math.random()*SOMETHINGS.length)];
        $('#something').text(something);
    },

    // 统计
    statistics : function() {
        $.ajax({
            type     : 'GET', 
            url      : URL,
            data     : { 'c' : 'statistics'},
            timeout  : 3000,
            success  : function(json) {
                // ok
                var data = JSON.parse(json);
                if( data.status == 'OK' ) {
                    MOYU.statistics_callback(data['logs'])
                } else {
                    debug(data);
                }
            },
            error   : function(xhr, type) {
                console.log(xhr, type);
                RESULT.hide();
            }
        });
    },

    // 生成统计数据
    statistics_callback : function( logs ) {
        var first_time = 9999999999999, // 第一次摸鱼时间
            total_time = 0, // 累计摸鱼时长
            total_times = 0; // 累计摸鱼次数

        for( i in logs ) {
            var log = logs[i]['log'],
                st = parseInt(log['start']),
                et = parseInt(log['end']);

            if( st < first_time )
                first_time = st;

            total_time += (et - st);
            total_times++;
        }

        var result = {
            '&nbsp;'      : decodeURIComponent(get_cookie('weibo_user')),
            '从'          : TIMER.ts2date(first_time), // 第一次摸鱼时间
            '至今，共摸鱼' : '<b>' + total_times + '</b> 次', // 累计摸鱼次数
            '累计消耗了'   : TIMER.ms2t(total_time), // 累计摸鱼时长
            '的人参'       : '可喜可贺、可喜可贺。',
        }
        RESULT.fill_dl(result);
        RESULT.display();
    },

}


/**
 * 显示返回结果
 * 
 */
var RESULT = {
    dom : null,
    // 初始化
    init : function() {
        RESULT.dom = $('#return');
        RESULT.dom.on('click', '#overlay', RESULT.hide);
        RESULT.title_height = parseInt($('#result-title').css('height')) + 4;

        // 初始化loading
        $(document).on('ajaxBeforeSend', RESULT.loading);
    },
    // 显示
    display : function() {
        RESULT.dom.addClass('active result');
    },
    // 显示loading动画
    loading : function() {
        RESULT.dom.addClass('active loading');
    },
    // 关闭
    hide : function() {
        RESULT.dom.removeClass('active result loading');
    },
    // 向result中填数据
    fill_dl : function( array ) {
        var container = $('#result'),
            dl = $('<dl>');
        for( key in array ) {
            $('<dt>').html(key).appendTo(dl);
            $('<dd>').html(array[key]).appendTo(dl);
        }
        container.children('dl').remove();
        container.append(dl);
        container.height( parseInt(dl.css('height')) + RESULT.title_height );
    }
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
        TIMER.ms.text( fix_number( Math.floor(elapsed%1000), 3 ) );
    },

    // 毫秒转时间
    ms2t : function(ms) {
        ms = parseInt(ms);
        return '<b>' + Math.floor(ms/3600000) + '</b> 小时 <b>' + Math.floor(ms%3600000/60000) + '</b> 分 <b>' + 
                Math.floor(ms%60000/1000) + '</b> 秒 <b>' + Math.floor(ms%1000) + '</b> 毫秒';
    },

    // 时间戳转日期
    ts2date : function(timestamp) {
        var date = new Date(parseInt(timestamp));
        return date.getFullYear() + ' 年 ' + date.getMonth() + ' 月 ' + date.getDate() + ' 日 ';
    }
}


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