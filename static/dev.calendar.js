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
        // 获取当前日期
        var today = new Date(),
            today_y = today.getFullYear(),
            today_m = today.getMonth() + 1,
            today_d = today.getDate();

        // 本月有多少天(即最后一天的getDate()，但是最后一天不知道，我们可以用“上个月的0来表示本月的最后一天”)
        var nDays = new Date(year, month, 0).getDate();

        // 开始画日历
        var numRow = 0;      // 记录行的个数，到达7的时候创建tr
        var i, j, day = 1; // 日期
        var html = '', flag = '';
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
            // 超过当天的日期隐藏
            if( (year >= today_y) && (month >= today_m) ) {
                if( day > today_d )
                    flag = ' class="hidden"';
                else if( day == today_d )
                    flag = ' class="today"';
                else
                    flag = '';
            } else {
                flag = '';
            }

            html += '<td id="date-' + year + '-' + month + '-' + day + '"' + flag + '><div class="day">' + j + '</div><div class="logs-container"></div></td>';
            numRow++;
            day++;
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
