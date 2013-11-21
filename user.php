<?php

/*
 * 与用户相关的逻辑
 *
 */
class USER {
	/*
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
        var_dump($return);
        // echo json_encode($return);
	}

	/*
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

	/*
	 * 验证输入格式是否合法
	 *
	 */
	public static function valid( $name, $pwdhash ) {
		USER::valid_user_name( $name );
		USER::valid_pwdhash( $pwdhash );
	}

	/*
	 * 验证用户名格式是否合法
	 *
	 */
	private static function valid_user_name( $name ) {
		// 检查长度是否合法
		if( strlen($name) < USER_NAME_MIN_LENGTH || strlen($name) > USER_NAME_MAX_LENGTH ) {
			USER::error(INVALID_NAME_OR_PWDHASH);
			exit();
		}

		// 替换掉合法字符
		$name = preg_replace( VALID_ALPHABET, '', $name);
		// 检查是否有非法字符
		if( strlen($name) ) {
			USER::error(INVALID_NAME_OR_PWDHASH);
			exit();
		}
	}

	/*
	 * 验证密码格式是否合法
	 *
	 */
	private static function valid_pwdhash( $pwdhash, $error_message = INVALID_NAME_OR_PWDHASH ) {
		// 检查长度是否合法
		if( strlen($pwdhash) != PASSWORD_HASH_MAX_LENGTH ) {
			USER::error($error_message);
			exit();
		}

		// 替换掉合法字符
		$pwdhash = preg_replace( VALID_ALPHABET, '', $pwdhash);
		// 检查是否有非法字符
		if( strlen($pwdhash) ) {
			USER::error($error_message);
			exit();
		}
	}

	/*
	 * 检查用户/密码是否正确
	 *
	 */
	public static function auth( $name, $pwdhash ) {
		// 根据用户名获取密码
		$db = new DB();
		$pwdhash_in_db = $db->get( 'user', 'pwdhash', 'name='.$name );

		var_dump($pwdhash_in_db);
		exit();
	}

	/*
	 * 注册
	 *
	 */
	public static function reg( $name, $pwdhash ) {
		// 检查输入是否合法
		USER::valid( $name, $pwdhash );

		// 开始注册
		$db = new DB();
		$r = $db->insert('user', array( 'name' => $name, 'pwdhash' => $pwdhash ) );
		unset($db);

		// RETURN
		if( $r ) {
			USER::send('OK');
		} else {
			USER::error('用户名已存在');
		}
	}

	/*
	 * 修改密码
	 *
	 */
	public static function password( $name, $old, $new ) {
		// 检查输入是否合法
		USER::valid( $name, $pwdhash );
		USER::valid_pwdhash( $new, '新密码格式不正确' );
	}
}