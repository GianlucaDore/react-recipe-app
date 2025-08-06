import { configureStore } from '@reduxjs/toolkit';
import recipeReducer from './recipeSlice';
import snackbarReducer from './snackbarSlice';
import storage from 'redux-persist/lib/storage';
import persistReducer from 'redux-persist/es/persistReducer';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

const persistConfig = {
    key: "root",
    version: 1,
    storage
}

const persistedRecipeReducer = persistReducer(persistConfig, recipeReducer);

export const store = configureStore({
    reducer: {
        recipe: persistedRecipeReducer,
        snackbar: snackbarReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
        })
});

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch;