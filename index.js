//JS for leonbruns.de

//----------------------------- Localization -----------------------------------

let language = window.navigator.language;
let langData = {};

function updateContent(langData) {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        element.innerHTML = langData[key];
    });
}
async function fetchLanguageData(lang) {
    const response = await fetch(`/languages/${lang}.json`);
    return response.json();
}
async function changeLanguage() {
    if (language === 'de-DE' || language === 'de') {
        langData = await fetchLanguageData('de');
        updateContent(langData);
        umami.track('Changed language to German');
    }
}
changeLanguage();

//----------------------------- Dark Mode -----------------------------------

//Theme Switcher
export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateButtonText(newTheme);
    umami.track('Theme switch');
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
    if (Object.keys(langData).length !== 0) {    //check if langData is not empty
        button.textContent = theme === "dark" ? langData["light_mode"] : langData["dark_mode"];
    } else {
        button.textContent = theme === "dark" ? "White Mode" : "Dark Mode";
    }
}
document.querySelector(".theme-toggle").addEventListener("click", toggleTheme);
detectSystemTheme();

//----------------------------- Search -----------------------------------

//search:
//get input
//loop through all HTML files
//find text matching search
//go up until next linkable element
//return a link to the element

const search = document.getElementById('search') || null;
const searchResults = document.getElementById('search-results') || null;

try {
    search.addEventListener('keyup', function() {
        searchAndDisplay();
    });
    search.addEventListener('blur', function() {
        searchResults.style.display = 'none';
    });
    search.addEventListener('focus', function() {
        if (searchResults.innerHTML !== '') {
            searchResults.style.display = 'block';
        }
    });
} catch {
    console.log('Search not available');}

async function searchAndDisplay() {
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
                   t.text === result.text && t.url === result.url
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
    umami.track("Search", {search_data: query });
}
const searchablePages = []  //Array of [document:HTML tree, page:String] pairs
async function fetchPage() {
    const pages = ['/hiking/sweden2024.html', '/hiking/norwaySweden2023.html', '/hiking/mapViewer.html',
        '/hiking.html', '/index.html', '/privacy.html', '/hiking/norway2021.html'];
    for (const page of pages) {
        try {
            const response = await fetch(page);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            searchablePages.push([doc, page]);
        } catch (error) {
            console.error(`Error parsing ${page}:`, error);
        }
    }
}
async function fulltextSearch(input) {  // Search for input string in all HTML files
    if (searchablePages.length === 0) {
        await fetchPage();
    }
    let results = [];
    for (const pair of searchablePages) {   //[document:HTML tree, page:String] pairs
        try {       // Search through all HTML nodes with text
            const pageResults = await recursiveSearch(pair[0].getRootNode(), input, pair[1]);
            results = results.concat(pageResults);
        } catch (error) {
            console.error(`Error searching ${pair[1]}:`, error);
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
        let found = false;
        while (current && !current.id && !found) {        // Find a parent element with id
            if (current.parentNode === null) {  // Return root node
                results.push({
                    id: "",
                    url: `${page}`,
                    text: textContent.trim()
                });
                found = true;
                break;
            }
            //check all items on the same level for id
            let lastResult = null;
            for (const sibling of current.parentNode.childNodes) {
                if(sibling === current) {break;}
                if (sibling.id) {
                    lastResult = {
                        id: sibling.id,
                        url: `${page}#${sibling.id}`,
                        text: textContent.trim()
                    }
                }
            }
            if (lastResult) {
                results.push(lastResult);
                found = true;
                break;
            }
            //walk up the tree
            current = current.parentNode;
        }
        if (current && current.id && !found) {            // Node with id found
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
