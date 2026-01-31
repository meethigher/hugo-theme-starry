(function (global) {
    function Starry() {
        this.funcUtils.log(`Welcome! You’re using hugo-theme-starry`);
        let key = "starry-theme-mode";
        let value = localStorage.getItem(key);
        this.config = {
            themeKey: key,
            themeValue: value,
            starryId: "starry"
        };
        this.startTime = performance.now();
    }

    Starry.prototype.varConfiguration = {
        varProgressEnable: true,
        varStarCount: 200,
        varStarryEnable: true,
        varToolExpanded: true,
        varSiteBegin: "2019/09/15 19:57:09",
        varStatsServiceEnable: true,
        varStatsServiceUrl: "https://meethigher.top/census/count"
    };

    Starry.prototype.funcGetStats = function (target, href, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", target, true);
        xhr.setRequestHeader("origin-referer", document.referrer);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(null, xhr.response);
            } else {
                callback(new Error("Request failed with status " + xhr.status));
            }
        };
        xhr.onerror = function () {
            callback(new Error("Network error"));
        };
        xhr.send(href);
    };


    Starry.prototype.funcInit = function () {
        this.funcBindEvents();
        this.funcApplyTheme();
        this.funcUtils.printInfo(this.startTime);
        this.funcUtils.log(`Theme configuration: varProgressEnable=${this.varConfiguration.varProgressEnable}`);
        this.funcUtils.log(`Theme configuration: varStarryEnable=${this.varConfiguration.varStarryEnable}`);
        this.funcUtils.log(`Theme configuration: varStarCount=${this.varConfiguration.varStarCount}`);
        this.funcUtils.log(`Theme configuration: varToolExpanded=${this.varConfiguration.varToolExpanded}`);
        this.funcUtils.log(`Theme configuration: varSiteBegin=${this.varConfiguration.varSiteBegin}`);
        this.funcUtils.log(`Theme configuration: varStatsServiceEnable=${this.varConfiguration.varStatsServiceEnable}`);
        this.funcUtils.log(`Theme configuration: varStatsServiceUrl=${this.varConfiguration.varStatsServiceUrl}`);
    };

    Starry.prototype.funcDiffDaysHours = function (startTime) {
        const start = new Date(startTime.replace(/-/g, "/")).getTime();
        const now = Date.now();

        let diffMs = now - start;

        const hourMs = 60 * 60 * 1000;
        const dayMs = 24 * hourMs;
        const yearMs = 365 * dayMs;

        const years = Math.floor(diffMs / yearMs);
        diffMs %= yearMs;

        const days = Math.floor(diffMs / dayMs);
        diffMs %= dayMs;

        const hours = Math.floor(diffMs / hourMs);

        return {years, days, hours};
    };


    Starry.prototype.funcStartProgress = function (url) {
        if (this.varConfiguration.varProgressEnable) {
            const container = document.getElementById("progressContainer");
            const bar = document.getElementById("progressBar");
            container.style.display = "block";
            requestAnimationFrame(() => {
                bar.style.width = "100%";
            });
            setTimeout(() => {
                window.location.href = url;
            }, 300);
        }
    };

    Starry.prototype.funcRegenStarry = function () {
        if (this.config.themeValue === "dark" && this.varConfiguration.varStarryEnable) {
            let start = performance.now();
            const starsContainer = document.getElementById(this.config.starryId);
            starsContainer.innerHTML = "";
            const starCount = this.varConfiguration.varStarCount;
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement("div");
                star.classList.add("star");

                // 随机位置
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                star.style.left = `${x}%`;
                star.style.top = `${y}%`;

                // 随机大小
                const size = Math.random() * 3 + 1;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;

                // 随机动画持续时间
                const duration = Math.random() * 5 + 3;
                star.style.setProperty("--duration", `${duration}s`);

                // 随机延迟
                const delay = Math.random() * 5;
                star.style.animationDelay = `${delay}s`;

                starsContainer.appendChild(star);
            }
            this.funcUtils.log(`Theme regenerated ${starCount} stars consumed ${(performance.now() - start).toFixed(2)} ms`);
        }

    };

    Starry.prototype.funcBindEvents = function () {
        // 主题切换
        const toggleBtn = document.getElementById("themeToggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
                this.funcToggleTheme();
            });
        }

        // 导航栏移动端菜单按钮
        let mobileHeaderMenu = document.getElementById("mobileHeaderMenu");
        if (mobileHeaderMenu) {
            mobileHeaderMenu.addEventListener("click", () => {
                const expanded = mobileHeaderMenu.getAttribute("aria-expanded") === "true";
                mobileHeaderMenu.setAttribute("aria-expanded", String(!expanded));
                document.getElementById("headerNav").classList.toggle("open", !expanded);
            });
        }

        // 返回顶部与返回底部
        const scrollToTop = document.getElementById("scrollToTop");
        if (scrollToTop) {
            scrollToTop.addEventListener("click", () => {
                window.scrollTo({top: 0, behavior: "smooth"});
            });
        }
        const scrollToBottom = document.getElementById("scrollToBottom");
        if (scrollToBottom) {
            scrollToBottom.addEventListener("click", () => {
                window.scrollTo({top: document.documentElement.scrollHeight, behavior: "smooth"});
            });
        }

        // 侧边工具栏展开/收起
        let toolMenuSwitcher = document.getElementById("toolMenuSwitcher");
        let sidebarTools = document.getElementById("sidebarTools");
        if (toolMenuSwitcher && sidebarTools) {
            toolMenuSwitcher.addEventListener("click", () => {
                sidebarTools.setAttribute("aria-expanded", String(!this.varConfiguration.varToolExpanded));
                this.varConfiguration.varToolExpanded = !this.varConfiguration.varToolExpanded;
            });
        }

        // 跳转进度条
        document.querySelectorAll("a").forEach(a => {
            const self = this;
            a.addEventListener("click", e => {
                const href = a.getAttribute("href");
                const target = a.getAttribute("target");
                if (href && !href.startsWith("#") && target !== "_blank" && self.varConfiguration.varProgressEnable) {
                    e.preventDefault();
                    self.funcStartProgress(href);
                }
            });
        });

        // 更新底部栏时间
        let diff = this.funcDiffDaysHours(this.varConfiguration.varSiteBegin);
        let timeYear = document.getElementById("timeYear");
        let timeDay = document.getElementById("timeDay");
        let timeHour = document.getElementById("timeHour");
        if (diff && timeYear && timeDay && timeHour) {
            timeYear.innerText = diff.years;
            timeDay.innerText = diff.days;
            timeHour.innerText = diff.hours;
        }

        // 获取访问信息
        const statsValue = document.getElementById("statsValue");
        this.funcGetStats(this.varConfiguration.varStatsServiceUrl,
            window.location.href.replace(/http:\/\/|https:\/\//, ""), function (err, data) {
                if (!err && statsValue) {
                    statsValue.innerText = data;
                }
            });
    };

    Starry.prototype.funcApplyTheme = function () {
        document.documentElement.setAttribute(this.config.themeKey, this.config.themeValue);
        localStorage.setItem(this.config.themeKey, this.config.themeValue);
        this.funcRegenStarry();
    };

    Starry.prototype.funcToggleTheme = function () {
        this.config.themeValue = this.config.themeValue === "light" ? "dark" : "light";
        this.funcApplyTheme();
        this.funcUtils.log(`Theme switched to ${this.config.themeValue}`);
    };

    Starry.prototype.funcUtils = {
        formatTime: function () {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },
        log: function (msg) {
            const timestamp = this.formatTime();
            console.log(`[Starry] [${timestamp}]`, msg);
        },
        printInfo: function (startTime) {
            const loadTime = (performance.now() - startTime).toFixed(2);
            const info = {
                author: "https://meethigher.top",
                createdDate: "2026-02-02",
                github: "https://github.com/meethigher/hugo-theme-starry",
                loadTime: `${loadTime} ms`
            };

            const separator = "=".repeat(50);
            const greenStyle = "color: #4CAF50; font-weight: bold; font-size: 14px;";
            const blueTitleStyle = "color: #2196F3; font-weight: bold; font-size: 16px;";
            const labelStyle = "color: #666; font-weight: bold;";
            const valueStyle = "color: #333;";
            const linkStyle = "color: #2196F3; text-decoration: underline;";
            const timeStyle = "color: #FF9800;";

            console.log(
                `%c${separator}\n%chugo-theme-starry\n%c${separator}\n%cAuthor: %c${info.author}\n%cGitHub: %c${info.github}\n%cCreated: %c${info.createdDate}\n%cLoadTime: %c${info.loadTime}\n%c${separator}`,
                greenStyle,
                blueTitleStyle,
                greenStyle,
                labelStyle, valueStyle,
                labelStyle, valueStyle,
                labelStyle, linkStyle,
                labelStyle, timeStyle,
                greenStyle
            );
        }
    };

    global.Starry = Starry;

})(window);
