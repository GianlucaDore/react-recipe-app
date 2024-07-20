import { combineReducers, configureStore } from '@reduxjs/toolkit';
import recipeReducer from './recipeSlice';
import storage from 'redux-persist/lib/storage';
import persistReducer from 'redux-persist/es/persistReducer';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

const persistConfig = {
    key: "root",
    version: 1,
    storage
}

const combinedReducer = combineReducers({
    recipe: recipeReducer
});

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
        })
});

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch;