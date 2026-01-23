# Hugo Theme Starry

使用 [hexo](https://hexo.io/) 作为网页生成器已有多年，300 篇的内容构建需要几分钟，原意是想着优化主题，提升性能，但其实提升并不大。最终尝试用 [hugo](https://gohugo.io/) 来进行构建，300 篇仅需 4 秒，这对我来说特别惊艳。

因此诞生了将该主题 [hexo-theme-starry](https://github.com/meethigher/hexo-theme-starry) 迁移至 [hugo-theme-starry](https://github.com/meethigher/hugo-theme-starry) 的想法。

我的初衷是实现原文件内容不修改的情况下，实现无感由 hexo 切换到 hugo，故此，这里面有好多兼容 hexo 的用法，

开发环境 windows 11 + hugo v0.154.5

项目结构说明

```sh
├─layouts                          # 模板目录：决定页面如何渲染（主题核心）
│  │  baseof.html                  # 基础模板：定义 HTML 外壳、公共结构（layout）
│  │  home.html                    # 首页模板：仅作用于站点根路径 /
│  │  list.html                    # 列表页模板：archives / tags / categories 等
│  │  single.html                  # 单页模板：文章页、独立页面的最终渲染
│  │  sitemap.xml                  # 站点地图模板：生成 sitemap.xml
│  │  index.json                   # 索引模板：常用于搜索、全文索引等 JSON 输出
│
├─archetypes                       # 内容原型目录：新建内容时使用的模板
│      default.md                  # 默认文章原型
│
├─static                           # 静态资源目录：原样拷贝到站点根目录
│
├─assets                           # 资源目录：CSS / SCSS / JS / 图片（会被 Hugo 处理）
│
├─content                          # 内容目录：站点实际内容（Markdown 文件）
│
├─i18n                             # 国际化目录：多语言翻译文本（.toml / .yaml）
│  
│  hugo.exe                        # Hugo 可执行文件（Windows 平台）
│  hugo.yml                        # Hugo 主配置文件（站点级配置）
│  theme.yml                       # 主题配置文件（主题元信息与参数）
```

## Features

## Installation

## Configuration

## Usage

新建文章，只建议如下方式

> 因为要兼容之前 [hexo-theme-starry](https://github.com/meethigher/hexo-theme-starry) 的做法

```sh
hugo new content archives/post-1/index.md
```

构建压缩网页并开启测试服务，若进行了功能的大修改，建议先删除`public`文件夹，并重启服务

```sh
hugo server -p 4000
```

打包并输出至 dist 目录

```sh
hugo --minify -d dist
```
## DevNotes

1.) 注意 [html/template](https://pkg.go.dev/html/template) 中的一些特殊语法，比如

```html
{{ partial "particles.html" . }}

<!-- 传入., 表示当前的模板上下文（context）递给 particles.html，它可以访问当前页面的数据 -->
{{ partial "particles.html" . }}
```

再比如注释

```html
{{/* 这是注释 */}}
```

2.) 在 home.html 中，展示内容列表时，注意区别

展示文章 `type:post` 的内容列表

```html
{{ range where site.RegularPages "Type" "post" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
{{ end }}
```

展示所有内容列表

```html
{{ range site.RegularPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
{{ end }}
```
