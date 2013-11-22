<?php
/*
 * 微博授权回调
 * 
 */
session_start();

include_once( '../include/config.php');
include_once( '../include/utility.php');

include_once( 'saetv2.ex.class.php' );

$o = new SaeTOAuthV2( WB_AKEY , WB_SKEY );

if (isset($_REQUEST['code'])) {
	$keys = array();
	$keys['code'] = $_REQUEST['code'];
	$keys['redirect_uri'] = WB_CALLBACK_URL;
	try {
		$token = $o->getAccessToken( 'code', $keys ) ;
	} catch (OAuthException $e) {
        // error?
	}
}
/*
 * 微博授权回调 END
 * 
 */


if ($token) {
    // var_dump($token);
    // 保存授权数据
    $cache = new CACHE();
    // 保存token
    $r = $cache->set( CACHE::get_token_key($token['uid']), $token['access_token'], 0/*, $token['expires_in'] 渣浪测试账号授权5年..超过上限了，暂且用默认的1小时吧*/ );
    if( $r ) {
        echo '授权完成';
    } else {
        echo '保存token失败';
    }
} else {
    echo '授权失败';
}

?>
,<a href="/moyu">返回摸鱼</a><br />