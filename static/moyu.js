var DEBUG = true;
var URL = 'moyu.php';
var AUTHED = false;

var SOMETHINGS = ['人类进化', '中华民族的伟大复兴', '全面进入小康社会', '世界和平', '梦想'];
var WORD_REPLACE_MAP = {
    'status'         : '返回值',
    'start_time'     : '摸鱼开始时间',
    'end_time'       : '摸鱼结束时间',
    'last'           : '消耗人参',
    'message'        : '说明',
}

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
    display : function( array ) {
        RESULT.fill_dl(array);
        RESULT.dom.removeClass('loading').addClass('active result');
    },
    // 显示loading动画
    loading : function() {
        RESULT.dom.addClass('active loading');
    },
    // 关闭
    hide : function() {
        if( RESULT.dom.hasClass('calendar') )
            RESULT.dom.removeClass('calendar');
        else
            RESULT.dom.removeClass();
    },
    // 向result中填数据
    fill_dl : function( array ) {
        var container = $('#result-table').empty(),
            tr = null;
        for( key in array ) {
            tr = $('<tr>');
            $('<td>').html(RESULT.process_data(key)).appendTo(tr);
            $('<td>').html(RESULT.process_data(array[key])).appendTo(tr);
            tr.appendTo(container);
        }
        $('#result').height( parseInt(container.css('height')) + RESULT.title_height );
    },
    // 处理数据
    process_data : function( word ) {
        for( keyword in WORD_REPLACE_MAP ) {
            if( keyword == word ) {
                return WORD_REPLACE_MAP[keyword];
            } else if( /^\d{13}$/.test(word) ) {
                return TIMER.ts2time(word);
            } else if( /^\d+$/.test(word) ) {
                return TIMER.ms2t(word, true);
            }
        }
        return word;
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
        TIMER.tick = clearInterval(TIMER.tick);
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
    ms2t : function(ms, highlight_number) {
        ms = parseInt(ms);
        var text = '',
            hour = Math.floor(ms/3600000),
            minute = Math.floor(ms%3600000/60000),
            second = Math.floor(ms%60000/1000),
            ms = Math.floor(ms%1000);

        if( hour ) text += (highlight_number ? '<b>' : '') + hour + (highlight_number ? '</b>' : '') + ' 小时 ';
        if( minute ) text += (highlight_number ? '<b>' : '')  + minute + (highlight_number ? '</b>' : '') + ' 分 ';
        if( second ) text += (highlight_number ? '<b>' : '')  + second + (highlight_number ? '</b>' : '') + ' 秒 ';
        if( ms ) text += (highlight_number ? '<b>' : '')  + ms + (highlight_number ? '</b>' : '') + ' 毫秒';

        return text;
    },

    // 时间戳转日期
    ts2date : function(timestamp) {
        var date = new Date(parseInt(timestamp));
        return date.getFullYear() + ' 年 ' + (date.getMonth()+1) + ' 月 ' + date.getDate() + ' 日 ';
    },

    // 时间戳转时间
    ts2time : function(timestamp) {
        var time = new Date(parseInt(timestamp));
        return time.getFullYear() + '/' + (time.getMonth()+1) + '/' + time.getDate() + '&nbsp;-&nbsp;' + 
                fix_number(time.getHours(),2) + ':' + fix_number(time.getMinutes(),2) + ':' + fix_number(time.getSeconds(),2);
    },

    // 时间戳转 时:分:秒
    ts2hms : function(timestamp) {
        var time = new Date(parseInt(timestamp));
        return fix_number(time.getHours(),2) + ':' + fix_number(time.getMinutes(),2) + ':' + fix_number(time.getSeconds(),2);
    },
}


/**
 * 日历
 * 
 */
var CALENDAR = {
    /**
     * 生成从某个日期至今的每个月的日历
     *
     * @param int first_time 第一次摸鱼时间
     * @param object logs 全部log
     */
    calendar : function(first_time, logs) {
        var first_date = new Date(first_time),
            // first_date = new Date(2012,1,2),
            now = new Date(),
            first_year = first_date.getFullYear(),
            this_year = now.getFullYear(),
            i, j, html = '';

        // 是否超过一年
        if( this_year - first_year ) {
            // 生成第一年份
            for( i = first_date.getMonth() + 1; i <= 12; i++ ) {
                html += CALENDAR.generate(first_year, i);
            }

            // 生成中间所有年份
            for( i = first_year + 1; i < this_year; i++ ) {
                for( j = 1; j <= 12; j++ ) {
                    html += CALENDAR.generate(i, j);
                }
            }

            // 最后一年
            if( this_year - first_year ) {
                for( i = 1; i <= now.getMonth() + 1; i++ ) {
                    html += CALENDAR.generate(this_year, i);
                }
            }
        } else {
            for( i = first_date.getMonth() + 1; i <= now.getMonth() + 1; i++ ) {
                html += CALENDAR.generate(this_year, i);
            }
        }

        // 填数据
        document.querySelector('#calendar').innerHTML = html;

        // 高亮有摸鱼记录的日期
        for( i in logs ) {
            CALENDAR.highlight(logs[i]['log']);
        }
    },
    /**
     * 生成一个月的日历
     * 
     * @param int year 年份，4位完整数字
     * @param int month 月份，不用补齐两位
     */
    generate : function(year, month) {
        // 本月第一天是星期几（距星期日离开的天数）
        var startDay = new Date(year, month - 1, 1).getDay();

        // 本月有多少天(即最后一天的getDate()，但是最后一天不知道，我们可以用“上个月的0来表示本月的最后一天”)
        var nDays = new Date(year, month, 0).getDate();

        // 开始画日历
        var numRow = 0;      // 记录行的个数，到达7的时候创建tr
        var i, j, today = 1; // 日期
        var html = '';
        var weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        html += '<div class="date">';
        // 标注日期
        html += '<h3>' + year + '年' + month + '月</h3>';

        // date table
        html += '<table class=\'date-table\'>';
        // 第一行
        html += '<thead><tr>';
        // 生成星期
        for( i in weekdays ) {
            html += '<th>' + weekdays[i] + '</th>';
        }
        html += '</tr></thead><tbody><tr>'
        // 生成空白日期
        for (i = 0; i < startDay; i++) {
            html += '<td></td>';
            numRow++;
        }
        for (j = 1; j <= nDays; j++) {
            html += '<td id="date-' + year + '-' + month + '-' + today + '"><div class="day">' + j + '</div><div class="logs-container"></div></td>';
            numRow++;
            today++;
            if (numRow == 7) {  // 如果已经到一行（一周）了，重新创建tr
                numRow = 0;
                html += '</tr><tr>';
            }
        }

        html += '</tbody></table></div>';
        return html;
    },
    /**
     * 高亮某个日期
     *
     * @param timestamp date 要高亮的日期
     */
    highlight : function(date) {
        // 获取开始时间
        var start_time = new Date(parseInt(date['start'])),
            selector = start_time.getFullYear() + '-' + (start_time.getMonth() + 1) + '-' + start_time.getDate(),
            duration = date['end'] - date['start'],
            logs = $('#date-' + selector).addClass('highlighted').children('.logs-container'),
            dom = logs.children('.logs');

        // 写入log
        var log = '- ' + TIMER.ts2hms(date['start']) + ' 开始，持续：' + TIMER.ms2t(date['end'] - date['start']) + '\n';
        if( !dom || !dom.length ) {
            dom = $('<div>').addClass('logs').appendTo(logs);
        }
        $('<p>').html(log).appendTo(dom);
    },
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

$(document).ready(MOYU.init);