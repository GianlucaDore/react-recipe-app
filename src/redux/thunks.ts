import { createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase/auth/firebase";
import { collection, doc, endAt, getCountFromServer, getDoc, getDocs, orderBy, query, startAt } from "firebase/firestore";
import { Recipe, RecipeDetails } from "./storetypes";
import { RootState } from "./store";

/* 
export const fetchRecipes = createAsyncThunk('recipe/fetchRecipes',
    async () => {
        const docsRef = collection(db, "Recipes");
        const docsSnap = await getDocs(docsRef);

        if (!docsSnap.empty) {
            // We create an Array<Recipe> from the data fetched from the Firestore.
            const arrayOfRecipes = docsSnap.docs.map((document) => {
                return {
                    id: document.data().id,
                    title: document.data().title,
                    ingredients: document.data().ingredients,
                    preparation: document.data().preparation,
                    chef: document.data().chef
                } as Recipe;
            });

            return arrayOfRecipes;
        }

        else {
            throw new Error('No data in Recipes.');
        }
    }
);
*/

export const fetchTotalNumberOfPagesInHome = createAsyncThunk('recipe/fetchTotalNumberOfPagesInHome',
    async (_, { getState }) => {
        const itemsPerPage = (getState() as RootState).recipe.recipesPerPage;

        const collectionRecipes = collection(db, "Recipes");
        const collectionRecipesSnapshot = await getCountFromServer(collectionRecipes);
        const numberOfRecipesInTheCollection = collectionRecipesSnapshot.data().count;

        return Math.ceil(numberOfRecipesInTheCollection / itemsPerPage);
    }
)

export const fetchRecipesBatch = createAsyncThunk('recipe/fetchRecipesBatch',
    async (number: number, { getState }) => {
        const itemsPerPage = (getState() as RootState).recipe.recipesPerPage;
        const recipesDisplayed = [];
        let recipeRef, recipeSnap;

        for (let i = (number * itemsPerPage - itemsPerPage + 1); i <= number * itemsPerPage; i++) {
            recipeRef = doc(db, "Recipes", i.toString());
            recipeSnap = await getDoc(recipeRef);

            try {
                let recipeData = recipeSnap.data();
                if (recipeData) {
                    let recipeObject = <Recipe>{
                        id: Number.parseInt(recipeSnap.id),
                        title: recipeData.title,
                        ingredients: recipeData.ingredients,
                        preparation: recipeData.preparation,
                        chef: recipeData.chef
                    }
                    recipesDisplayed.push(recipeObject);
                }
                else throw new Error("Can't retrieve the recipe item n°" + i.toString());
            }
            catch (error) {
                console.error("Error retrieving item of batch n°" + i.toString() + " : " + error);
            }
        }

        return recipesDisplayed;
    }
)

export const fetchSingleRecipe = createAsyncThunk('recipe/fetchSingleRecipe',
    async (recipeId: string) => {
        const singleRecipeRef = doc(db, "Recipes", recipeId);
        const singleRecipeSnap = await getDoc(singleRecipeRef);

        try {
            let recipeData = singleRecipeSnap.data();
            if (recipeData !== undefined) {
                let recipeObject = <RecipeDetails>{
                    id: recipeData.id,
                    title: recipeData.title,
                    ingredients: recipeData.ingredients,
                    preparation: recipeData.preparation,
                    chef: recipeData.chef,
                    minutesNeeded: recipeData.time,
                    difficulty: recipeData.difficulty,
                    views: recipeData.views,
                    likes: recipeData.likes
                }
                return recipeObject;
            }
            else throw new Error("Can't retrieve the requested recipe with id " + recipeId);
        }
        catch (error) {
            console.error("Can't retrieve the requested recipe. Error: " + error);
            return null;
        }
    }
)

export const fetchSearchResults = createAsyncThunk('recipe/fetchSearchResults',
    async (text: string) => {

        const fetchResults = async (searchText: string) => {
            const recipeRef = collection(db, 'Recipe');
            const recipeQuery = query(recipeRef, orderBy('title'), startAt(searchText), endAt(searchText + '\uf8ff'));
            const querySnapshot = await getDocs(recipeQuery);
            return querySnapshot.docs.map((doc) => {
                const recipeData = doc.data();
                return {
                    id: recipeData.id,
                    title: recipeData.title
                }
            });
        };

        const searchResultsExactText = await fetchResults(text);
        const searchResultsWithUppercase = text.charAt(0) !== text.charAt(0).toUpperCase() ? await fetchResults(text.charAt(0).toUpperCase() + text.slice(1)) : [];
        const searchResultsWithLowercase = text.charAt(0) === text.charAt(0).toUpperCase() ? await fetchResults(text.charAt(0).toLowerCase() + text.slice(1)) : [];

        return [...searchResultsExactText, ...searchResultsWithUppercase, ...searchResultsWithLowercase];
    }
)