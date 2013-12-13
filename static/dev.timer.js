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