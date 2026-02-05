---
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
date: '{{ .Date }}'
categories: []
tags: []
type: post
draft: false
comments: false
state: none
weight: 999999
---

参数说明如下

* categories: [] 表示该文章的分类，英文逗号分隔
* tags: [] 表示该文章的标签，英文逗号分隔
* type: post 为主题定义值，表示在 home.html、list.html、以及查询结果中展示。
* draft: true 表示该文章不生成 html
* comments: false 表示该文章不启用 gitalk
* state: none 表示默认、draft 文章标题会显示未完成、top 文章标题会显示置顶（置顶需与weight配合使用）
* weight: 数字越小，文章列表越靠前

<!--more-->

content
