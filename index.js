//JS for leonbruns.de

let language = window.navigator.language;
let langData = {};

//Theme Switcher
export function toggleTheme() {
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


//search:
//get input
//loop through all HTML files
//find text matching search
//go up until next linkable element
//return a link to the element

const search = document.getElementById('search');
const searchResults = document.getElementById('search-results');

search.addEventListener('keyup', function() {
    const query = search.value.toLowerCase();
    if (query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }
    fulltextSearch(query).then(results => {
        // Clear previous results
        searchResults.innerHTML = '';
        //remove duplicates
        results = results.filter((result, index, self) =>
            index === self.findIndex((t) => (
                t.url === result.url
            ))
        );
        // Display results
        if (results.length === 0) {
            searchResults.style.display = 'none';
        } else {
            searchResults.style.display = 'block';
        }
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (i !== 0) {
                const separator = document.createElement('div');
                separator.innerHTML = `------------`;
                searchResults.appendChild(separator);
            }
            const resultElement = document.createElement('div');
            resultElement.innerHTML = `<a href="${result.url}">${result.text}</a>`;
            searchResults.appendChild(resultElement);
        }
    });
    umami.track("Search", { event_name: "Search", search_data: query });
});

// Search for input string in all HTML files
async function fulltextSearch(input) {
    const pages = ['/hiking/sweden2024.html', '/hiking/norwaySweden2023.html', '/hiking/mapViewer.html', '/hiking.html',
        '/index.html', '/privacy.html'];
    let results = [];
    for (const page of pages) {
        try {
            const response = await fetch(page);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // Search through all HTML nodes with text
            const pageResults = await recursiveSearch(doc.getRootNode(), input, page);
            results = results.concat(pageResults);
        } catch (error) {
            console.error(`Error searching ${page}:`, error);
        }
    }
    return results;
}

async function recursiveSearch(node, input, page) {
    let results = [];
    let textContent = "";
    try {
        textContent = node.childNodes[0].nodeValue; //only get text from this node
    } catch (error) {
        textContent = node.textContent;
    }
    if (textContent && textContent.toLowerCase().includes(input)) {
        let current = node;
        while (current && !current.id) {        // Find a parent element with id
            if (current.parentNode === null) {  // Return root node
                results.push({
                    id: "",
                    url: `${page}`,
                    text: textContent.trim()
                });
                break;
            }
            current = current.parentNode;
        }
        if (current && current.id) {            // Node with id found
            results.push({
                id: current.id,
                url: `${page}#${current.id}`,
                text: textContent.trim()
            });
        }
    }
    // Process child nodes
    if (node.childNodes && node.childNodes.length > 0) {
        for (const child of node.childNodes) {
            if (child.nodeName.toLowerCase() !== 'script') {
                const childResults = await recursiveSearch(child, input, page);
                results = results.concat(childResults);
            }
        }
    }
    return results;
}
