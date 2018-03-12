<?php

/*
 *调用接口代码
 *
 **/

include_once( '../../include/config.php');
include_once( '../../include/utility.php');

require_once("../API/qqConnectAPI.php");

$qc = new QC();
$oauth = $qc->qq_callback();

if ($oauth) {
    // 获取open_id
    $id = $qc->get_openid();
    // access_token
    $access_token = $oauth['access_token'];
    // 授权过期时间
    $expire = time() + $oauth['expires_in'];

    // 保存授权数据
    $cache = new CACHE();
    // 保存token 
    // 微博授权有效期90天，然而memcache只能缓存30天...
    $r = $cache->set( CACHE::get_token_key($id), $access_token, 0, 2592000 );

    if( $r ) {
        // 保存id/access_token
        setcookie('oauth_id', $id, $expire, COOKIE_PATH, COOKIE_DOMAIN, false, true);
        setcookie('oauth_token', $access_token, $expire,  COOKIE_PATH, COOKIE_DOMAIN, false, true);

        // 获取用户名/头像地址
        $qc_oauthed = new QC( $access_token, $id );
        $user = $qc_oauthed->get_user_info();
        $user_name = urlencode($user['nickname']);
        $user_avatar = $user['figureurl'];

        // 保存用户名/头像地址
        setcookie('oauth_user', $user_name, $expire, COOKIE_PATH, COOKIE_DOMAIN);
        setcookie('oauth_avatar', $user_avatar, $expire, COOKIE_PATH, COOKIE_DOMAIN);

        echo '授权完成<script>window.location.href = "/";</script>';
    } else {
        echo '保存token失败';
    }

} else {
    echo '授权失败';
}

?>
,<a href="/moyu">返回摸鱼</a><br />
