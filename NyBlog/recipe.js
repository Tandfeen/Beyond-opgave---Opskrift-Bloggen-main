import paramNames from "./paramNames.js"
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeIndex = parseInt(urlParams.get(paramNames.recipe));

    const gemteOpskrifter = JSON.parse(localStorage.getItem('opskrifter')) || [];

    if (!isNaN(recipeIndex) && recipeIndex >= 0 && recipeIndex < gemteOpskrifter.length) {

        const recipe = gemteOpskrifter[recipeIndex];
        console.log(gemteOpskrifter[recipeIndex]);

        const recipeContainer = document.createElement('div');
        recipeContainer.classList.add('recipeContainer');
        const title = recipe.titel;
        const ingredients = recipe.ingredienser.filter(item => item.trim() !== '');
        const process = recipe.fremgangsmade.filter(item => item.trim() !== '');
        const keywords = recipe.nøgleord.filter(item => item.trim() !== '');
        const comment = recipe.kommentar;
        const image = new Image()
        image.src = `data:image/jpg;base64, ${recipe.img}`

        recipeContainer.innerHTML = `
        <img class="bgImage" id="recipeImage" src="${image.src}" alt="${title}">
        <div class="recipeCard">
        <h1 class="recipeTitle">${title}</h1>
        <h2 class="ingredientsTitle">Ingredienser</h2>
        <ul class="recipeIngredients">${ingredients.reduce((p, c) => p + `<li contenteditable="false" class="recipeIngredients">${c}</li>`, '')}</ul>
        <h2 class="processTitle">Fremgangsmåde</h2>
        <ol class="recipeProcess">${process.reduce((p, c) => p + `<li contenteditable="false" class="recipeProcess">${c}</li>`, '')}</ol>
        <h2 class="commentTitle">Kommentar</h2>
        <p class="recipeComment">${comment}</p>
        <h2 class="keywordsTitle">Nøgleord</h2>
        <ul class="recipeKeyword">${keywords.reduce((p, c) => p + `<li contenteditable="false" class="recipeKeywords">${c}</li>`, '')}</ul>
        </div>
        `
        document.body.appendChild(recipeContainer);
    } else {
        console.log("Recipe not found or invalid recipe index.");
    }


});
