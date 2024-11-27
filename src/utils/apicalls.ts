import { getAuth, User } from "firebase/auth";
import { addDoc, arrayRemove, arrayUnion, collection, doc, endAt, getDoc, getDocs, increment, orderBy, query, setDoc, startAt, updateDoc, where } from "firebase/firestore";
import { auth, db, storage } from "../firebase/auth/firebase";
import { capitalizeFirstLetterAfterSpace, createImageFileName } from "./helpers";
import { ChefData, Ingredient, IngredientSuggestion, RecipeToSubmit } from "../redux/storetypes";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ChefTitleProps } from "../components/ChefTitle";

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


export const retrieveChefNameFromId = async (chefId: string) : Promise<string | null> => {
    try {
        const chefsRef = collection(db, "Chefs");
        const chefsQuery = query(chefsRef, where("id", "==", chefId));
        const querySnapshot = await getDocs(chefsQuery);

        if (!querySnapshot.empty) {
            const chefData = querySnapshot.docs[0].data();
            return chefData.name;
        }
        else return null;
    }
    catch (error) {
        console.error("Error retrieving chef name from id: ", error);
        return null;
    }
}


export const retrieveChefDataFromId = async (chefId: string) : Promise<ChefData> => {
    try {
        const chefsRef = collection(db, "Chefs");
        const chefsQuery = query(chefsRef, where("id", "==", chefId));
        const querySnapshot = await getDocs(chefsQuery);

        if (!querySnapshot.empty) {
            const chefData = querySnapshot.docs[0].data();
            return {
                uid: chefData.id,
                displayName: chefData.name,
                email: chefData.email,
                photoURL: chefData.photoURL,
                likesReceived: chefData.likesReceived,
                totalViews: chefData.totalViews,
                publishedRecipes: chefData.publishedRecipes
            } as ChefData;
        }
        else throw new Error("Error: chef with id " + chefId + " has no data!");
    }
    catch (error) {
        console.error("Error retrieving chef data with id " + chefId + ": ", error);
        throw new Error(error as string);
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


export const publishNewRecipe = async (recipe: RecipeToSubmit, image: File) : Promise<boolean | Error> => {
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
                        chef: recipe.chefId,
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

export const addLikeToRecipe = async (chefWhoLikedId: string, chefWhoGotLikedId: string, recipeId: string) : Promise<boolean> => {
    const recipeRef = doc(db, "Recipes", recipeId);

    try {
        const recipeSnap = await getDoc(recipeRef);
        const recipeData = recipeSnap.data();

        if (recipeData !== undefined) {
            await updateDoc(recipeRef, { likes: increment(1), likedBy: arrayUnion(chefWhoLikedId) });
            const chefRef = doc(db, "Chefs", chefWhoGotLikedId);
            const chefSnap = await getDoc(chefRef);
            const chefData = chefSnap.data();

            if (chefData !== undefined) {
                await updateDoc(chefRef, { likesReceived: increment(1) });
                return true;
            }
            else return false;
        }
    }
    catch (error) {
        throw new Error(error as string);
    }

    return false;
}


export const removeLikeFromRecipe = async (chefWhoUnlikedId: string, chefWhoGotUnlikedId: string, recipeId: string) : Promise<boolean> => {
    const recipeRef = doc(db, "Recipes", recipeId);

    try {
        const recipeSnap = await getDoc(recipeRef);
        const recipeData = recipeSnap.data();

        if (recipeData !== undefined) {
            await updateDoc(recipeRef, { likes: increment(-1), likedBy: arrayRemove(chefWhoUnlikedId) });
            const chefRef = doc(db, "Chefs", chefWhoGotUnlikedId);
            const chefSnap = await getDoc(chefRef);
            const chefData = chefSnap.data();

            if (chefData !== undefined) {
                await updateDoc(chefRef, { likesReceived: increment(-1) });
                return true;
            }
            else return false;
        }
    }
    catch (error) {
        throw new Error(error as string);
    }

    return false;
}


export const fetchLikedByBatch = async (likedBy: Array<string>, page: number) : Promise<ChefTitleProps[]> => {
    const numberOfItemsInABatch = 15;
    const start = numberOfItemsInABatch * page;
    const end = start + numberOfItemsInABatch;

    const promiseArray = likedBy
                .slice(start, end)
                .map(async (l) => {
                    return await retrieveChefDataFromId(l);
                });
    try {
        const chefDataBatchResponse = await Promise.all(promiseArray);
        const chefDataBatch: Array<ChefTitleProps> = chefDataBatchResponse.map(d => {
            return {
                chefData: d,
                showFullDetails: true
            } as ChefTitleProps
        }) 
        return chefDataBatch;
    }
    catch (error) {
        console.error("Error retrieving batch of likes for the recipe: ", error);
        throw new Error(error as string);
    }

}
