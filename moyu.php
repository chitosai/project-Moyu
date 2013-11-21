<?php

require('include/accounts.php');
require('include/config.php');
require('include/utility.php');
require('user.php');


if( isset($_GET['c']) ) {
	switch( $_GET['c'] ) {
		// 注册
		case 'r' : USER::reg( $_COOKIE['u'], $_COOKIE['p'] ); break;
		// 修改密码
		case 'e' : USER::password( $_COOKIE['u'], $_COOKIE['p'], $_GET['n'] ); break;
	}
}