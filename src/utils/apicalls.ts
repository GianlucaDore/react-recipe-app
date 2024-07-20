import { User } from "firebase/auth";
import { collection, doc, endAt, getDocs, orderBy, query, setDoc, startAt, where } from "firebase/firestore";
import { db } from "../firebase/auth/firebase";
import { capitalizeFirstLetterAfterSpace } from "./helpers";
import { Ingredient, IngredientSuggestion, RecipeDetails } from "../redux/storetypes";

export const insertNewChefInDatabase = async (user: User) : Promise<boolean> => {
    const userRef = collection(db, 'Chefs');
    const userQuery = query(userRef, where("id", "==", user.uid));
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
        const docUserData = {
            email: user.email,
            id: user.uid,
            likesReceived: 0,
            name: user.displayName,
            publishedRecipes: 0,
            totalViews: 0
        };
        await setDoc(doc(db, "Chefs", user.uid), docUserData);

        return true;
    }
    else {
        return false;
    }
}


export const retrieveIngredientSuggestion = async (term: string) : Promise<Array<IngredientSuggestion>> =>  {
    const fetchResults = async (searchText: string) => {
        const ingredientRef = collection(db, 'Ingredients');
        const ingredientQuery = query(ingredientRef, orderBy('name'), startAt(searchText), endAt(searchText + '\uf8ff'));
        const querySnapshot = await getDocs(ingredientQuery);

        return querySnapshot.docs.map((doc) => {
            const ingredientData = doc.data();
            return {
                name: ingredientData.name
            } as IngredientSuggestion;
        });
    }

    const searchResultsWithUppercase = term.charAt(0) !== term.charAt(0).toUpperCase() ? await fetchResults(term.charAt(0).toUpperCase() + term.slice(1)) : [];
    const searchResultsWithLowercase = term.charAt(0) === term.charAt(0).toUpperCase() ? await fetchResults(term.charAt(0).toLowerCase() + term.slice(1)) : [];
    
    return searchResultsWithUppercase.concat(searchResultsWithLowercase);
};


export const publishNewIngredient = async (ingredientName: string) : Promise<boolean | Error> => {
    const ingredientNameUpperCase = capitalizeFirstLetterAfterSpace(ingredientName);

    const ingredientRef = collection(db, 'Ingredients');
    const ingredientQuery = query(ingredientRef, where("name", "==", ingredientNameUpperCase));
    const querySnapshot = await getDocs(ingredientQuery);

    if (querySnapshot.empty) {
        try {
            const newDocRef = doc(ingredientRef);
            const docIngredientData = <Ingredient> {
                name: ingredientNameUpperCase
            }
            await setDoc(newDocRef, docIngredientData);

            return true;
        }
        catch (error) {
            throw new Error(error as string);
        }
    }
    else {
        throw new Error("An ingredient named " + ingredientNameUpperCase + " already exists.");
    }
}


export const publishNewRecipe = async (recipe: RecipeDetails) : Promise<boolean | Error> => {
    const recipeTitleUpperCase = capitalizeFirstLetterAfterSpace(recipe.title);

    const recipeRef = collection(db, 'Recipes');
    const recipeQuery = query(recipeRef, where("name", "==", recipeTitleUpperCase));
    const querySnapshot = await getDocs(recipeQuery);

    if (querySnapshot.empty) {
        try {
            const newDocRef = doc(recipeRef);
            const docRecipeData = <RecipeDetails> {
                id: 1,
                title: recipeTitleUpperCase,
                ingredients: recipe.ingredients,
                preparation: recipe.preparation,
                chef: recipe.chef,
                minutesNeeded: recipe.minutesNeeded,
                difficulty: recipe.difficulty,
                views: 0,
                likes: 0
            }
            await setDoc(newDocRef, docRecipeData);



            return true;
        }
        catch (error) {
            throw new Error(error as string);
        }
    }
    else {
        throw new Error("A recipe named " + recipeTitleUpperCase + " already exists.");
    }
}