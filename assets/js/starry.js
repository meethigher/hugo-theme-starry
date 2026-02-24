(function (global) {

    function StarrySearch(starry) {
        this.starry = starry;
        this.indexUrl = this.starry.varConfiguration.varSearchIndex;
        this.maxDescLength = 100;
        this.cacheExpire = 24 * 60 * 60 * 1000;
        this.dbName = "hugo-theme-starry";
        this.storeName = "starry";
        this.dbVersion = 1;
        this.searchIndex = [];
        // 防止“旧搜索结果覆盖新搜索结果”，每发起一次新搜索，版本号加一，版本号对不上，直接丢掉。
        this.searchVersion = 0;
        this.states = {
            LOADING_INDEX: "stateLoading",
            IDLE: "stateIdle",
            SEARCHING: "stateSearching",
            EMPTY: "stateEmpty",
            SUCCESS: "result"
        };
        this.currentState = this.states.IDLE;
        this.resultEl = document.getElementById("result");
        this.inputEl = document.getElementById("searchInput");
    }

    StarrySearch.prototype.openDB = function () {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    StarrySearch.prototype.getCache = async function (key) {
        const db = await this.openDB();
        return new Promise(resolve => {
            const tx = db.transaction(this.storeName, "readonly");
            const store = tx.objectStore(this.storeName);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    };

    StarrySearch.prototype.setCache = async function (key, value) {
        const db = await this.openDB();
        return new Promise(resolve => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            store.put(value, key);
            tx.oncomplete = () => resolve();
        });
    };

    StarrySearch.prototype.updateState = function (state) {
        this.currentState = state;
        const ele = document.getElementById(state);
        if (ele) {
            const activeElements = document.querySelectorAll(".search-active");
            activeElements.forEach(element => {
                element.classList.remove("search-active");
            });
            ele.classList.add("search-active");
        }
    };

    StarrySearch.prototype.truncateText = function (str) {
        if (!str) return "";
        return str.length <= this.maxDescLength ? str : str.slice(0, this.maxDescLength) + " …";
    };

    StarrySearch.prototype.formatDate = function (isoStr) {
        const date = new Date(isoStr);
        return date.toLocaleString(navigator.language, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
    };

    StarrySearch.prototype.debounce = function (fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    StarrySearch.prototype.loadIndex = async function () {
        this.updateState(this.states.LOADING_INDEX);
        const cache = await this.getCache("index");
        if (cache && Date.now() - cache.time < this.cacheExpire) {
            this.starry.funcUtils.log(`${cache.data.length} cache expire time ${new Date(cache.time + this.cacheExpire)}`, "Search");
            this.searchIndex = cache.data;
            this.updateState(this.states.IDLE);
            return;
        }
        this.starry.funcUtils.log(`cache not exist`, "Search");
        const res = await fetch(this.indexUrl);
        const data = await res.json();
        this.searchIndex = data;
        await this.setCache("index", {time: Date.now(), data});
        this.updateState(this.states.IDLE);
        this.starry.funcUtils.log(`${data.length} cache created ${new Date()}`, "Search");
    };

    StarrySearch.prototype.renderResults = function (list) {
        const t0 = performance.now();
        const innerHTML = list.map(item => `
        <div class="result-item" onclick="this.querySelector('a').click()">
            <time class="result-date" datetime="${item.D}">${this.formatDate(item.D)}</time>
            <a class="result-title" href="${item.P}">${item.T}</a>
            <div class="result-desc">${this.truncateText(item.C)}</div>
        </div>
    `).join("");
        this.resultEl.innerHTML = innerHTML;
        this.starry.funcUtils.log(`search render results consumed ${(performance.now() - t0).toFixed(2)} ms`, "Search");
    };

    StarrySearch.prototype.doSearch = function (keyword) {
        if (this.searchIndex.length === 0) {
            this.updateState(this.states.LOADING_INDEX);
            return;
        }
        if (!keyword) {
            this.updateState(this.states.IDLE);
            return;
        }

        const version = ++this.searchVersion;
        this.updateState(this.states.SEARCHING);

        setTimeout(() => {
            if (version !== this.searchVersion) return;

            const keywords = keyword.toLowerCase().split(/\s+/).filter(k => k);
            // 时间倒序排序
            const results = this.searchIndex.filter(item =>
                keywords.every(k => (item.T || "").toLowerCase().includes(k) || (item.C || "").toLowerCase().includes(k))
            ).sort((a, b) => new Date(b.D) - new Date(a.D));

            if (!results.length) {
                this.updateState(this.states.EMPTY);
                return;
            }

            this.updateState(this.states.SUCCESS);
            this.renderResults(results);

        }, 200);
    };

    StarrySearch.prototype.init = function () {
        this.updateState(this.states.LOADING_INDEX);
        this.loadIndex();

        this.inputEl.addEventListener("input", this.debounce(e => {
            this.doSearch(e.target.value.trim());
        }, 300));
    };


    function Starry() {
        this.funcUtils.log(`Welcome! You’re using hugo-theme-starry`);
        let key = "starry-theme-mode";
        let value = localStorage.getItem(key);
        this.config = {
            themeKey: key,
            themeValue: value,
            starryId: "starry",
            lockedScrollTopPoint: 0,
            locked: false
        };
        this.startTime = performance.now();
        this.search = new StarrySearch(this);
    }

    Starry.prototype.varConfiguration = {
        varProgressEnable: true,
        varStarCount: 200,
        varStarryEnable: true,
        varToolExpanded: true,
        varSiteBegin: "2019/09/15 19:57:09",
        varStatsServiceEnable: true,
        varStatsServiceUrl: "https://meethigher.top/census/count",
        varSearchIndex: "index.json"
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
        this.search.init();
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

    Starry.prototype.funcLockScrollTop = function () {
        if (!this.config.locked) {
            this.funcUtils.log(`body locked`, "Scroll Lock");
            this.config.locked = true;
            this.config.lockedScrollTopPoint = global.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${this.config.lockedScrollTopPoint}px`;
            document.body.style.width = "100%";
        }
    };

    Starry.prototype.funcUnlockScrollTop = function () {
        if (this.config.locked) {
            this.funcUtils.log(`body unlocked`, "Scroll Lock");
            this.config.locked = false;

            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";

            window.scrollTo(0, this.config.lockedScrollTopPoint);
        }
    };

    Starry.prototype.funcShowToast = function (toastId, duration = 1, message) {
        const toast = document.getElementById(toastId);
        if (!toast) {
            return;
        }
        if (toast.classList.contains("active")) {
            return;
        }
        if (message) {
            toast.querySelector("span").textContent = message;
        }
        toast.classList.add("active");
        setTimeout(function () {
            toast.classList.remove("active");
        }, duration * 1000);
    };


    Starry.prototype.funcShowModal = function (modalId) {
        const self = this;
        const modal = document.getElementById(modalId);
        if (!modal) {
            return;
        }
        if (modal.classList.contains("active")) {
            return;
        }
        modal.classList.add("active");

        const closeBtn = modal.querySelector("button");
        if (closeBtn) {
            closeBtn.onclick = function () {
                self.funcCloseModal(modalId);
            };
        }
        modal.onclick = function (e) {
            if (e.target === modal) {
                self.funcCloseModal(modalId);
            }
        };
        document.addEventListener("keydown", e => {
            if (e.key === "Escape") {
                self.funcCloseModal(modalId);
            }
        });

        self.funcLockScrollTop();
    };

    Starry.prototype.funcCloseModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            return;
        }
        modal.classList.remove("active");
        this.funcUnlockScrollTop();
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

    Starry.prototype.funcCopyText = function (text) {
        // 浏览器中，如果不是 https 或者 localhost 无法使用新版复制，所以做兼容
        return new Promise((resolve, reject) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                // 新版复制
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
            } else {
                // 老版复制
                const textarea = document.createElement("textarea");
                // 隐藏此输入框
                textarea.style.position = 'fixed';
                textarea.style.clip = 'rect(0 0 0 0)';
                textarea.style.top = '10px';

                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    const successful = document.execCommand("copy");
                    document.body.removeChild(textarea);
                    if (successful) {
                        resolve();
                    } else {
                        reject();
                    }
                } catch (err) {
                    document.body.removeChild(textarea);
                    reject(err);
                }
            }
        });
    };

    Starry.prototype.funcBindEvents = function () {
        const self = this;

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

        // 搜索按钮
        const searchBtn = document.getElementById("searchBtn");
        if (searchBtn) {
            const openSearch = () => {
                self.funcUtils.log("triggered", "Search Modal");
                self.funcShowModal("searchBtnModal");
                setTimeout(() => self.search.inputEl.focus(), 300);
            };

            searchBtn.addEventListener("click", openSearch);
            document.addEventListener("keydown", e => {
                if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
                    e.preventDefault();
                    openSearch();
                }
            });
        }

        // 返回顶部与返回底部
        const scrollToTop = document.getElementById("scrollToTop");
        const scrollToBottom = document.getElementById("scrollToBottom");
        if (scrollToTop && scrollToBottom) {
            let sttListener = () => {
                self.funcUtils.log(`triggered`, "Scroll to top");
                window.scrollTo({top: 0, behavior: "smooth"});
            };
            let stbListener = () => {
                self.funcUtils.log(`triggered`, "Scroll to bottom");
                window.scrollTo({top: document.documentElement.scrollHeight, behavior: "smooth"});
            };
            scrollToBottom.addEventListener("click", stbListener);
            scrollToTop.addEventListener("click", sttListener);
            let lastKey = "";
            let lastTime = 0;
            const interval = 300;

            document.addEventListener("keydown", e => {
                const key = e.key.toLowerCase();
                const now = Date.now();

                if (key === "t" || key === "b") {
                    if (lastKey === key && (now - lastTime) <= interval) {
                        if (key === "t") {
                            sttListener();
                        }
                        if (key === "b") {
                            stbListener();
                        }
                        lastKey = "";
                        return;
                    }
                    lastKey = key;
                    lastTime = now;
                } else {
                    lastKey = "";
                }
            });
        }


        // 侧边工具栏展开/收起
        let toolMenuSwitcher = document.getElementById("toolMenuSwitcher");
        let sidebarTools = document.getElementById("sidebarTools");
        if (toolMenuSwitcher && sidebarTools) {
            toolMenuSwitcher.addEventListener("click", () => {
                sidebarTools.setAttribute("aria-expanded", String(!this.varConfiguration.varToolExpanded));
                this.varConfiguration.varToolExpanded = !this.varConfiguration.varToolExpanded;
                self.funcUtils.log(`expanded=${self.varConfiguration.varToolExpanded}`, "Sidebar tools");
            });
        }

        // 跳转进度条
        document.querySelectorAll("a").forEach(a => {
            a.addEventListener("click", e => {
                const href = a.getAttribute("href");
                const target = a.getAttribute("target");
                if (href && !href.startsWith("#") && target !== "_blank" && self.varConfiguration.varProgressEnable) {
                    e.preventDefault();
                    self.funcStartProgress(href);
                    self.funcUtils.log(`triggered`, "Progress");
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
        if (this.varConfiguration.varStatsServiceEnable) {
            const statsValue = document.getElementById("statsValue");
            this.funcGetStats(this.varConfiguration.varStatsServiceUrl,
                window.location.href.replace(/http:\/\/|https:\/\//, ""), function (err, data) {
                    if (!err && statsValue) {
                        statsValue.innerText = data;
                        self.funcUtils.log("success", "Stats");
                    } else {
                        self.funcUtils.error("error", "Stats");
                    }
                });
        }

        // 分享按钮
        let shareBtn = document.getElementById("shareBtn");
        if (shareBtn) {
            shareBtn.addEventListener("click", e => {
                self.funcUtils.log("triggered", "Share");
                self.funcCopyText(`${document.title}: ${window.location.href}`)
                    .then(function () {
                        self.funcShowToast("shareBtnToastSuccess");
                    })
                    .catch(function () {
                        self.funcShowToast("shareBtnToastError");
                    });
            });
        }

        // 打赏按钮
        let rewardBtn = document.getElementById("rewardBtn");
        if (rewardBtn) {
            rewardBtn.addEventListener("click", e => {
                self.funcUtils.log("triggered", "Reward");
                this.funcShowModal("rewardBtnModal");
            });
        }

        // taxonomy 排序
        const sortSelect = document.getElementById("taxonomySort");
        const termContainer = document.getElementById("taxonomyTerm");
        if (sortSelect && termContainer) {
            const originalCards = Array.from(termContainer.children);
            sortSelect.addEventListener("change", function () {
                const cardList = [...originalCards];
                if (this.value === "nameAsc") {
                    self.funcUtils.log(`taxonomy triggered nameAsc=true`, "Sort");
                    cardList.sort((a, b) => {
                        const nA = a.querySelector(".tag-name").textContent.trim();
                        const nB = b.querySelector(".tag-name").textContent.trim();
                        return nA.localeCompare(nB, navigator.language, {sensitivity: "base"});
                    });
                } else {
                    self.funcUtils.log(`taxonomy triggered nameAsc=false`, "Sort");
                    cardList.sort((a, b) => {
                        const cA = parseInt(a.querySelector(".tag-count").textContent);
                        const cB = parseInt(b.querySelector(".tag-count").textContent);
                        return cB - cA;
                    });
                }
                const fragment = document.createDocumentFragment();
                cardList.forEach(c => fragment.appendChild(c));
                termContainer.innerHTML = "";
                termContainer.appendChild(fragment);
            });
        }

        // section 排序
        const secSortSelect = document.getElementById("sectionSort");
        const secTermContainer = document.getElementById("sectionTerm");
        if (secSortSelect && secTermContainer) {
            const originalCards = Array.from(secTermContainer.children);
            secSortSelect.addEventListener("change", function () {
                self.funcUtils.log(`section triggered timeAsc=${this.value === "timeAsc"}`, "Sort");
                const cardList = [...originalCards];
                cardList.sort((a, b) => {
                    const tA = new Date(a.querySelector(".section-time").textContent.trim()).getTime();
                    const tB = new Date(b.querySelector(".section-time").textContent.trim()).getTime();
                    return this.value === "timeAsc" ? tA - tB : tB - tA;
                });
                const fragment = document.createDocumentFragment();
                cardList.forEach(c => fragment.appendChild(c));
                secTermContainer.innerHTML = "";
                secTermContainer.appendChild(fragment);
            });
        }

        // 代码块复制按钮
        document.querySelectorAll(".code-copy").forEach(btn => {
            btn.addEventListener("click", e => {
                const codeBlock = btn.closest(".code-block");
                if (!codeBlock) {
                    self.funcUtils.error(".code-block container not found", "Code copy");
                    return;
                }

                self.funcUtils.log("triggered", "Code copy");

                // 判断 hugo 生成的代码块使用的是带行号还是不带行号
                const code = codeBlock.querySelector(".code-block-content td:last-child code");
                if (code) {
                    // 带行号
                    self.funcUtils.log("Detected code block with line numbers", "Code copy");
                    const text = code.textContent.trim();
                    self.funcCopyText(text)
                        .then(function () {
                            self.funcShowToast("codeCopyToastSuccess");
                        })
                        .catch(function () {
                            self.funcShowToast("codeCopyToastError");
                        });
                } else {
                    const noLineCode = codeBlock.querySelector(".code-block-content code");
                    if (noLineCode) {
                        // 不带行号
                        self.funcUtils.log("Detected code block without line numbers", "Code copy");

                        const text = noLineCode.textContent.trim();
                        self.funcCopyText(text)
                            .then(function () {
                                self.funcShowToast("codeCopyToastSuccess");
                            })
                            .catch(function () {
                                self.funcShowToast("codeCopyToastError");
                            });
                    } else {
                        // 不符合预期格式
                        self.funcUtils.error(
                            "Expected code block DOM structure not detected", "Code copy"
                        );
                    }
                }
            });
        });
        // 图片查看器
        let postImgs = document.querySelector(".single-post");
        if (postImgs) {
            new Viewer(postImgs, {
                show() {
                    self.funcUtils.log("open", "Image Viewer");
                    self.funcLockScrollTop();
                },
                hide() {
                    self.funcUtils.log("close", "Image Viewer");
                    self.funcUnlockScrollTop();
                },
                zIndex: 10000,
                url: "data-src", // 查看器只给带有 src 的 img 添加监听。如果不通过 src 指定图片源的话，就需要额外使用该参数配置
                button: true,
                title: true,
                navbar: false,
                inline: false,
                container: document.querySelector(".main-container"), // 将 viewer 的 dom 放置到该容器下。不配置的话默认是body
                toolbar: {
                    zoomIn: false,
                    zoomOut: false,
                    oneToOne: false,
                    reset: true,
                    prev: true,
                    play: false,
                    next: true,
                    rotateLeft: true,
                    rotateRight: true,
                    flipHorizontal: true,
                    flipVertical: true
                }
            });
        }

        // 图片懒加载
        self.imgObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }
                const box = entry.target;
                const img = box.querySelector("img");
                const t0 = performance.now();
                img.src = img.dataset.src;
                img.onload = () => {
                    box.classList.remove("loading");
                    box.classList.add("loaded");
                    this.funcUtils.log(`${img.src} loaded ${(performance.now() - t0).toFixed(2)} ms`, "Image");

                    // 更新图片查看器。因为查看器只给带有 src 的 img 添加监听
                    // viewer.update();
                };
                self.imgObserver.unobserve(box);
            });
        }, {
            // 把视口上下左右都“扩大”指定距离，用于提前加载图片
            rootMargin: "100px"
        });
        document.querySelectorAll(".img-box").forEach(box => {
            self.imgObserver.observe(box);
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
        log: function (msg, type) {
            const timestamp = this.formatTime();
            if (type) {
                console.log(`[Starry] [${timestamp}] [${type}]`, msg);
            } else {
                console.log(`[Starry] [${timestamp}]`, msg);
            }
        },
        error: function (msg, type) {
            const timestamp = this.formatTime();
            if (type) {
                console.error(`[Starry] [${timestamp}] [${type}]`, msg);
            } else {
                console.error(`[Starry] [${timestamp}]`, msg);
            }
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
