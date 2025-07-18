import React from 'react'
import ReactDOM from 'react-dom/client';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecipeHome } from './pages/RecipeHome';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { FirebaseLogin } from './firebase/auth/FirebaseLogin';
import { FirebaseSignup } from './firebase/auth/FirebaseSignUp';
import { RecipeSelected } from './pages/RecipeSelected';
import { RecipeSearch } from './pages/RecipeSearch';
import { UserProfile } from './pages/UserProfile';
import { RecipeCreator } from './pages/RecipeCreator';
import persistStore from 'redux-persist/es/persistStore';
import { PersistGate } from 'redux-persist/integration/react';
import theme from './utils/theme';

const persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RecipeHome />} />
              <Route path="/sign-in" element={<FirebaseLogin />} />
              <Route path="/sign-up" element={<FirebaseSignup />} />
              <Route path="/recipe/:recipeId" element={<RecipeSelected />} />
              <Route path="/search" element={<RecipeSearch />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/add-recipe" element={<RecipeCreator />} />
            </Routes>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
)
