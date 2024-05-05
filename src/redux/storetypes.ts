import firebase from "firebase/compat/app";

export type User = firebase.User | null;

export interface UserInfo {
    displayName: string;
    email: string;
    emailVerified: boolean;
    lastSignInTime?: string;
    phoneNumber: string;
    photoURL: string;
}

export interface Recipe {
    id: number;
    title: string;
    ingredients: Array<string>;
    preparation: string;
    chef: string;
}