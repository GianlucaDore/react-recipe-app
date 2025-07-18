import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuth, User } from "firebase/auth";
import {
  addDoc, arrayRemove, arrayUnion, collection, doc, endAt, getDoc, getDocs, increment,
  limit, orderBy, query, setDoc, startAfter, startAt, updateDoc, where
} from "firebase/firestore";
import { auth, db, storage } from "../firebase/auth/firebase";
import { capitalizeFirstLetterAfterSpace, createImageFileName } from "../utils/helpers";
import { ChefData, Ingredient, IngredientSuggestion, Recipe, RecipeToSubmit } from "../redux/storetypes";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";


export const firebaseApi = createApi({
  reducerPath: 'firebaseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Chefs', 'Ingredients', 'Recipes'],
  endpoints: (builder) => ({
    insertNewChef: builder.mutation<boolean, User>({
      async queryFn(user) {
        try {
          const userRef = collection(db, 'Chefs');
          const userQuery = query(userRef, where("id", "==", user.uid));
          const querySnapshot = await getDocs(userQuery);

          if (querySnapshot.empty) {
            await setDoc(doc(db, "Chefs", user.uid), {
              email: user.email,
              id: user.uid,
              likesReceived: 0,
              name: user.displayName,
              publishedRecipes: 0,
              totalViews: 0
            });
            return { data: true };
          }
          return { data: false };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ['Chefs']
    }),

    getChefData: builder.query<ChefData, string>({
      async queryFn(chefId) {
        try {
          const chefsRef = collection(db, "Chefs");
          const chefsQuery = query(chefsRef, where("id", "==", chefId));
          const querySnapshot = await getDocs(chefsQuery);

          if (!querySnapshot.empty) {
            const chefData = querySnapshot.docs[0].data();
            return { 
              data: {
                uid: chefData.id,
                displayName: chefData.name,
                email: chefData.email,
                photoURL: chefData.photoURL,
                likesReceived: chefData.likesReceived,
                totalViews: chefData.totalViews,
                publishedRecipes: chefData.publishedRecipes
              } 
            };
          }
          throw new Error("Chef not found");
        } catch (error) {
          return { error };
        }
      },
      providesTags: (result, error, chefId) => 
        result ? [{ type: 'Chefs', id: chefId }] : []
    }),

    getIngredientSuggestions: builder.query<IngredientSuggestion[], string>({
      async queryFn(term) {
        try {
          const fetchResults = async (searchText: string) => {
            const ingredientRef = collection(db, 'Ingredients');
            const ingredientQuery = query(
              ingredientRef, 
              orderBy('name'), 
              startAt(searchText), 
              endAt(searchText + '\uf8ff')
            );
            const querySnapshot = await getDocs(ingredientQuery);
            return querySnapshot.docs.map((doc) => ({
              name: doc.data().name
            }));
          }

          const auth = getAuth();
          if (!auth.currentUser) throw new Error("Not authenticated");

          const upperCaseResults = term.charAt(0) !== term.charAt(0).toUpperCase() 
            ? await fetchResults(term.charAt(0).toUpperCase() + term.slice(1)) 
            : [];
          
          const lowerCaseResults = term.charAt(0) === term.charAt(0).toUpperCase() 
            ? await fetchResults(term.charAt(0).toLowerCase() + term.slice(1)) 
            : [];

          return { data: [...upperCaseResults, ...lowerCaseResults] };
        } catch (error) {
          return { error };
        }
      }
    }),

    publishIngredient: builder.mutation<boolean, string>({
      async queryFn(ingredientName) {
        try {
          const ingredientNameUpperCase = capitalizeFirstLetterAfterSpace(ingredientName);
          const ingredientRef = collection(db, 'Ingredients');
          const ingredientQuery = query(ingredientRef, where("name", "==", ingredientNameUpperCase));
          const querySnapshot = await getDocs(ingredientQuery);

          if (querySnapshot.empty) {
            const newDocRef = doc(ingredientRef);
            await setDoc(newDocRef, <Ingredient>{ name: ingredientNameUpperCase });
            return { data: true };
          }
          throw new Error("Ingredient already exists");
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ['Ingredients']
    }),

    getRecipeItems: builder.query<Recipe[], { type: string; chefId: string }>({
      async queryFn({ type, chefId }) {
        try {
          const retrieveRecipeItemDetails = async (recipeId: string) => {
            const recipeRef = doc(db, "Recipes", recipeId);
            const recipeSnap = await getDoc(recipeRef);
            const recipeData = recipeSnap.data();
            
            if (recipeData) {
              let imageURL = '';
              if (recipeData.imageURL) {
                const recipeImageRef = ref(storage, recipeData.imageURL);
                imageURL = await getDownloadURL(recipeImageRef);
              }
              return { id: recipeId, title: recipeData.title, imageURL } as Recipe;
            }
            return null;
          }

          const chefRef = doc(db, "Chefs", chefId);
          const chefSnap = await getDoc(chefRef);
          const chefData = chefSnap.data();

          if (chefData) {
            const recipeIdsArray = type === "Recipes" 
              ? chefData.recipes 
              : type === "Likes" 
                ? chefData.recipesLiked 
                : [];
            
            const recipeItems = await Promise.all(
              recipeIdsArray.map(rid => retrieveRecipeItemDetails(rid))
            );
            return { data: recipeItems.filter(item => item !== null) as Recipe[] };
          }
          throw new Error("Invalid chef data");
        } catch (error) {
          return { error };
        }
      },
      providesTags: ['Recipes']
    }),

    publishRecipe: builder.mutation<boolean, { recipe: RecipeToSubmit; image: File }>({
      async queryFn({ recipe, image }) {
        try {
          const recipeTitleUpperCase = capitalizeFirstLetterAfterSpace(recipe.title);
          const imageFileName = createImageFileName(recipe.title, image.type);
          const user = auth.currentUser;

          if (!user) throw new Error("Not authenticated");
          if (!imageFileName || image.size > 10 * 1024 * 1024 || !image.type.match(/image\/(jpg|jpeg|png)/)) {
            throw new Error("Invalid image");
          }

          const recipeImageRef = ref(storage, 'public/' + imageFileName);
          await uploadBytes(recipeImageRef, image);
          const imageURL = recipeImageRef.fullPath;

          const recipeRef = collection(db, 'Recipes');
          const recipeQuery = query(recipeRef, where("name", "==", recipeTitleUpperCase));
          const querySnapshot = await getDocs(recipeQuery);

          if (querySnapshot.empty) {
            await addDoc(recipeRef, {
              title: recipeTitleUpperCase,
              imageURL: imageURL,
              ingredients: recipe.ingredients,
              preparation: recipe.preparation,
              chef: recipe.chefId,
              minutesNeeded: recipe.minutesNeeded,
              difficulty: recipe.difficulty,
              views: 0,
              likes: 0
            });
            return { data: true };
          }
          throw new Error("Recipe already exists");
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ['Recipes']
    }),

    addLike: builder.mutation<boolean, { chefWhoLikedId: string; chefWhoGotLikedId: string; recipeId: string }>({
      async queryFn({ chefWhoLikedId, chefWhoGotLikedId, recipeId }) {
        try {
          const recipeRef = doc(db, "Recipes", recipeId);
          await updateDoc(recipeRef, { 
            likes: increment(1),
            likedBy: arrayUnion(chefWhoLikedId)
          });

          const chefRef = doc(db, "Chefs", chefWhoGotLikedId);
          await updateDoc(chefRef, { likesReceived: increment(1) });
          
          return { data: true };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ['Recipes', 'Chefs']
    }),

    removeLike: builder.mutation<boolean, { chefWhoUnlikedId: string; chefWhoGotUnlikedId: string; recipeId: string }>({
      async queryFn({ chefWhoUnlikedId, chefWhoGotUnlikedId, recipeId }) {
        try {
          const recipeRef = doc(db, "Recipes", recipeId);
          await updateDoc(recipeRef, { 
            likes: increment(-1),
            likedBy: arrayRemove(chefWhoUnlikedId)
          });

          const chefRef = doc(db, "Chefs", chefWhoGotUnlikedId);
          await updateDoc(chefRef, { likesReceived: increment(-1) });
          
          return { data: true };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ['Recipes', 'Chefs']
    })
  })
});


export const {
  useInsertNewChefMutation,
  useGetChefDataQuery,
  useGetIngredientSuggestionsQuery,
  usePublishIngredientMutation,
  useGetRecipeItemsQuery,
  usePublishRecipeMutation,
  useAddLikeMutation,
  useRemoveLikeMutation
} = firebaseApi;
