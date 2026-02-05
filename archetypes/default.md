---
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
date: '{{ .Date }}'
type: post
categories: []
tags: []
draft: false
comments: false
mathjax: false
state: none
weight: 999999
---

参数说明如下

* type: post在该主题中，表示是博客类型，会在首页与归档页展示
* categories: []表示该文章的分类，多个使用英文逗号分隔
* tags: []表示该文章的标签，英文逗号分隔
* draft: true表示该文章不生成html
* comments: false表示该文章不显示评论
* mathjax: false表示该文章不显示数学公式
* state: 自定义状态。none表示无操作、draft表示未完成、top表示置顶（置顶需与weight配合使用）
* weight: 数字越小，文章列表越靠前

<!--more-->

content
