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