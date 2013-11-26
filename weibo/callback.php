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
$token = null;

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
    $uid = $token['uid'];
    $access_token = $token['access_token'];
    $expire = time() + $token['expires_in'];

    // 保存授权数据
    $cache = new CACHE();
    // 保存token
    $r = $cache->set( CACHE::get_token_key($uid), $access_token, 0/*, $token['expires_in'] 渣浪测试账号授权5年..超过上限了，暂且用默认的1小时吧*/ );

    if( $r ) {
        // 保存uid/access_token
        setcookie('weibo_uid', $uid, $expire, COOKIE_PATH, COOKIE_DOMAIN, false, true);
        setcookie('weibo_token', $access_token, $expire,  COOKIE_PATH, COOKIE_DOMAIN, false, true);

        // 获取用户名/头像地址
        $c = new SaeTClientV2( WB_AKEY , WB_SKEY , $access_token );
        $user = $c->show_user_by_id( $uid );
        $user_name = urlencode($user['screen_name']);
        $user_avatar = $user['profile_image_url'];

        // 保存用户名/头像地址
        setcookie('weibo_user', $user_name, $expire, COOKIE_PATH, COOKIE_DOMAIN);
        setcookie('weibo_avatar', $user_avatar, $expire, COOKIE_PATH, COOKIE_DOMAIN);

        echo '授权完成';
    } else {
        echo '保存token失败';
    }

} else {
    echo '授权失败';
}

?>
,<a href="/moyu">返回摸鱼</a><br />