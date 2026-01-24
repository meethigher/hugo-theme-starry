(function () {
    const THEME_KEY = "starry-theme-mode";
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme) {
        document.documentElement.setAttribute(THEME_KEY, savedTheme);
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute(
            THEME_KEY,
            prefersDark ? "dark" : "light"
        );
        localStorage.setItem(THEME_KEY, prefersDark ? "dark" : "light");
    }
})();