<?php

require('include/config.php');
require('include/utility.php');

/**
 * 摸鱼
 * 
 */
class MOYU {
    /**
     * 开始摸鱼
     *
     * @param string $uid 渣浪微博uid
     * @param string $token 渣浪微博access_token
     * @param string $timestamp 开始摸鱼的时间戳（允许用户自己发送时间戳而不是直接php获取是防止服务器所在时区与用户不一致
     */
    public static function start( $uid, $token, $timestamp ) {
        // 检查用户身份
        USER::valid( $uid, $token );
        // 检查时间戳是否合法
        TIMER::valid( $timestamp );
        // 
        $cache = new CACHE();
        // 检查是否已经在摸鱼
        $time = $cache->get( CACHE::get_start_key($uid) );
        if( $time ) {
            // 提示用户已经在摸鱼了
            USER::fatal( '你已经在摸鱼了，请先把上次的鱼摸完', array( 'start_time' => $time ) );
        } else {
            // 记录摸鱼开始标识
            $cache->set( CACHE::get_start_key($uid), $timestamp, 0, CACHE_MOYU_EXPIRE);
            USER::ok();
        }
    }

    /**
     * 结束摸鱼
     *
     * @param string $uid 渣浪微博uid
     * @param string $token 渣浪微博access_token
     * @param string $timestamp 结束摸鱼的时间戳（由用户自行发送，必须保证此时间大于开始时间
     */
    public static function end( $uid, $token, $end ) {
        // 检查用户身份
        USER::valid( $uid, $token );
        // 检查时间戳是否合法
        TIMER::valid( $end );
        // 
        $cache = new CACHE();
        // 检查是否已经在摸鱼
        $start = $cache->get( CACHE::get_start_key($uid) );
        if( !$start ) {
            // 尚未开始摸鱼
            USER::fatal( '我还没开始，你就结束了///' );
        } else {
            // 判断结束时间是否大于开始时间
            if( floatval($end) <= floatval($start) ) {
                USER::fatal( '结束时间怎么会比开始时间还早！闹哪样（╯－＿－）╯' );
            } else {
                // 向数据库写入一次摸鱼log
                $db = new DB();
                $r = $db->insert('log', array( 'uid' => $uid, 'start' => $start, 'end' => $end ));
                if( $r === false ) {
                    USER::error( '写入数据库时出错', array( 'MYSQL_ERROR' => mysql_error( $db->con )) );
                } else {
                    // 清除缓存中的开始摸鱼标识
                    $cache->delete( CACHE::get_start_key($uid) );
                    // 输出
                    USER::ok();
                }
            }
        }
    }
}



/**
 * GO
 * 
 */
if( isset($_GET['c']) && isset($_GET['uid']) && isset($_GET['token']) ) {
    // 处理下输入
    $token = preg_replace('/[^a-zA-Z0-9\.,]/', '', $_GET['token']);
    if( !is_numeric($_GET['uid']) || strlen($token) < strlen($_GET['token']) ) {
        USER::fatal('授权信息格式非法');
    } else {
        $uid = $_GET['uid'];
    }

	switch( $_GET['c'] ) {
		// 开始摸鱼
        case 'start' : MOYU::start( $uid, $token, $_GET['timestamp'] ); break;
        // 结束摸鱼
        case 'end'   : MOYU::end( $uid, $token, $_GET['timestamp'] ); break;
        // error
        default      : USER::fatal('未知操作');
	}
} else {
    USER::fatal('参数不正确');
}