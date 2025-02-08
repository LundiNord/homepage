//JS for leonbruns.de

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateButtonText(newTheme);
}

function detectSystemTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
        updateButtonText(savedTheme);
    } else {
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = prefersDarkScheme ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        updateButtonText(theme);
    }
}

function updateButtonText(theme) {
    const button = document.querySelector(".theme-toggle");
    button.textContent = theme === "dark" ? "White Mode" : "Dark Mode";
}

document.querySelector(".theme-toggle").addEventListener("click", toggleTheme);

detectSystemTheme();
