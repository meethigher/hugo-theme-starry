(function (global) {
    function Starry() {
        let key = "starry-theme-mode";
        let value = localStorage.getItem(key);
        this.config = {
            themeKey: key,
            themeValue: value,
            themeToggleBtn: "#themeToggle"
        };
        this.startTime = performance.now();
    }

    Starry.prototype.init = function () {
        this.utils.printInfo(this.startTime);
        this.bindEvents();
        this.applyTheme();
    };

    Starry.prototype.bindEvents = function () {
        const toggleBtn = document.querySelector(this.config.themeToggleBtn);
        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
                this.toggleTheme();
            });
        }
    };

    Starry.prototype.applyTheme = function () {
        document.documentElement.setAttribute(this.config.themeKey, this.config.themeValue);
        localStorage.setItem(this.config.themeKey, this.config.themeValue);
    };

    Starry.prototype.toggleTheme = function () {
        this.config.themeValue = this.config.themeValue === "light" ? "dark" : "light";
        this.applyTheme();
        this.utils.log(`Theme switched to ${this.config.themeValue}`);
    };

    Starry.prototype.utils = {
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
                author: "Kit Chen",
                createdDate: "2026-02-02",
                github: "https://github.com/meethigher/hugo-theme-starry",
                loadTime: `${loadTime}ms`
            };

            const separator = "=".repeat(50);
            const greenStyle = "color: #4CAF50; font-weight: bold; font-size: 14px;";
            const blueTitleStyle = "color: #2196F3; font-weight: bold; font-size: 16px;";
            const labelStyle = "color: #666; font-weight: bold;";
            const valueStyle = "color: #333;";
            const linkStyle = "color: #2196F3; text-decoration: underline;";
            const timeStyle = "color: #FF9800;";

            console.log(
                `%c${separator}\n%chugo-theme-starry\n%c${separator}\n%c作者: %c${info.author}\n%c创建日期: %c${info.createdDate}\n%cGitHub: %c${info.github}\n%c加载时间: %c${info.loadTime}\n%c${separator}`,
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
