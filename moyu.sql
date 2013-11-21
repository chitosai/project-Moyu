-- phpMyAdmin SQL Dump
-- version 2.10.3
-- http://www.phpmyadmin.net
-- 
-- 主机: localhost
-- 生成日期: 2013 年 11 月 21 日 13:30
-- 服务器版本: 5.0.51
-- PHP 版本: 5.2.6

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- 数据库: `moyu`
-- 

-- --------------------------------------------------------

-- 
-- 表的结构 `log`
-- 

CREATE TABLE IF NOT EXISTS `log` (
  `id` int(11) NOT NULL COMMENT '用户id',
  `start` timestamp NOT NULL COMMENT '开始时间',
  `end` timestamp NOT NULL COMMENT '结束时间',
  KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- 
-- 导出表中的数据 `log`
-- 


-- --------------------------------------------------------

-- 
-- 表的结构 `user`
-- 

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL auto_increment COMMENT '用户编号',
  `name` varchar(16) NOT NULL COMMENT '用户名',
  `pwdhash` char(64) NOT NULL COMMENT '密码hash',
  PRIMARY KEY  (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- 
-- 导出表中的数据 `user`
-- 

