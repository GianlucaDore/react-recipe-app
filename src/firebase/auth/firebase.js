import firebase from 'firebase/compat/app';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBS2FKdmLZXgIvOXgsSh1xJqZ0l6M4_zsg",
  authDomain: "react-recipe-app-8135c.firebaseapp.com",
  projectId: "react-recipe-app-8135c",
  storageBucket: "react-recipe-app-8135c.appspot.com",
  messagingSenderId: "751051262138",
  appId: "1:751051262138:web:f33285615bf10f244dda83",
  measurementId: "G-QFSX08BT7L"
};

const app = initializeApp(firebaseConfig);

const firebaseDatabase = firebase.database;

const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, firebaseDatabase, db };
