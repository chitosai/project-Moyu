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
    function __construct($db=array()) {
        $default = array(
            'host' => DB_HOST,
            'user' => DB_USER,
            'pass' => DB_PASS,
            'db'   => DB_NAME
        );
        $db = array_merge($default,$db);
        $this->con=mysql_connect($db['host'],$db['user'],$db['pass'],true) or die ('Error connecting to MySQL');
        mysql_select_db($db['db'],$this->con) or die('Database '.$db['db'].' does not exist!');

        mysql_query("SET NAMES 'UTF8'"); // 为了咱中文...
    }
    function __destruct() {
        mysql_close($this->con);
    }
    function query($s='',$rows=false,$organize=true) {
        if (!$q=mysql_query($s,$this->con)) return false;
        if ($rows!==false) $rows = intval($rows);
        $rez=array(); $count=0;
        $type = $organize ? MYSQL_NUM : MYSQL_ASSOC;
        while (($rows===false || $count<$rows) && $line=mysql_fetch_array($q,$type)) {
            if ($organize) {
                foreach ($line as $field_id => $value) {
                    $table = mysql_field_table($q, $field_id);
                    if ($table==='') $table=0;
                    $field = mysql_field_name($q,$field_id);
                    $rez[$count][$table][$field]=$value;
                }
            } else {
                $rez[$count] = $line;
            }
            ++$count;
        }
        if (!mysql_free_result($q)) return false;
        return $rez;
    }
    function execute($s='') {
        if (mysql_query($s,$this->con)) return mysql_insert_id($this->con);
        return false;
    }
    function select($options) {
        $default = array (
            'table' => '',
            'fields' => '*',
            'condition' => '1',
            'order' => '1',
            'limit' => 50
        );
        $options = array_merge($default,$options);
        $sql = "SELECT {$options['fields']} FROM {$options['table']} WHERE {$options['condition']} ORDER BY {$options['order']} LIMIT {$options['limit']}";
        return $this->query($sql);
    }
    function row($options) {
        $default = array (
            'table' => '',
            'fields' => '*',
            'condition' => '1',
            'order' => '1'
        );
        $options = array_merge($default,$options);
        $sql = "SELECT {$options['fields']} FROM {$options['table']} WHERE {$options['condition']} ORDER BY {$options['order']}";
        $result = $this->query($sql,1,false);
        if (empty($result[0])) return false;
        return $result[0];
    }
    function get($table=null,$field=null,$conditions='1') {
        if ($table===null || $field===null) return false;
        $result=$this->row(array(
            'table' => $table,
            'condition' => $conditions,
            'fields' => $field
        ));
        if (empty($result[$field])) return false;
        return $result[$field];
    }
    function update($table=null,$array_of_values=array(),$conditions='FALSE') {
        if ($table===null || empty($array_of_values)) return false;
        $what_to_set = array();
        foreach ($array_of_values as $field => $value) {
            if (is_array($value) && !empty($value[0])) $what_to_set[]="`$field`='{$value[0]}'";
            else $what_to_set []= "`$field`='".mysql_real_escape_string($value,$this->con)."'";
        }
        $what_to_set_string = implode(',',$what_to_set);
        return $this->execute("UPDATE $table SET $what_to_set_string WHERE $conditions");
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
        if (mysql_query($s,$this->con)) return mysql_insert_id($this->con);
        return false;
    }
    function delete($table=null,$conditions='FALSE') {
        if ($table===null) return false;
        return $this->execute("DELETE FROM $table WHERE $conditions");
    }
    function get_affected_rows() {
        return mysql_affected_rows($this->con);
    }
}



/* 
 * 缓存操作类，现在用的是Memcache，不过考虑到以后可能会更换底层，所以封装的时候还是用CACHE这样抽象的名字。
 * 以后换缓存的话只要保持方法的接口一致就OK了
 *
 */
class CACHE { 
    private $mmc = null; 
    function __construct() { 
        if( !CACHE_ENABLE ) return;
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
}