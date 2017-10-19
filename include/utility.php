<?php

/**
 * mbe.ro
 *
 * @author     Ciprian Mocanu <http://www.mbe.ro> <ciprian@mbe.ro>
 * @license    Do whatever you like, just please reference the author
 * @version    1.56
 */
class DB {
    var $con;
    function __construct() {
        $this->con=new mysqli(DB_HOST,DB_USER,DB_PASS,DB_NAME) or die ('Error connecting to MySQL');
        if(mysqli_connect_error()){
            echo mysqli_connect_error();
        }
        $this->con->set_charset("utf8");
    }
    function __destruct() {
        $this->con->close();
    }
    function query($sql='') {
        $res = $mysqli->query($sql);
        return $res->fetch_array(MYSQLI_ASSOC);
    }
    function insert($table=null,$array_of_values=array()) {
        if ($table===null || empty($array_of_values) || !is_array($array_of_values)) return false;
        $fields=array(); $values=array();
        foreach ($array_of_values as $id => $value) {
            $fields[]=$id;
            if (is_array($value) && !empty($value[0])) $values[]=$value[0];
            else $values[]="'".mysql_real_escape_string($value,$this->con)."'";
        }
        $s = "INSERT INTO $table (".implode(',',$fields).') VALUES ('.implode(',',$values).')';
        $res = $this->con->query($s);
        if ( $res ) {
            return $this->con->insert_id;
        }
        return false;
    }
}



/* 
 * 现在用的是Memcache
 *
 */
class CACHE { 
    private $mmc = null; 
    function __construct() { 
        $this->mmc = new memcache(); 
        $this->mmc->connect( CACHE_HOST, CACHE_PORT ) or die('Memcache init failed');
    }
    function __destruct() {
        if(!$this->mmc) return false;
        return $this->mmc->close();
    }
    function set($key, $var, $compress = MEMCACHE_COMPRESSED, $expire = 3600) { 
        if(!$this->mmc) return false; 
        return $this->mmc->set($key, $var, $compress, $expire); 
    } 
    function get($key) { 
        if(!$this->mmc) return false; 
        return $this->mmc->get($key); 
    } 
    function incr($key, $value=1) { 
        if(!$this->mmc) return false; 
        return $this->mmc->increment($key, $value); 
    } 
    function decr($key, $value=1) { 
        if(!$this->mmc) return false; 
        return $this->mmc->decrement($key, $value); 
    } 
    function delete($key) { 
        if(!$this->mmc) return false; 
        return $this->mmc->delete($key); 
    }
    function flush() {
        if(!$this->mmc) return false; 
        return $this->mmc->flush();
    }
    function stats() {
        if(!$this->mmc) return false;
        var_dump($this->mmc->getStats());
    }

    // for moyu
    static function get_token_key( $id ) {
        return $id . ':TOKEN';
    }
    static function get_start_key( $id ) {
        return $id . ':START';
    }
    static function get_statistics_key( $id ) {
        return $id . ':STATISTICS';
    }
}


/*
 * 计时器
 *
 */
class TIMER {
    private $StartTime = 0;
    private $StopTime = 0;
    function get_microtime() {
        list($usec, $sec) = explode(' ', microtime());
        return ((float)$usec+(float)$sec);
    }
    function start() {
        $this->StartTime = $this->get_microtime();
    }
    function stop() {
        $this->StopTime = $this->get_microtime();
    }
    function spent() {
        return '<br>' . ($this->StopTime - $this->StartTime) . '(s)<br>';
    }

    /**
     * 检查时间戳是否合法
     *
     */
    public static function valid( $timestamp ) {
        if( !is_string($timestamp) || !is_numeric($timestamp) || strlen( $timestamp ) != 13 )
            USER::fatal( '时间戳格式非法' );
    }
}


/**
 * USER
 * 
 */
class USER {
    /**
     * 向用户输出信息
     *
     */
    public static function send( $status, $data = null ) {
        // 基本返回值
        $return = array(
            'status' => $status,
        );
        // 如果有额外数据就带上
        if( $data ) $return = array_merge($return, $data);
        // 搞成json送出
        echo json_encode($return);
    }

    /**
     * OK
     * 
     */
    public static function ok( $data = null ) {
        USER::send( 'OK', $data );
    }

    /**
     * 输出错误信息
     *
     */
    public static function error( $message = '', $data = null ) {
        // 错误信息
        $error = array(
            'message' => $message,
        );
        // 带上额外数据
        if( $data ) $error = array_merge( $error, $data );
        # 送出
        USER::send( 'error', $error );
    }

    /**
     * 输出错误信息并终止php运行
     * 
     */
    public static function fatal( $message = null, $data = null ) {
        USER::error( $message, $data );
        exit();
    }

    /**
     * 检查用户身份
     * 
     */
    public static function valid( $id, $token ) {
        // 检查授权格式...
        // TODO: 为什么要做这步？有点多余吧..
        $token_replaced = preg_replace('/[^A-Z0-9]/', '', $token);
        $id_replaced = preg_replace('/[^A-Z0-9]/', '', $id);
        if( strlen($id) != 32 || strlen($token) != 32 || strlen($id_replaced) < strlen($id) || strlen($token_replaced) < strlen($token) ) {
            USER::fatal( '授权格式不正确，请<a href=' . OAUTH_URL . '>重新登录</a>' );
        }

        // 验证授权
        $cache = new CACHE();
        $token_in_cache = $cache->get( CACHE::get_token_key($id) );

        // 缓存中没有token信息，大概是过期了？
        if( !$token_in_cache ) {
            USER::fatal( '授权过期，请<a href=' . OAUTH_URL . '>重新登录</a>' );
        }
        // 有token但与用户传递来的不同
        else if( $token != $token_in_cache ) {
            // 清除缓存中的token
            $cache->delete( CACHE::get_token_key($id) );
            USER::fatal( '授权异常，请<a href=' . OAUTH_URL . '>重新登录</a>' );
        }
        // 没有问题
        return true;
    }

    /**
     * 根据qq_open_id获取uid 
     * 
     */
    public static function uid( $qq_id ) {
        $db = new DB();
        // 获取用户uid
        $uid = $db->get('id', 'id', 'qq_id=\'' . $qq_id . '\'');
        // 没有uid说明是第一次使用，写入新uid
        if( !$uid ) $uid = $db->insert('id', array( 'qq_id' => $qq_id ));
        // 还有错误的话就他妈见鬼了
        if( !$uid ) {
            $mysql_error = mysql_error();
            USER::fatal( '创建用户出错', array( 'MYSQL' => $mysql_error ));
        }
        unset($db);
        return $uid;
    }
}