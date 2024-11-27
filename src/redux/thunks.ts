import { createAsyncThunk } from "@reduxjs/toolkit";
import { db, storage } from "../firebase/auth/firebase";
import { collection, doc, endAt, getCountFromServer, getDoc, getDocs, increment, limit, orderBy, query, startAfter, startAt, updateDoc, where } from "firebase/firestore";
import { ChefData, Recipe, RecipeDetails, RecipeOfTheDay } from "./storetypes";
import { RootState } from "./store";
import { getAuth, signOut } from "firebase/auth";
import { getDownloadURL, ref } from "firebase/storage";
import { retrieveChefNameFromId } from "../utils/apicalls";


export const fetchLogout = createAsyncThunk('recipe/fetchLogout',
    async (_, { rejectWithValue }) => {
        const auth = getAuth();
        try {
            signOut(auth);
        }
        catch (error) {
            if (error instanceof Error) {
                rejectWithValue(error.message);
            } else {
                rejectWithValue('An unknown error occurred');
            }
        }

        return null;
    }
)

export const fetchRecipeOfTheDay = createAsyncThunk('recipe/fetchRecipeOfTheDay',
    async (_, { getState }) => {
        const lastFetchingDateString = (getState() as RootState).recipe.recipeOfTheDay?.dateOfFetching;
        const lastFetchingDate = lastFetchingDateString ? new Date(lastFetchingDateString) : undefined;
        const currentDate = new Date();

        if (lastFetchingDate === undefined || lastFetchingDate < currentDate) {
            try {
                const recipesCollectionRef = collection(db, "Recipes");
                const allRecipesSnapshot = await getDocs(recipesCollectionRef);
                const totalRecipes = allRecipesSnapshot.size;
        
                if (totalRecipes === 0) {
                    throw new Error("No recipes found in the collection.");
                }
        
                const randomIndex = Math.floor(Math.random() * totalRecipes);
        
                const randomRecipeQuery = query(recipesCollectionRef, orderBy('title'), limit(1), startAt(randomIndex));
                const randomRecipeSnap = await getDocs(randomRecipeQuery);
        
                if (!randomRecipeSnap.empty) {
                    const randomRecipeData = randomRecipeSnap.docs[0].data();
                    const randomRecipeBrief = (randomRecipeData.preparation.length > 400) ? (randomRecipeData.preparation.slice(0, 400)) : (randomRecipeData.preparation)
                    const randomRecipeChefName = await retrieveChefNameFromId(randomRecipeData.chef);
                    
                    const imagePath = randomRecipeData.imageURL;
                    let imageURL = '';
                    if (imagePath) {
                        const recipeImageRef = ref(storage, imagePath);
                        imageURL = await getDownloadURL(recipeImageRef);
                    }

                    return {
                        id: randomRecipeSnap.docs[0].id,
                        title: randomRecipeData.title,
                        imageURL: imageURL,
                        preparationInBrief: randomRecipeBrief,
                        chefName: (randomRecipeChefName) ? randomRecipeChefName : 'Unknown',
                        dateOfFetching: currentDate.toISOString(),
                        minutesNeeded: randomRecipeData.time,
                        difficulty: randomRecipeData.difficulty,
                        views: randomRecipeData.views,
                        likes: randomRecipeData.likes,
                    } as RecipeOfTheDay;
                }
                else {
                    throw new Error("Failed to retrieve a random recipe. Collection 'Recipes' is empty.");
                }
            } catch (error) {
                console.error("Error fetching random recipe:", error);
                return null;
            }
        }
        else return (getState() as RootState).recipe.recipeOfTheDay;
    }
)

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
        let recipesDisplayed: Recipe[] = [];
        const startIndex = (number - 1) * itemsPerPage;

        try {
            const recipesRef = collection(db, "Recipes");
            let recipesQuery;

            if (number === 1) {
                recipesQuery = query(recipesRef, orderBy('title'), limit(itemsPerPage));
            } else {
                const previousBatchQuery = query(recipesRef, orderBy('title'), limit(startIndex));
                const previousBatchSnap = await getDocs(previousBatchQuery);
                const lastVisible = previousBatchSnap.docs[previousBatchSnap.docs.length - 1];

                recipesQuery = query(recipesRef, orderBy('title'), startAfter(lastVisible), limit(itemsPerPage));
            }

            const recipesSnap = await getDocs(recipesQuery);
        
            recipesDisplayed = await Promise.all(recipesSnap.docs.map(async (doc) => {
                const recipeData = doc.data();
                const imagePath = recipeData.imageURL;

                let imageURL = '';
                if (imagePath) {
                    const recipeImageRef = ref(storage, imagePath);
                    imageURL = await getDownloadURL(recipeImageRef);
                }

                return {
                    id: doc.id,
                    title: recipeData.title,
                    imageURL: imageURL,
                    ingredients: recipeData.ingredients,
                    preparation: recipeData.preparation,
                    chef: recipeData.chef
                }
            }));
        }
        catch (error) {
            console.error("Error retrieving item of batch." + error);
        }

        return recipesDisplayed;
    }
)

export const fetchSingleRecipe = createAsyncThunk('recipe/fetchSingleRecipe',
    async (recipeId: string) => {
        const singleRecipeRef = doc(db, "Recipes", recipeId);

        try {
            const singleRecipeSnap = await getDoc(singleRecipeRef);
            const recipeData = singleRecipeSnap.data();

            if (recipeData !== undefined) {
                await updateDoc(singleRecipeRef, { views: increment(1) });
                const updatedRecipeSnap = await getDoc(singleRecipeRef);
                const updatedRecipeData = updatedRecipeSnap.data();
                const recipeImageRef = ref(storage, recipeData.imageURL);
                const imageURL = await getDownloadURL(recipeImageRef);
                
                const chefRef = doc(db, "Chefs", recipeData.chef);
                await updateDoc(chefRef, { totalViews: increment(1) });
                const updatedChefSnap = await getDoc(chefRef);
                const updatedChefData = updatedChefSnap.data();
                let chefData: ChefData;
                if (updatedChefData !== undefined) {
                    // const chefImageRef = ref(storage, updatedChefData.photoURL);
                    // const photoURL = await getDownloadURL(chefImageRef);
                    chefData = {
                        uid: updatedChefData.id,
                        displayName: updatedChefData.name,
                        email: updatedChefData.email,
                        photoURL: '',
                        likesReceived: updatedChefData.likesReceived,
                        totalViews: updatedChefData.totalViews,
                        publishedRecipes: updatedChefData.publishedRecipes
                    };
                }
                else throw new Error("Can't retrieve chef data for the recipe with id " + recipeId);

                if (updatedRecipeData !== undefined) {
                    const recipeObject: RecipeDetails = {
                        id: recipeId,
                        title: recipeData.title,
                        ingredients: recipeData.ingredients,
                        preparation: recipeData.preparation,
                        chef: chefData,
                        minutesNeeded: recipeData.minutesNeeded,
                        difficulty: recipeData.difficulty,
                        views: recipeData.views,
                        likes: recipeData.likes,
                        likedBy: recipeData.likedBy,
                        imageURL: imageURL
                    }
                    return recipeObject;
                }    
                else throw new Error("Can't retrieve the requested recipe with id " + recipeId);
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
            const recipeRef = collection(db, 'Recipes');
            const recipeQuery = query(recipeRef, orderBy('title'), startAt(searchText), endAt(searchText + '\uf8ff'));
            const querySnapshot = await getDocs(recipeQuery);

            return querySnapshot.docs.map((doc) => {
                const recipeData = doc.data();
                return {
                    id: doc.id,
                    title: recipeData.title,
                    imageURL: recipeData.imageURL
                } as Recipe;
            });
        };

        const searchResultsWithUppercase = text.charAt(0) !== text.charAt(0).toUpperCase() ? await fetchResults(text.charAt(0).toUpperCase() + text.slice(1)) : [];
        const searchResultsWithLowercase = text.charAt(0) === text.charAt(0).toUpperCase() ? await fetchResults(text.charAt(0).toLowerCase() + text.slice(1)) : [];

        return [...searchResultsWithUppercase, ...searchResultsWithLowercase];
    }
)

export const fetchUserData = createAsyncThunk('recipe/fetchUserData',
    async (userId: string) => {

        const userRef = collection(db, 'Chefs');
        const userQuery = query(userRef, where("id", "==", userId));
        const querySnapshot = await getDocs(userQuery);

        let userName = '';

        const userData = querySnapshot.docs.map((doc) => {
            const userData = doc.data();
            userName = userData.name;
            return {
                uid: userData.id,
                displayName: userData.name,
                email: userData.email,
                emailVerified: true,
                lastSignInTime: "N/A",
                phoneNumber: "N/A",
                photoURL: "",
                likesReceived: userData.likesReceived,
                totalViews: userData.totalViews,
                publishedRecipes: userData.publishedRecipes
            }
        });

        const recipeRef = collection(db, 'Recipes');
        const recipeQuery = query(recipeRef, where("chef", "==", userName));
        const queryRecipeSnapshot = await getDocs(recipeQuery);

        const recipeData = queryRecipeSnapshot.docs.map((doc) => {
            const recipeData = doc.data();
            return {
                id: recipeData.id,
                title: recipeData.title,
                imageURL: recipeData.imageURL
            }
        })

        return { ...userData[0], recipes: recipeData }
    }
)