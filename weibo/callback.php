<?php
/*
 * 微博授权回调
 * 
 */
session_start();

include_once( '../include/accounts.php');
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
    // 授权成功
    echo '授权完成,<a href="/moyu/index">返回摸鱼</a><br />';

    // 保存用户数据
    $cache = new CACHE();
    // 保存token
    $cache->set( CACHE::get_token_key($token['uid']), $token['access_token'], 0, $token['expires_in'] );
} else {
    echo '授权失败。';
}

?>
