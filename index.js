//JS for leonbruns.de

let language = window.navigator.language;
let langData = {};

//Theme Switcher
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateButtonText(newTheme);
    umami.track('Theme switch');
}
//window.toggleTheme = toggleTheme; // Make the function globally accessible
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
   if (Object.keys(langData).length !== 0) {    //check if langData is not empty
        button.textContent = theme === "dark" ? langData["light_mode"] : langData["dark_mode"];
    } else {
        button.textContent = theme === "dark" ? "White Mode" : "Dark Mode";
    }
}
document.querySelector(".theme-toggle").addEventListener("click", toggleTheme);
detectSystemTheme();

//Localization
function updateContent(langData) {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        element.innerHTML = langData[key];
    });
}
async function fetchLanguageData(lang) {
    const response = await fetch(`languages/${lang}.json`);
    return response.json();
}
async function changeLanguage() {
    if (language === 'de-DE' || language === 'de') {
        langData = await fetchLanguageData('de');
        updateContent(langData);
        umami.track('Changed language to German');
        //alert(language);
    }
}
changeLanguage();
