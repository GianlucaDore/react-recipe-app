import React from 'react'
import ReactDOM from 'react-dom/client';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecipeHome } from './pages/RecipeHome';
import { CssBaseline } from '@mui/material';
import { FirebaseLogin } from './firebase/auth/FirebaseLogin';
import { FirebaseSignup } from './firebase/auth/FirebaseSignUp';
import { RecipeSelected } from './pages/RecipeSelected';
import { RecipeSearch } from './pages/RecipeSearch';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RecipeHome />} />
          <Route path="/sign-in" element={<FirebaseLogin />} />
          <Route path="/sign-up" element={<FirebaseSignup />} />
          <Route path="/recipe/:recipeId" element={<RecipeSelected />} />
          <Route path="/search" element={<RecipeSearch />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
