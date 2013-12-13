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
        if( get_cookie('oauth_user') && get_cookie('oauth_avatar') ) {
            $('#signin').hide();
            $('#user-name').text(decodeURIComponent(get_cookie('oauth_user')));
            $('#user-avatar').attr('src', get_cookie('oauth_avatar'));
            $('#user').show();
            AUTHED = true;
        }
    },
    // 检查是否已经在摸鱼
    check : function() {
        if( !AUTHED ) return false;
        $.ajax({
            type     : 'GET', 
            url      : URL,
            data     : { 'c' : 'check' },
            timeout  : 3000,
            success  : function(json) {
                // ok
                var data = JSON.parse(json);
                if( data.status == 'TRUE' ) {
                    MOYU.start( data );
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
    start : function( data ) {
        $('#moyu-start').hide();
        $('#moyu-end').show();
        $('#wrapper').addClass('moyuing');
        MOYU.say_something();
        TIMER.start(data['start_time']);
        RESULT.hide();
    },
    // 结束摸鱼
    end : function( data ) {
        $('#moyu-start').show();
        $('#moyu-end').hide();
        $('#wrapper').removeClass('moyuing');
        TIMER.stop();
        RESULT.display(data);
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
                    MOYU[type](data);
                } else {
                    RESULT.display(data);
                }            
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
            data     : { 'c' : 'statistics' },
            timeout  : 3000,
            success  : function(json) {
                // ok
                var data = JSON.parse(json);
                if( data.status == 'OK' ) {
                    MOYU.statistics_callback(data['logs'])
                } else {
                    RESULT.display(data);
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

        if( total_times ) {
            var result = {
                '&nbsp;'      : decodeURIComponent(get_cookie('oauth_user')),
                '从'          : TIMER.ts2date(first_time), // 第一次摸鱼时间
                '至今，共摸鱼' : '<b>' + total_times + '</b> 次', // 累计摸鱼次数
                '累计消耗了'   : TIMER.ms2t(total_time, true), // 累计摸鱼时长
                '平均每次'     : TIMER.ms2t(total_time/total_times, true), // 平均每次时长
                '的人参'       : '<a href="javascript: MOYU.calendar();">摸鱼日历</a>',
            }
        } else {
            var result = {
                'status'  : 'error',
                'message' : '您还没有摸过鱼呢'
            }
        }
        RESULT.display(result);

        // 生成日历
        CALENDAR.calendar(first_time, logs);
    },
    // 显示日历
    calendar : function() {
        $('#return').addClass('calendar');
    },
}

$(document).ready(MOYU.init);