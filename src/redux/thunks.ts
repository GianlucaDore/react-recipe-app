import { createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase/auth/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Recipe } from "./storetypes";


export const fetchRecipes = createAsyncThunk('recipe/fetchRecipes',
    async () => {
        const docsRef = collection(db, "Recipes");
        const docsSnap = await getDocs(docsRef);

        if (!docsSnap.empty) {
            /* We create an Array<Recipe> from the data fetched from the Firestore. */
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

export const fetchRecipesBatch = createAsyncThunk('recipe/fetchRecipesBatch',
    async () => {
        return new Array;
    }
)