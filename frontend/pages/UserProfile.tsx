import { useParams } from "react-router";

import { Avatar, Badge, Box, Button, IconButton, Skeleton, Typography } from "@mui/material"
import { AddAPhoto, Edit } from "@mui/icons-material";

import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { getLoggedUser } from "../redux/recipeSlice";

import { showSnackbarError, showSnackbarSuccess } from "../utils/helpers";

import { RecipeAppBar } from "../components/RecipeAppBar";
import { UserStats } from "../components/UserStats";
import { UserActivityBox } from "../components/UserActivityBox";
import { Toaster } from "../components/Toaster";


import defaultChef from '../assets/default_chef.jpg';
import { useGetSelectedUserQuery, useSetSelectedUserImageMutation } from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";


export const UserProfile = () => {
    
    const { userId } = useParams();

    const { data: userData, error: userDataError, isLoading: isUserDataLoading } = useGetSelectedUserQuery(userId ? { userId } : skipToken);
    const [setSelectedUserImage, { isLoading: isSetImageLoading, isError: isSetImageError, isSuccess: isSetImageSuccess, error: setImageError }] = useSetSelectedUserImageMutation();

    const dispatch = useAppDispatch();

    const loggedUser = useAppSelector(getLoggedUser);


    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && userId && loggedUser) {
            const file = event.target.files[0];
            if (file && file.size <= 10 * 1024 * 1024 && file.type.match(/image\/(jpg|jpeg|png)/)) {
                try {
                    const result = await setSelectedUserImage({
                        userId: loggedUser.uid,          
                        userName: loggedUser.displayName ? loggedUser.displayName : "null", 
                        userImage: file
                    }).unwrap();

                    if (result) {
                        showSnackbarSuccess(dispatch, "User image updated successfully!");
                    }
                } catch (error) {
                    showSnackbarError(dispatch, error);
                }
            } else {
                showSnackbarError(dispatch, "Invalid image file");
            }
            } 
        else {
            showSnackbarError(dispatch, "Missing required user info");
        }
    };


    const isAddOrChangeImageBadgeVisible = !!loggedUser && userData?.uid === loggedUser.uid;

    return (
        <>
            <RecipeAppBar />
            <Toaster />
            <Box width="100%" marginTop="30px" marginBottom="20px" display="flex" flexDirection="column" justifyContent="center" rowGap="50px">
                <Box display="flex" flexDirection="column" alignItems="center">
                    {(!userData || isUserDataLoading || isSetImageLoading) ? 
                        (<Skeleton variant="circular">
                            <Avatar sx={{ width: 120, height: 120 }}/>
                        </Skeleton>)
                        : 
                        (<Badge invisible={!isAddOrChangeImageBadgeVisible} overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
                        )
                    }
                    <Typography variant="h3">
                        {(!userData || isUserDataLoading) ? <Skeleton width="100px"/> : userData.displayName}
                    </Typography>
                    <Typography variant="h6">
                        {(!userData || isUserDataLoading) ? <Skeleton width="90px"/> : userData.email}
                    </Typography>
                </Box>
                <Box width="100%">
                    {(!userData || isUserDataLoading) ? 
                        (<Skeleton sx={{ marginLeft: "auto", marginRight: "auto" }}>
                            <UserStats 
                                likesReceived={0} 
                                totalViews={0} 
                                publishedRecipes={0} 
                            />
                        </Skeleton>)
                        :
                        (<UserStats 
                            likesReceived={userData.likesReceived} 
                            totalViews={userData.totalViews} 
                            publishedRecipes={userData.publishedRecipes} 
                        />)}
                </Box>
                <UserActivityBox />
            </Box>
        </>
    );
}