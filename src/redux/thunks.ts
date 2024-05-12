import { createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase/auth/firebase";
import { collection, doc, getCountFromServer, getDoc } from "firebase/firestore";
import { Recipe } from "./storetypes";
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
                        id: recipeData.id,
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
                let recipeObject = <Recipe>{
                    id: recipeData.id,
                    title: recipeData.title,
                    ingredients: recipeData.ingredients,
                    preparation: recipeData.preparation,
                    chef: recipeData.chef
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