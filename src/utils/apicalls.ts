import { getAuth, User } from "firebase/auth";
import { addDoc, collection, doc, endAt, getDocs, orderBy, query, setDoc, startAt, where } from "firebase/firestore";
import { auth, db, storage } from "../firebase/auth/firebase";
import { capitalizeFirstLetterAfterSpace, createImageFileName } from "./helpers";
import { Ingredient, IngredientSuggestion, RecipeDetails } from "../redux/storetypes";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

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

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User is not authenticated.");
    }

    const searchResultsWithUppercase = term.charAt(0) !== term.charAt(0).toUpperCase() ? await fetchResults(term.charAt(0).toUpperCase() + term.slice(1)) : [];
    const searchResultsWithLowercase = term.charAt(0) === term.charAt(0).toUpperCase() ? await fetchResults(term.charAt(0).toLowerCase() + term.slice(1)) : [];
    
    return searchResultsWithUppercase.concat(searchResultsWithLowercase);
};


export const retrieveImageFromURL = async (imageURL: string) : Promise<File | null> => {
    try {
        const httpsRef = ref(storage, imageURL);

        const url = await getDownloadURL(httpsRef);
        const urlParts = imageURL.split('/');
        const fileName = urlParts[urlParts.length - 1];

        const response = await fetch(url);
        const blob = await response.blob();

        const file = new File([blob], fileName, { type: blob.type });
        return file;
    } 
    catch (error) {
        console.error("Error retrieving image from URL: ", error);
        return null;
    }
}


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


export const publishNewRecipe = async (recipe: Omit<RecipeDetails, "id" | "imageURL">, image: File) : Promise<boolean | Error> => {
    const recipeTitleUpperCase = capitalizeFirstLetterAfterSpace(recipe.title);

    const imageFileName = createImageFileName(recipe.title, image.type);

    const user = auth.currentUser;
    if (!user) {
        throw new Error("Error: user is not properly authenticated.");
    }

    if (imageFileName && image.size <= 10 * 1024 * 1024 && image.type.match(/image\/(jpg|jpeg|png)/)) {
        const recipeImageRef = ref(storage, 'public/' + imageFileName);
        const ret = await uploadBytes(recipeImageRef, image);

        if (ret.metadata.size) {
            const imageURL = recipeImageRef.fullPath;

            const recipeRef = collection(db, 'Recipes');
            const recipeQuery = query(recipeRef, where("name", "==", recipeTitleUpperCase));
            const querySnapshot = await getDocs(recipeQuery);

            if (querySnapshot.empty) {
                try {
                    const docRecipeData = {
                        title: recipeTitleUpperCase,
                        imageURL: imageURL,
                        ingredients: recipe.ingredients,
                        preparation: recipe.preparation,
                        chef: recipe.chef,
                        minutesNeeded: recipe.minutesNeeded,
                        difficulty: recipe.difficulty,
                        views: 0,
                        likes: 0
                    }
                    await addDoc(recipeRef, docRecipeData);

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
        else {
            throw new Error("Failed to upload image.");
        }    
    }
    else {
        throw new Error("Unsupported image format.");
    } 
}