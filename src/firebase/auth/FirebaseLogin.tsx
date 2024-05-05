import { Box, Button, TextField, Typography } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import  { auth } from "./firebase";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/recipeSlice";

export const FirebaseLogin = () => {

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            dispatch(setUser({
                displayName: res.user.displayName,
                email: res.user.email,
                emailVerified: res.user.emailVerified,
                lastSignInTime: res.user.metadata.lastSignInTime,
                phoneNumber: res.user.phoneNumber,
                photoURL: res.user.photoURL
            }));
            navigate("/");
        }
        catch {
            console.error("Wrong email or password at login.");
        }
    }

    return (
        <div>
            <Box sx= {{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Typography component="h1">Sign In</Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField value={email} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setEmail(event.target.value) }} margin="normal" required fullWidth id="email" label="Email Address" name="email" autoFocus />
                    <TextField value={password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setPassword(event.target.value) }} margin="normal" required fullWidth id="password" label="Password" name="password" />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2}}>Sign In</Button>
                </Box>
            </Box>
        </div>
    )
}