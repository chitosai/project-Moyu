<?php

// 用户名长度
define('USER_NAME_MIN_LENGTH', 4);
define('USER_NAME_MAX_LENGTH', 22);

// 正常密码hash长度
define('PASSWORD_HASH_MAX_LENGTH', 64);

// 用户名、密码hash合法自发
define('VALID_ALPHABET', '/[a-zA-Z0-9]/');

// 用户名、密码hash格式非法提示
define('INVALID_NAME_OR_PWDHASH', '用户名或密码非法');