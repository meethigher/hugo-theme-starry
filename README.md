# Hugo Theme Starry

使用[Hexo](https://hexo.io/)作为静态网站生成器已有接近6年，博客的数量也有300篇了，构建时要好几分钟，无法充分利用CPU多核的优势，后面尝试用[Hugo](https://gohugo.io/)进行300篇文章构建，只需要4秒，这对我来说很惊艳。

因此诞生了将该主题[hexo-theme-starry](https://github.com/meethigher/hexo-theme-starry)迁移至[hugo-theme-starry](https://github.com/meethigher/hugo-theme-starry)的想法。

这里面有好多兼容hexo的用法或者说是习惯。

项目结构说明

```sh
├─archetypes: 创建内容时的默认模板
├─assets: 主题的资源文件
│  ├─css
│  └─js
├─layouts: hugo主题的核心
│  ├─partials
│  │  │  head.html: 网页标头
│  │  │  header.html: 网页导航栏
│  │  │  footer.html: 网页页脚
│  │  │
│  │  └─head
│  │          css.html
│  │          js.html
│  │
│  └─_default
│          baseof.html: 所有页面的底层模板
│          home.html:  展示首页
│          index.json: 索引文件模板
│          list.html: 展示列表页，如tags、archives
│          single.html: 展示内容页
├─static: 存放主题的静态资源。比如favicon.ico，该内容在生成时的路径为/，不是/static，注意区分
├─theme.yml: 主题信息说明
├─content: 可删除。主题开发时的内容示例
│  ├─about
│  └─archives
├─public: 可删除。资源生成的所在路径
├─hugo.yml: 可删除。主题开发时的配置文件示例。该文件可以拷贝出去作为生产环境的配置
```

## Features

一款适用于个人使用的简洁、轻量、响应式、暗色的博客主题。

* 主题核心是基于Scss(Sass3引入的语法)+JQuery，使用到的第三方库都是使用的离线版本
* 支持压缩css和js
* 支持[生成用于检索的全文json](https://www.cnblogs.com/fatedeity/p/16820325.html)
* 支持图片懒加载、自定义图片懒加载效果
* 支持mathjax
* 支持sitemap、seo优化
* 大纲目录显示可控
* 文章分享与打赏
* 基于[Gitalk](https://gitalk.github.io/)的评论体系
* 基于[View.js](https://fengyuanchen.github.io/viewerjs/)的图片查看器，支持多端图片查看时自由缩放
* 基于[count-for-page](https://github.com/meethigher/count-for-page)的访问统计
* 基于[tsParticles](https://particles.js.org/)的动态粒子效果

## Installation

## Configuration

## Usage

新建文章

```sh
hugo new content archives/post-1/index.md
```

构建压缩网页并开启测试服务

```sh
hugo --minify && hugo server -p 4000
```
