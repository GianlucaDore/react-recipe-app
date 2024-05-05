import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { auth } from "./firebase";

export const FirebaseSignup = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    let passwordMismatch = null;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password === confirmPassword)
        {
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                navigate("/login");
            }
            catch {
                console.error();
            }
        }
        else {
            passwordMismatch = <Typography component="p">Warning: passwords don't match.</Typography>
        }
        
    }

    return (
        <div>
            <Box sx= {{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {(passwordMismatch) ? <Alert variant="filled" severity="error">{passwordMismatch}</Alert> : null}
                <Typography component="h1">Sign Up</Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                   <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField value={email} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setEmail(event.target.value) }} required fullWidth id="email" label="Email" name="email" />
                            <TextField value={password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setPassword(event.target.value) }} margin="normal" required fullWidth id="password" label="Password" name="password" />
                            <TextField value={confirmPassword} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setConfirmPassword(event.target.value) }} margin="normal" required fullWidth id="confirmPassword" label="Confirm Password" name="confirmPassword" />
                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2}}>Sign Up</Button>
                        </Grid>
                   </Grid>
                </Box>
            </Box>
        </div>
    )
}