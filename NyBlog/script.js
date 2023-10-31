import paramNames from "./paramNames.js";

// Funktion til at hente gemte opskrifter fra LocalStorage
function hentGemteOpskrifter() {
    const gemteOpskrifter = JSON.parse(localStorage.getItem('opskrifter')) || [];
    return gemteOpskrifter;
}

// Funktion til at gemme opskrifter i LocalStorage
function gemOpskrifter(opskrifter) {
    localStorage.setItem('opskrifter', JSON.stringify(opskrifter));
    alleNøgleord();
}


// Funktion til at vise de gemte opskrifter som kort
function visGemteOpskrifter() {
    const opskrifterSektion = document.getElementById('opskrifter');
    const gemteOpskrifter = hentGemteOpskrifter();
    opskrifterSektion.innerHTML = "";

    gemteOpskrifter.forEach((opskrift, index) => {
        const opskriftElement = document.createElement('article');
        opskriftElement.classList.add('opskrift');
        const nøgleordListeStreng = opskrift.nøgleord.reduce((p, c) => p + `<li contenteditable="false" class="nøgleord">${c}</li>`, "");


        let ingredienserListeStreng = '';

        if (typeof opskrift.ingredienser === 'string') {
            const ingredienserSentences = opskrift.ingredienser.split("-").map(item => item.trim());
            const filteredSentences = ingredienserSentences.filter(sentence => sentence !== "");
            ingredienserListeStreng = filteredSentences.map(sentence => `<li contenteditable="false">${sentence}</li>`).join("");
       
        } else if (Array.isArray(opskrift.ingredienser)) {
            const filteredIngredients = opskrift.ingredienser.filter(item => item !== "");
            ingredienserListeStreng = filteredIngredients.map(item => `<li contenteditable="false">${item}</li>`).join("");
        }
        
        let fremgangsmadeListeStreng = '';

        if (typeof opskrift.fremgangsmade === 'string') {
            const fremgangsmadeSentences = opskrift.fremgangsmade.split("-").map(item => item.trim());
            const filteredSentences = fremgangsmadeSentences.filter(sentence => sentence !== "");
            fremgangsmadeListeStreng = filteredSentences.map((sentence, count) => `<li contenteditable="false">${sentence}</li>`).join("");
        
        } else if (Array.isArray(opskrift.fremgangsmade)) {
            const filteredfremgangsmade = opskrift.fremgangsmade.filter(item => item !== "");
            fremgangsmadeListeStreng = filteredfremgangsmade.map(item => `<li contenteditable="false">${item}</li>`).join("");
        }

        opskriftElement.innerHTML = `
        <h2 id="h2-${index}" contenteditable="false">${opskrift.titel}</h2>
        <img class = "recipe-${index}" display="hidden">
        <article id="article-${index}" class="opskrift">
            <a href="recipe.html?${paramNames.recipe}=${index}">${opskrift.titel}</a>
            <strong>Ingredienser:</strong>
            <ul class="ingrediensListe">
                ${ingredienserListeStreng}
            </ul>
    
            <strong>Fremgangsmåde:</strong>
            <ol class="fremgangsmådeListe">
                ${fremgangsmadeListeStreng}
            </ol> 
    
            <strong>Kommentar:</strong>
            <p contenteditable="false">${opskrift.kommentar}</p>
    
            <strong>Nøgleord:</strong>
            <ul class="nøgleordListe">
                ${nøgleordListeStreng}
            </ul>
            
            <div class="keyword-button-container">
                <button id="add-${index}" class="add-keyword-button">+</button>
            </div>
        </article>
        <button id="edit-btn-${index}")>Rediger</button>
        <button id="slet-btn-${index}">Slet</button>
        `   
        opskrifterSektion.appendChild(opskriftElement);
        document.getElementById("add-"+index).addEventListener("click", () => addKeyword(index))
        document.getElementById("edit-btn-"+index).addEventListener("click", () => redigerOpskrift(index))
        document.getElementById("slet-btn-"+index).addEventListener("click", () => sletOpskrift(index))
    });
}

// visning af gemte opskrifter
visGemteOpskrifter();

// JavaScript til at håndtere indsendelse af opskriftsformularen / inputs
const opskriftsform = document.getElementById('opskriftsform');

opskriftsform.addEventListener('submit', function (e) {
    e.preventDefault();
    const gemteOpskrifter = JSON.parse(localStorage.getItem('opskrifter')) || [];
    const titel = document.getElementById('titel').value;
    const ingredienser = document.getElementById('ingredienser').value;
    const fremgangsmade = document.getElementById('fremgangsmade').value;
    const kommentar = document.getElementById('kommentar').value;
    const nøgleord = document.getElementById('nøgleord').value;
    const ord = nøgleord.split(",").map(item => item.trim());
    
    const ingrediensArray = ingredienser.split("-").map(item => item.trim());
    const fremgangsmådeArray = fremgangsmade.split("-").map(item => item.trim());

    const file = document.getElementById('recipeImgButton').files[0];
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
      
      const nyOpskrift = {
        id: paramNames.recipe,
        titel: titel,
        ingredienser: ingrediensArray,
        fremgangsmade: fremgangsmådeArray,
        kommentar: kommentar,
        nøgleord: ord,
        img: base64String
     };

     gemteOpskrifter.push(nyOpskrift);
     gemOpskrifter(gemteOpskrifter);
     visGemteOpskrifter();
     
    };
    
    reader.readAsDataURL(file);
    opskriftsform.reset();


});

function handleKeywordInput(event) {
    // Allow users to press Enter to save the keyword
    if (event.key === 'Enter') {
        event.preventDefault();
        saveKeyword(this.parentElement.parentElement.getAttribute("id").split("-")[1], this);
    }
}

function saveKeyword(index, keywordElement) {
    const gemteOpskrifter = hentGemteOpskrifter();
    const opskrift = gemteOpskrifter[index];
    const newKeyword = keywordElement.textContent.trim();

    if (newKeyword !== "") {
        opskrift.nøgleord.push(newKeyword);
        gemteOpskrifter[index] = opskrift;
        gemOpskrifter(gemteOpskrifter);
        visGemteOpskrifter();
        alleNøgleord();
    }

    // Remove the contenteditable attribute after saving
    keywordElement.contentEditable = "false";
}

// ---------- Funktion til at slette en opskrift ----------
function sletOpskrift(index) {
    if (confirm('Er du sikker på, at du vil slette denne opskrift?')) {
        const gemteOpskrifter = hentGemteOpskrifter();
        gemteOpskrifter.splice(index, 1);
        gemOpskrifter(gemteOpskrifter);
        visGemteOpskrifter();
        alleNøgleord();
    }
    updateFilterFormKeywords();
}

function redigerOpskrift(index) {
    const gemteOpskrifter = hentGemteOpskrifter();
    const opskrift = gemteOpskrifter[index];
    const articleElement = document.getElementById(`article-${index}`);
    const headingElement = document.getElementById(`h2-${index}`);
    const editButton = document.getElementById(`edit-btn-${index}`);
    const ingredienserNodeList = Array.from(articleElement.querySelectorAll('.ingrediensListe')[0].children);
    const nøgleordNodeList = Array.from(articleElement.querySelectorAll('.nøgleordListe')[0].children);
    const fremgangsmådeNodeList = Array.from(articleElement.querySelectorAll('.fremgangsmådeListe')[0].children);
    const nonBoldElements = articleElement.querySelectorAll('p:not(:has(strong))');

    nonBoldElements.forEach(element => {
        element.contentEditable = !element.isContentEditable;
    });

    nøgleordNodeList.forEach(element => {
        element.contentEditable = !element.isContentEditable;
    });

    ingredienserNodeList.forEach(item => {
        item.contentEditable = !item.isContentEditable;
    });

    fremgangsmådeNodeList.forEach(item => {
        item.contentEditable = !item.isContentEditable;
    });

    headingElement.contentEditable = !headingElement.isContentEditable;

    if (headingElement.isContentEditable) {
        editButton.textContent = "Gem ændringer";
    } else {
        // Update the fields in the opskrift object
        opskrift.ingredienser = Array.from(ingredienserNodeList).map(li => li.textContent.trim()).filter(item => item !== "");
        opskrift.fremgangsmade = Array.from(fremgangsmådeNodeList).map(li => li.textContent.trim()).filter(item => item !== "");
        opskrift.kommentar = nonBoldElements[0].textContent;
        opskrift.titel = headingElement.textContent;

        const nøgleordList = articleElement.querySelectorAll('.nøgleord');
        const nøgleordArray = Array.from(nøgleordList).map(li => li.textContent.trim());
        opskrift.nøgleord = nøgleordArray;

        editButton.textContent = "Rediger";
        gemteOpskrifter[index] = opskrift;
        console.log(gemteOpskrifter);
        gemOpskrifter(gemteOpskrifter);
        updateFilterFormKeywords();
    }
}

// ---------- hent søgefelt og filterknap ----------
const searchInput = document.getElementById('search-input');
const filterButton = document.getElementById('filter-button');

// ---------- søgefunktion ----------
function filterArticles() {
    const searchTerm = searchInput.value.toLowerCase();
    const articles = document.querySelectorAll('.opskrift');
    articles.forEach(article => {
        const titleElement = article.querySelector('h2');
        const ingredientsElement = article.querySelector('p');
        const instructionsElements = article.querySelectorAll('p');
        const nøgleElement = article.querySelectorAll('li');

        const title = titleElement ? titleElement.textContent.toLowerCase() : '';
        const ingredients = ingredientsElement ? ingredientsElement.textContent.toLowerCase() : '';
        const instructions = instructionsElements.length > 1 ? instructionsElements[1].textContent.toLowerCase() : '';
        const kommentar = instructionsElements.length > 2 ? instructionsElements[2].textContent.toLowerCase() : '';
        const nøgleordList = Array.from(nøgleElement).map(li => li.textContent.toLowerCase().trim());
        const nøgleord = nøgleordList.join(', ');

        if (title.includes(searchTerm) || ingredients.includes(searchTerm) || instructions.includes(searchTerm) || kommentar.includes(searchTerm) || nøgleord.includes(searchTerm)) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    });
}
searchInput.addEventListener('input', filterArticles);

// ---------- Funktion til at filtrere artikler ----------
function filter() {
    const nøgleordCheckboxes = document.querySelectorAll('#filterForm-aktiv input:checked'); // Get checked checkboxes
    const articles = document.querySelectorAll('.opskrift');

    if (nøgleordCheckboxes.length === 0) {
        articles.forEach(article => {
            article.style.display = 'block';
        });
        return;
    }

    articles.forEach(article => {
        const nøgleordList = article.querySelectorAll('li');
        let showArticle = false;

        nøgleordList.forEach(nøgleord => {
            const nøgleordText = nøgleord.textContent.toLowerCase();
            if (Array.from(nøgleordCheckboxes).some(checkbox => checkbox.name === nøgleordText)) {
                showArticle = true;
            }
        });

        if (showArticle) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    });
}

filterButton.addEventListener('click', filter);
window.addEventListener('change', filter);

function updateFilterFormKeywords() {
    const nøgleordCheckboxes = document.querySelectorAll('#filterForm-aktiv input');
    const keywordsInFilterForm = Array.from(nøgleordCheckboxes).map(checkbox => checkbox.name);

    const keywordsInRecipes = new Set();

    const articles = document.querySelectorAll('.opskrift');
    articles.forEach(article => {
        const nøgleordList = article.querySelectorAll('li');
        nøgleordList.forEach(nøgleord => {
            const nøgleordText = nøgleord.textContent.toLowerCase().trim();
            keywordsInRecipes.add(nøgleordText);
        });
    });

    const keywordsToRemove = keywordsInFilterForm.filter(keyword => !keywordsInRecipes.has(keyword));

    keywordsToRemove.forEach(keyword => {
        const checkboxToRemove = document.getElementById(keyword);
        if (checkboxToRemove) {
            checkboxToRemove.remove();
        }
    });
}

window.addEventListener('load', updateFilterFormKeywords);

let unikkeNøgleord = new Set();

function alleNøgleord() {
    const nøgleordList = document.querySelectorAll('.opskrift .nøgleord');
    nøgleordList.forEach(li => {
        const nøgleord = li.textContent.toLowerCase().trim();
        unikkeNøgleord.add(nøgleord);
    });
    updateFilterFormKeywords();
}

// Tilføj nøgleord
function addKeyword(index) {
    const gemteOpskrifter = hentGemteOpskrifter();
    console.log(gemteOpskrifter);
    console.log(index);
    const opskrift = gemteOpskrifter[index];
    console.log(opskrift);
    for (let item in opskrift) {
        console.log(item)
    }

    const newKeyword = "New Keyword";
    opskrift.nøgleord.push(newKeyword);

    // Upload og gem opskrifter
    gemteOpskrifter[index] = opskrift;
    gemOpskrifter(gemteOpskrifter);
    visGemteOpskrifter();
    alleNøgleord();

    // Rediger 
    const nøgleordListe = document.querySelectorAll(`#article-${index} .nøgleord`);
    const newKeywordIndex = nøgleordListe.length - 1;
    const newKeywordElement = nøgleordListe[newKeywordIndex];
    newKeywordElement.contentEditable = true;
    newKeywordElement.focus();
    document.execCommand('selectAll');
}

alleNøgleord();

const filterForm = document.getElementById('filterForm');

filterButton.addEventListener('click', () => {
    filterForm.innerHTML = '';

    unikkeNøgleord.forEach(keyword => {
        const nøgleordCheckbox = document.createElement('input');
        const nøgleordLabel = document.createElement('label');

        nøgleordCheckbox.checked = false;
        nøgleordCheckbox.type = 'checkbox';
        nøgleordCheckbox.name = `${keyword}`;
        nøgleordCheckbox.id = `${keyword}`;

        nøgleordLabel.setAttribute('for', `${keyword}`);
        nøgleordLabel.textContent = `${keyword}`;

        filterForm.appendChild(nøgleordCheckbox);
        filterForm.appendChild(nøgleordLabel);
    });

    if (filterForm.id === 'filterForm') {
        filterForm.id = 'filterForm-aktiv';
    } else {
        filterForm.id = 'filterForm';
    }
});



visGemteOpskrifter();