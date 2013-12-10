-- phpMyAdmin SQL Dump
-- version 2.10.3
-- http://www.phpmyadmin.net
-- 
-- 主机: localhost
-- 生成日期: 2013 年 12 月 10 日 07:44
-- 服务器版本: 5.0.51
-- PHP 版本: 5.2.6

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- 数据库: `moyu`
-- 

-- --------------------------------------------------------

-- 
-- 表的结构 `id`
-- 

DROP TABLE IF EXISTS `id`;
CREATE TABLE `id` (
  `id` int(11) NOT NULL auto_increment COMMENT '主键',
  `qq_id` char(32) NOT NULL COMMENT 'QQ_OPEN_ID',
  PRIMARY KEY  (`id`),
  UNIQUE KEY `qq_id` (`qq_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

-- 
-- 表的结构 `log`
-- 

DROP TABLE IF EXISTS `log`;
CREATE TABLE `log` (
  `id` int(11) NOT NULL COMMENT '用户id',
  `start` bigint(10) unsigned NOT NULL COMMENT '开始时间',
  `end` bigint(10) unsigned NOT NULL COMMENT '结束时间',
  KEY `uid` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
