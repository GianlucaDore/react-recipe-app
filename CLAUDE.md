# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `frontend/` — there is no root `package.json`.

```bash
cd frontend
npm install
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # tsc (typecheck, no emit) && vite build
npm run lint       # eslint . --ext ts,tsx --max-warnings 0
npm run preview    # serve the production build
npm run format -- <path>   # prettier --write; requires an explicit path/glob
```

`npm run build` runs `tsc` first with `strict`, `noUnusedLocals` and `noUnusedParameters` enabled, so an unused import or variable fails the build even though `npm run dev` tolerates it.

There is no test framework configured in this repo — no test runner, no test files, no CI workflow. Do not claim tests were run; verify changes with `npm run lint` and `npm run build`.

## Environment

`frontend/firebase/auth/firebase.js` reads Firebase config from Vite env vars, expected in `frontend/.env` (gitignored):

`VITE_FIREBASE_APIKEY`, `VITE_FIREBASE_AUTHDOMAIN`, `VITE_FIREBASE_PROJECTID`, `VITE_FIREBASE_STORAGEBUCKET`, `VITE_FIREBASE_MESSAGINGSENDERID`, `VITE_FIREBASE_APPID`, `VITE_FIREBASE_MEASUREMENTID`

Without these the app builds but every Firebase call fails at runtime. `frontend/cors.json` is the CORS policy to apply to the Storage bucket (allows GET from `localhost:5173`) — needed for recipe images to load in dev.

## Layout

`frontend/` is both the npm package root and the Vite root: `index.html` and `main.tsx` live there, not in a `src/` directory. The root `README.md` is the untouched Vite template and describes nothing about this project.

There is no backend. The React app talks to Firebase (Auth, Firestore, Storage) directly from the browser, so all query logic, pagination and access control assumptions live in the frontend.

## Architecture

### Three coexisting data-access layers

This is the single most important thing to understand before editing data code. The same Firestore operations are implemented up to three times, and the migration between them is unfinished:

1. **`utils/DEPRECATED_apicalls.ts`** — the original plain async functions. Despite the name it is still live: imported by `pages/RecipeSearch.tsx`, `pages/UserProfile.tsx`, `components/RecipeStats.tsx`, `components/RecipeImage.tsx` and `redux/thunks.ts`.
2. **`redux/thunks.ts`** — `createAsyncThunk` functions (`fetchRecipesBatch`, `fetchSingleRecipe`, `fetchRecipeOfTheDay`, `fetchUserData`, `fetchTotalNumberOfPagesInHome`, `fetchLogout`) whose results land in `recipeSlice` state via `extraReducers`.
3. **`redux/apiSlice.ts`** — RTK Query (`firebaseApi`) using `fakeBaseQuery()` with per-endpoint `queryFn`s that call the Firebase SDK. This is the direction the codebase is migrating toward; several endpoints are line-by-line copies of the `DEPRECATED_apicalls.ts` versions.

When touching data code, check all three before assuming a function is unused, and prefer extending `apiSlice.ts` over the deprecated module.

**Known gap:** `redux/store.ts` registers only `recipe: recipeReducer`. It does *not* add `[firebaseApi.reducerPath]: firebaseApi.reducer` nor `.concat(firebaseApi.middleware)`, while components (`RecipeCreator`, `IngredientsSelector`, `RecipeStats`, `UserActivityBox`, `FirebaseSignUp`) already call the generated hooks. Wiring the API slice into the store is a prerequisite for those hooks working.

### State

`store.ts` wraps the combined reducer in `redux-persist` (key `root`, localStorage), with the persist lifecycle actions excluded from the serializability check. `main.tsx` mounts `PersistGate` above the router, so state — including `loggedUser` — survives reloads independently of Firebase Auth's own session.

Always use the typed `useAppSelector` / `useAppDispatch` from `redux/hooks.ts`, never the bare react-redux hooks. Read state through the selectors exported at the bottom of `recipeSlice.ts` (`getLoggedUser`, `getCurrentRecipe`, …) rather than reaching into `state.recipe` directly.

`recipeSlice.ts` thunk handlers mostly `console.log`/`console.error`; there is no error state in the store, so failures surface only in the console. Per-page user feedback is done with local `ToasterData` state driving a MUI `Snackbar` (see `pages/RecipeCreator.tsx` for the canonical shape).

### Types

`redux/storetypes.ts` is the single source of truth for domain types, built as derivations of `RecipeDetails` / `UserData` via `Pick` and `Omit` (`Recipe`, `RecipeDisplayed`, `RecipeToSubmit`, `ChefData`). Extend the base interface and derive rather than declaring parallel shapes. `utils/interfaces.ts` holds UI-only types (`ToasterData`, `RecipeCreatedState`, `RecipeCreatedAction`).

### Recipe creation: context + HOCs

`pages/RecipeCreator.tsx` keeps the draft recipe in a `useReducer` (`recipeCreatedReducer`, string action types like `edit-title`, `insert-ingredient`) and publishes it through `RecipeCreatedContext`. `utils/hocs.tsx` provides `withPreparation`, `withImage`, `withIngredients`, `withDetails`: each `memo`s the wrapped component and injects only its slice of the context, so editing one field doesn't re-render the others. Components follow the convention of exporting both the raw component and a `<Name>Memoized` wrapper — the page imports the memoized one and passes the reducer's `dispatch` down as a `dispatcher` prop.

### Firestore data model

Three collections: **`Chefs`** (doc id = Firebase Auth uid; fields `id`, `name`, `email`, `likesReceived`, `totalViews`, `publishedRecipes`, plus `recipes` / `recipesLiked` id arrays), **`Recipes`** (`title`, `imageURL`, `ingredients`, `preparation`, `chef` = chef uid, `minutesNeeded`, `difficulty`, `views`, `likes`, `likedBy`), **`Ingredients`** (`name`).

Denormalized counters are updated with `increment()` across documents on the client: viewing a recipe bumps `Recipes.views` *and* `Chefs.totalViews`; liking bumps `Recipes.likes` + `likedBy` *and* the author's `Chefs.likesReceived`. These multi-document updates are not transactional.

`imageURL` in Firestore holds the **Storage path** (`public/<Title>.<ext>`), not a URL. Every read path must resolve it with `getDownloadURL(ref(storage, path))` before rendering — this is why image loading is async throughout.

Note existing field-name mismatches when writing queries: `publishRecipe` checks for duplicates with `where("name", "==", …)` while documents are written with `title`, and `fetchRecipeOfTheDay` reads `randomRecipeData.time` where the rest of the code uses `minutesNeeded`.

Pagination is offset-emulated: `fetchRecipesBatch` re-fetches the preceding pages to obtain a cursor for `startAfter`, so cost grows with page number. `RecipeSearch` instead uses `react-infinite-scroll-component` with a page counter and a 15-item batch heuristic.

### Auth

`firebase/auth/` holds both the SDK bootstrap (`firebase.js`, exporting `app`, `auth`, `db`, `storage`, `firebaseDatabase`) and the login/signup screens. Signup calls `insertNewChef` to create the matching `Chefs` document — a user without one breaks profile and recipe pages. Route protection is ad-hoc: pages check `getLoggedUser` in a `useEffect` and `navigate('/sign-in')` (see `RecipeCreator`); there is no route guard component.

### UI

MUI v5 with Emotion. `utils/theme.ts` centralizes the palette and per-component `styleOverrides` (`MuiCard`, `MuiButton`, `MuiCardHeader`, `MuiCardActions`, scrollbar styling…), and exports a `colors` object for use outside the theme. Prefer adding to the theme over inline `sx` for anything reused. `main.tsx` declares all routes; there is no lazy loading.

Recipe preparation text is rich HTML from `react-quill`. It is rendered by sanitizing with `DOMPurify.sanitize()` and then converting with `html-react-parser` (`RecipeSelected`, `RecipeOfTheDay`) — never render it with `dangerouslySetInnerHTML`, and keep the sanitize step when adding new render sites. Quill's `snow` CSS is loaded from a CDN `<link>` in `index.html`.

## Conventions

- ESLint runs with `--max-warnings 0`, and `react-refresh/only-export-components` is on: avoid adding non-component exports to component files.
- Prettier is configured (`frontend/.prettierrc.json`) with 4-space indent, single quotes, no semicolons, ES5 trailing commas. The existing source predates it and is not uniformly formatted, so reformatting a whole file produces large unrelated diffs — match the surrounding file instead.
- Commit messages in this repo follow a loose `v<major>.<minor> <description>` style.
