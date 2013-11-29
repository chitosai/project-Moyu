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
     * @param string $id QQ open_id
     * @param string $timestamp 开始摸鱼的时间戳（允许用户自己发送时间戳而不是直接php获取是防止服务器所在时区与用户不一致
     */
    public static function start( $id, $timestamp ) {
        // 检查时间戳是否合法
        TIMER::valid( $timestamp );
        
        $cache = new CACHE();
        // 检查是否已经在摸鱼
        $time = $cache->get( CACHE::get_start_key($id) );
        if( $time ) {
            // 提示用户已经在摸鱼了
            USER::fatal( '你已经在摸鱼了，请先把上次的鱼摸完', array( 'start_time' => $time ) );
        } else {
            // 记录摸鱼开始标识
            $cache->set( CACHE::get_start_key($id), $timestamp, 0, CACHE_MOYU_EXPIRE);
            USER::ok();
        }
    }

    /**
     * 结束摸鱼
     *
     * @param string $id QQ open_id
     * @param string $timestamp 结束摸鱼的时间戳（由用户自行发送，必须保证此时间大于开始时间
     */
    public static function end( $id, $end ) {
        // 检查时间戳是否合法
        TIMER::valid( $end );
        
        $cache = new CACHE();
        // 检查是否已经在摸鱼
        $start = $cache->get( CACHE::get_start_key($id) );
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
                $r = $db->insert('log', array( 'id' => $id, 'start' => $start, 'end' => $end ));
                if( $r === false ) {
                    USER::error( '写入数据库时出错', array( 'MYSQL_ERROR' => mysql_error( $db->con )) );
                } else {
                    // 清除缓存中的开始摸鱼标识
                    $cache->delete( CACHE::get_start_key($id) );
                    // 输出
                    USER::ok();
                }
            }
        }
    }

    /**
     * 检查是否在摸鱼
     * 参数同上
     *
     * @return TRUE 已经在摸鱼
     * @return FALSE 没在摸鱼
     */
    public static function check( $id ) {
        $cache = new CACHE();
        // 检查是否在摸鱼
        $start = $cache->get( CACHE::get_start_key($id) );
        if( $start ) 
            USER::send( 'TRUE', array( 'start_time' => $start ) );
        else
            USER::send( 'FALSE' );
    }

    /**
     * 查询并返回所有log
     * 
     * @param  [int] $id
     * @return [object] {'logs' : [ 'log' : { 'start' : 1234567890123, 'end' : 1234567890123 } ] }
     */
    public static function statistics( $id ) {
        $db = new DB();
        $logs = $db->query('SELECT `start`, `end` FROM `log` WHERE `id` = \'' . $id . '\'');

        // 当返回值为bool(false)时才是出错，id不存在时可能返回array(0)
        if( $logs === false ) {
            USER::error('获取数据时出错');
        } else {
            USER::ok( array('logs' => $logs) );
        }
    }
}



/**
 * GO
 * 
 */
if( isset($_GET['c']) ) {
    // 获取授权信息
    if( isset($_COOKIE['oauth_id']) && isset($_COOKIE['oauth_token']) ) {
        $id = $_COOKIE['oauth_id'];
        $token = $_COOKIE['oauth_token'];
    } else {
        USER::fatal('请先用QQ账号登陆');
    }
    // 检查用户身份
    USER::valid( $id, $token );

	switch( $_GET['c'] ) {
		// 开始摸鱼
        case 'start' : MOYU::start( $id, $_GET['timestamp'] ); break;
        // 结束摸鱼
        case 'end'   : MOYU::end( $id, $_GET['timestamp'] ); break;
        // 检查是否在摸鱼
        case 'check' : MOYU::check( $id ); break;
        // 统计
        case 'statistics' : MOYU::statistics( $id ); break;
        // error
        default      : USER::fatal('未知操作');
	}
} else {
    USER::fatal('参数不正确');
}