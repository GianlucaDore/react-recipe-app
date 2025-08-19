import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuth, User } from "firebase/auth";
import { auth, db, storage } from "../firebase/auth/firebase";
import {
  addDoc, arrayRemove, arrayUnion, collection, doc, documentId, endAt, getDoc, getDocs, increment,
  orderBy, query, setDoc, startAt, updateDoc, where
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { capitalizeFirstLetterAfterSpace, createImageFileName } from "../utils/helpers";

import { ChefData, Ingredient, IngredientSuggestion, Recipe, RecipeDetails, RecipeToSubmit } from "./storetypes";


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
              uid: user.uid,
              likesReceived: 0,
              displayName: user.displayName,
              photoURL: null,
              publishedRecipes: 0,
              recipes: [],
              recipesLiked: [],
              totalViews: 0
            } as ChefData);
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
                uid: chefData.uid,
                displayName: chefData.displayName,
                email: chefData.email,
                photoURL: chefData.photoURL,
                likesReceived: chefData.likesReceived,
                totalViews: chefData.totalViews,
                publishedRecipes: chefData.publishedRecipes
              } as ChefData
            };
          }
          throw new Error("Chef not found");
        } catch (error) {
          return { error };
        }
      },
      providesTags: (result, _, chefId) => 
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
              recipeIdsArray.map((rid: string) => retrieveRecipeItemDetails(rid))
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
    }),

    getSelectedRecipePage: builder.query<RecipeDetails, { recipeId: string }>({
      async queryFn({ recipeId }) {
        try {
          const singleRecipeRef = doc(db, "Recipes", recipeId);
          const singleRecipeSnap = await getDoc(singleRecipeRef);
          const recipeData = singleRecipeSnap.data();

          if (recipeData) {
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
            if (updatedChefData) {
              chefData = {
                  uid: updatedChefData.uid,
                  displayName: updatedChefData.displayName,
                  email: updatedChefData.email,
                  photoURL: updatedChefData.photoURL,
                  likesReceived: updatedChefData.likesReceived,
                  totalViews: updatedChefData.totalViews,
                  publishedRecipes: updatedChefData.publishedRecipes,
                  recipes: updatedChefData.recipes,
                  recipesLiked: updatedChefData.recipesLiked,
              };
            }
            else return { error: new Error("Can't retrieve chef data for the recipe with id " + recipeId) };

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
              return { data: recipeObject };
            }    
            else return { error: new Error("Can't retrieve the requested recipe with id " + recipeId) };
          }
          else return { error: new Error("Can't retrieve the requested recipe with id " + recipeId) };
        }
        catch (error) {
          return { error }
        }
      }
    }),

    getSelectedUser: builder.query<ChefData, { userId: string; }>({
      async queryFn({ userId }) {
        try {
          const userRef = doc(db, "Chefs", userId);
          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const chefData: ChefData = {
              uid: userData.uid,
              displayName: userData.displayName,
              email: userData.email,
              photoURL: userData.photoURL,
              likesReceived: userData.likesReceived,
              totalViews: userData.totalViews,
              publishedRecipes: userData.publishedRecipes,
              recipes: userData.recipes,
              recipesLiked: userData.recipesLiked
            };
            return { data: chefData }; 
          }
          else return { error: new Error("User requested does not exist") };
        }
        catch (error) {
          return { error };
        }
      }
    }),

    getSelectedUserRecipeArrays: builder.query<{recipes: Array<string>, recipesLiked: Array<string>}, { userId: string }>({
      async queryFn({ userId }) {
        try {
          const userRef = doc(db, "Chefs", userId);
          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const recipeArrays: {recipes: Array<string>, recipesLiked: Array<string>} = {
              recipes: userData.recipes,
              recipesLiked: userData.recipesLiked
            };
            return { data: recipeArrays }; 
          }
          else return { error: new Error("User requested does not exist") };
        }
        catch (error) {
          return { error };
        }
      }
    }),

    getSelectedUserBatch: builder.query<Array<Recipe>, { batchIds: Array<string> }>({
      async queryFn({ batchIds }) {
        try {
          if (!batchIds || batchIds.length === 0) {
            return { data: [] as Recipe[] };
          }

          const recipesQuery = query(collection(db, "Recipes"), where(documentId(), "in", batchIds))
          const recipesSnapshot = await getDocs(recipesQuery);
        
          const recipes = await Promise.all(
              recipesSnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data() as { title?: string; imageURL?: string };
                let finalImageURL = '';
                if (data?.imageURL) {
                  try {
                    const recipeImageRef = ref(storage, data.imageURL);
                    finalImageURL = await getDownloadURL(recipeImageRef);
                  } catch {
                    finalImageURL = "";
                  }
                }

                return {
                  id: docSnap.id,
                  title: data?.title ?? '',
                  imageURL: finalImageURL,
                } as Recipe;
              })
          );

          const orderIndex = new Map(batchIds.map((id, i) => [id, i]));
          recipes.sort((a, b) => (orderIndex.get(a.id)! - orderIndex.get(b.id)!));
          
          return { data: recipes };
        }
        catch (error) {
          return { error };
        }
      }
    }),

    setSelectedUserImage: builder.mutation<boolean, { userId: string; userName: string; userImage: File }>({
      async queryFn({ userId, userName, userImage }) { 
        try {
          const user = auth.currentUser;
          if (!user || user.uid !== userId) {
            throw new Error("Error: user is not properly authenticated.");
          }

          const imageFileName = createImageFileName(userName, userImage.type);

          if (imageFileName && userImage.size <= 10 * 1024 * 1024 && userImage.type.match(/image\/(jpg|jpeg|png)/)) {
            const userImageRef = ref(storage, 'public/Chefs/' + imageFileName);
            const ret = await uploadBytes(userImageRef, userImage);

            if (ret.metadata.size) {
              const imageURL = userImageRef.fullPath;
              const userRef = doc(db, 'Chefs', userId);

              if (userRef) {
                try {
                  const userImageRefURL = ref(storage, imageURL);
                  const imageStorageURL = await getDownloadURL(userImageRefURL);
                  await updateDoc(userRef, { photoURL: imageStorageURL });
                  return { data: true }; 
                } catch (error) {
                  throw new Error(error as string);
                }
              } else {
                throw new Error("Can't find chef with id " + userId);
              }
            } else {
              throw new Error("Failed to upload image.");
            }
          } else {
            throw new Error("Unsupported image format.");
          }
        } catch (error) {
          return { error };
        }
      }
    }),

  }),
  keepUnusedDataFor: 60
});


export const {
  useInsertNewChefMutation,
  useGetChefDataQuery,
  useGetIngredientSuggestionsQuery,
  usePublishIngredientMutation,
  useGetRecipeItemsQuery,
  usePublishRecipeMutation,
  useAddLikeMutation,
  useRemoveLikeMutation,
  useGetSelectedUserQuery,
  useGetSelectedUserRecipeArraysQuery,
  useGetSelectedUserBatchQuery,
  useSetSelectedUserImageMutation
} = firebaseApi;
