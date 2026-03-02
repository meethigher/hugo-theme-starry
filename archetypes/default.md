---
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
date: '{{ .Date }}'
categories: []
tags: []
type: post
draft: false
comments: false
mathjax: false
state: none
weight: 999999
---

summary

<!--more-->

Parameter Description

-   **categories**: `[]` Indicates the categories of the article
-   **tags**: `[]` Indicates the tags of the article
-   **type**: `post` A theme-defined value indicating that the article will be displayed in home.html, list.html, and search results.
-   **draft**: `true` Indicates that the article will not generate an HTML file.
-   **comments**: `false` Indicates that Gitalk is disabled for this article.
-   **mathjax**: `true` Enables mathematical formula rendering.
-   **state**: `none` Indicates default status. If set to `draft`, the article title will display "WIP". If set to `top`, the article title will display "Pinned" (must be used together with weight).
-   **weight**: The smaller the number, the higher the article appears in the list.

