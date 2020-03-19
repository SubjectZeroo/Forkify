// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipes';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView'

import {
    elements,
    renderLoader,
    clearLoader
} from './views/base'


/**Global state of the app
 * Search object
 * current recipe object
 * shoping list object
 * liked recipes
 */
const state = {}
// window.state = state;

const controlSearch = async () => {
    //1 obtener el query de la busqueda
    const query = searchView.getInput();

    // const query = 'pizza';
    // console.log(query)

    if (query) {
        //2 Nuevo objeto busqueda y lo agrego al estado
        state.search = new Search(query);

        //3 preparar la UI para los resultados
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        //4 buscar las recetas

        try {
            await state.search.getResult();
            // 5 Renderizar resultador en la UI
            // console.log(state.search.result)
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('some worn with the search');
            clearLoader();
        }


    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});




elements.searchResPage.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')

    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        console.log(goToPage)
    }
})

// const search = new Search('pizza');
// console.log(search);

// search.getResult();


/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {

    //obtenemos id from url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        // Preparamos ui para los cambios
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight  selected search iteme

        if(state.search) searchView.highlightSelected(id);
        //creamos nuevo ojbjeto recipe
        state.recipe = new Recipe(id);

       
        try {
            //obtenemos losdatos
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //calculamos persona y tiempo
            state.recipe.calcTime();
            state.recipe.calcServings();
            //renderizamos recipe
            console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(
                state.recipe, 
                state.likes.isLiked(id)    
            );

        } catch (error) {
            alert('error procesing recipe');
            console.log(error);
        }

    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));






// List Controller

const controlList = () => {
    //Creamos una nueva lista si todavia no lo esta

    if(!state.list) state.list = new List();

    // Agregar ingrediente a la lista y en la ui
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}




//handling delete and updatee list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle the delete button

    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);
        //delete from ui
        listView.deleteItem(id);
        //handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});



/**
 * LIKE CONTROLLER
 */


const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    //User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)) {
        //add like to the state
        const newLike = state.likes.addLike(          
                currentID,
                state.recipe.title,
                state.recipe.author,
                state.recipe.img           
        );
        
        //toggle the like button
            likesView.toggleLikeBtn(true);
        //add like to ui list
            console.log(state.likes)
            likesView.renderLike(newLike);
        //user has current recipe
    } else {

        //remove like from the state
        state.likes.deleteLike(currentID);
        //togle the line button
        likesView.toggleLikeBtn(false);
        //remove like from ui list
        likesView.deleteLike(currentID);
        console.log(state.likes)
    }
    likesView.toggleLikeMenu(state.likes.getNumbLikes());
};


//restore liked recipes on page load

window.addEventListener('load', () => {
    state.likes = new Likes();
    //restore likes
    state.likes.readStorage();

    //toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumbLikes());

    //render the existing likes

    state.likes.likes.forEach(like => likesView.renderLike(like));
})

//handlin recipe button click
elements.recipe.addEventListener('click', e => {

    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrease butti us clicked 
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // decrease button is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //add ingredients to shoppin list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //like controller
        controlLike();
    }
 
});

// const l = new List();

// window.l = new List();