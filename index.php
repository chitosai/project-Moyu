<!doctype html>
<html lang="cn">
<head>
    <meta charset="UTF-8">
    <title>Project · 摸鱼</title>
    <style><? include('static/moyu.css'); ?></style>
</head>
<body>
    <!-- header -->
    <div id="header">
        <!-- 未登录 -->
        <div id="signin">
            <a href="javascript: login();" id="login">登录</a>
            <a href="javascript: reg();" id="reg">注册</a>
            <!-- 登录区 -->
            <div id="do-signin">
                <form>
                    
                </form>
            </div>
        </div>
        <!-- 已登录 -->
        <div id="signout">
            <span>我<span id="username"></span>又来摸鱼了！</span>
            <a href="javascript: edit_password();" id="edit-password">修改密码</a>
            <a href="javascript: logout();" id="logout">注销</a>
        </div>
    </div>
    <!-- 摸鱼控制台 -->
    <div id="wrapper">
        <a href="javascript: start();" title="不要犹豫了，摸吧" id="moyu-start">开始</a><!--
     --><a href="javascript: end();" title="是时候干活了" id="moyu-end">结束</a><!--
     --><span>摸鱼</span>
    </div>
    <script>
    <? include('static/zepto.min.js');
       include('static/crypto.sha256.js');
       include('static/moyu.js'); 

    ?></script>
</body>
</html>