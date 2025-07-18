import { Alert, Avatar, Badge, Box, Button, IconButton, Snackbar, Typography } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { getUserData, setUserImage } from "../redux/recipeSlice";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchUserData } from "../redux/thunks";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { UserStats } from "../components/UserStats";
import defaultChef from '../assets/default_chef.jpeg';
import { AddAPhoto, Close, Edit } from "@mui/icons-material";
import { updateUserImage } from "../utils/DEPRECATED_apicalls";
import { ToasterData } from "../utils/interfaces";
import { UserActivityBox } from "../components/UserActivityBox";

export const UserProfile = () => {

    const [toaster, setToaster] = useState<ToasterData>({
        open: false,
        message: "",
        type: "success",
        transition: "Slide",
        key: null
    });

    const { userId } = useParams();

    const dispatch = useAppDispatch();

    const userData = useAppSelector(getUserData);


    useEffect(() => {
        if (userId) {
            dispatch(fetchUserData(userId));
        }
    }, [dispatch, userId]);


    const handleCloseToaster = () => {
        setToaster((prevState) => { return { ...prevState, open: false } });
    }

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            try {
                const imageURL = await updateUserImage(userData!.displayName!, userData!.uid, event.target.files[0]);
                dispatch(setUserImage(imageURL));
                setToaster({
                    open: true,
                    message: `Image for chef ${userData!.displayName} updated successfully!`,
                    type: "success",
                    transition: "Slide",
                    key: userData!.uid
                });
            }
            catch (error) {
                console.error("Error while updating user image: ", error)
                setToaster({
                    open: true,
                    message: (error as Error).message,
                    type: "error",
                    transition: "Slide",
                    key: userData!.uid
                });
            }
        }
    }


    return (
        <>
            <RecipeAppBar />
            {userData && (
                <Box width="100%" marginTop="30px" display="flex" flexDirection="column" justifyContent="center" rowGap="50px">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={userData.photoURL ? 
                                <Button sx={{ padding: 0 }}>
                                    <IconButton aria-label="Upload picture..." component="label" sx={{ color: "white", padding: 0 }}>
                                    <Edit />
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageChange}
                                    />
                                </IconButton>
                                </Button>
                                
                                :   <IconButton color="warning" aria-label="Upload picture..." component="label">
                                        <AddAPhoto />
                                        <input 
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={handleImageChange}
                                        />
                                    </IconButton>
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
            <Snackbar 
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                autoHideDuration={4000}
                open={toaster.open}
                key={toaster.key}
                onClose={handleCloseToaster}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}
            >
                <Alert severity={toaster.type} variant="filled" sx={{display:"flex", flexDirection:"row", alignItems: "center"}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>{toaster.message}</Typography>
                        <Close onClick={handleCloseToaster} sx={{ marginLeft: "2%", cursor: "pointer" }}/>
                    </Box>
                </Alert>
            </Snackbar>
        </>
    );
}