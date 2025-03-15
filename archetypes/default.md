---
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
date: {{ .Date }}
type: post
tags: []
draft: false
comments: false
mathjax: false
headless: false
weight: 999999
state: none
---

参数说明如下

* type: post在该主题中，表示是博客类型，会在首页与归档页展示
* tags: []表示该文章的标签，英文逗号分隔
* draft: true表示该文章不显示在首页与归档页展示
* comments: false表示该文章不显示评论
* mathjax: false表示该文章不显示数学公式
* headless: true表示该内容是一个无头页面，它不会生成独立的HTML页面，但内容可以被其他模板引用
* weight: 100表示该文章的权重，数字越大越靠前
* state: 自定义关键字。值为none表示无操作、值为draft会在title上表示未完成、值为top会在title上表示置顶

<!--more-->

content
