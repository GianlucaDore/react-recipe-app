import { Avatar, Badge, Box, Button, IconButton, Typography } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { getLoggedUser, getUserData, setUserImage } from "../redux/recipeSlice";
import { useEffect } from "react";
import { useParams } from "react-router";
import { fetchUserData } from "../redux/thunks";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { UserStats } from "../components/UserStats";
import { AddAPhoto, Edit } from "@mui/icons-material";
import { updateUserImage } from "../utils/DEPRECATED_apicalls";
import { UserActivityBox } from "../components/UserActivityBox";
import { showSnackbarError, showSnackbarSuccess } from "../utils/helpers";
import { Toaster } from "../components/Toaster";
import { ChefData, UserInfo } from "../redux/storetypes";

import defaultChef from '../assets/default_chef.jpg';


export const UserProfile = () => {

    const { userId } = useParams();

    const dispatch = useAppDispatch();

    const userData: ChefData | null  = useAppSelector(getUserData);

    const loggedUser: UserInfo | null = useAppSelector(getLoggedUser);

    useEffect(() => {
        const fetchUserDataFunction = async () => {
            if (userId === undefined) {
                showSnackbarError(dispatch, "Invalid user ID provided.");
                return;
            }
            try {
                await dispatch(fetchUserData(userId)).unwrap();
            } catch (error) {
                showSnackbarError(dispatch, error);
            }
        }
        fetchUserDataFunction();
        
    }, [dispatch, userId]);


    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            if (userData) {
                try {
                    const imageURL = await updateUserImage(userData.displayName!, userData.uid, event.target.files[0]);
                    dispatch(setUserImage(imageURL));
                    showSnackbarSuccess(dispatch, "User image updated successfully!")
                }
                catch (error) {
                    console.error("Error while updating user image: ", error)
                    showSnackbarError(dispatch, error);
                }
            }
            else {
                console.error("There was an error fetching the requested user.")
                showSnackbarError(dispatch, "There was an error fetching the requested user")
            }
        }
        else {
            console.error("New image to be uploaded was not provided or it's unsupported.")
            showSnackbarError(dispatch, "New image was not provided or it's unsupported")
        }
    }


    const isAddOrChangeImageBadgeVisible = !!loggedUser && userData?.uid === loggedUser.uid;

    return (
        <>
            <RecipeAppBar />
            <Toaster />
            {userData && (
                <Box width="100%" marginTop="30px" display="flex" flexDirection="column" justifyContent="center" rowGap="50px">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Badge invisible={!isAddOrChangeImageBadgeVisible} overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={userData.photoURL ? 
                                (<Button sx={{ padding: 0 }}>
                                    <IconButton aria-label="Upload picture..." component="label" sx={{ color: "white", padding: 0 }}>
                                        <Edit />
                                        <input 
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={handleImageChange}
                                        />
                                    </IconButton>
                                </Button>)
                                :   
                                (<IconButton color="warning" aria-label="Upload picture..." component="label">
                                    <AddAPhoto />
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageChange}
                                    />
                                </IconButton>)
                            }
                        >
                            <Avatar 
                                src={(userData.photoURL) ? userData.photoURL : defaultChef} 
                                alt={(userData.displayName) ? userData.displayName : "Generic chef"}
                                sx={{ width: 120, height: 120 }}
                            />
                        </Badge>
                        <Typography variant="h3">{userData.displayName}</Typography>
                        <Typography variant="h6">{userData.email}</Typography>
                    </Box>
                    <Box>
                        <UserStats 
                            likesReceived={userData.likesReceived} 
                            totalViews={userData.totalViews} 
                            publishedRecipes={userData.publishedRecipes} 
                        />
                    </Box>
                    <UserActivityBox />
                </Box>
            )}
        </>
    );
}