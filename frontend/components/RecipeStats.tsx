import { Box, Button, CircularProgress, Divider, Modal, Stack, Typography } from "@mui/material";
import { Difficulty } from "../redux/storetypes";
import { AccessAlarm, Favorite, Psychology, Visibility } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getCurrentRecipe, getLoggedUser, setRecipeLikedBy, setRecipeLikes } from "../redux/recipeSlice";
import { useAddLikeMutation, useRemoveLikeMutation } from "../redux/apiSlice";
import { colors } from "../utils/theme";
import { ChefTitle, ChefTitleProps } from "./ChefTitle";
import InfiniteScroll from 'react-infinite-scroll-component';
import { fetchLikedByBatch } from "../utils/DEPRECATED_apicalls";

interface RecipeStatsProps {
    minutesNeeded: number;
    difficulty: Difficulty;
    views: number;
}

export const RecipeStats = (props: RecipeStatsProps) => {
    const { minutesNeeded, difficulty, views } = props;

    const [userLikesIt, setUserLikesIt] = useState<boolean>(false);
    const [isLikedByModalOpen, setIsLikedByModalOpen] = useState<boolean>(false);
    const [likedByCardList, setLikedByCardList] = useState<ChefTitleProps[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);

    const userLoggedIn = useAppSelector(getLoggedUser);
    const recipeData = useAppSelector(getCurrentRecipe);

    const dispatch = useAppDispatch();

    const [removeLike] = useRemoveLikeMutation();
    const [addLike] = useAddLikeMutation();

    useEffect(() => {
        if (doesUserLikeCurrentRecipe(userLoggedIn?.uid, recipeData?.likedBy) && userLoggedIn && !userLikesIt) {
            setUserLikesIt(true);
        }
    }, [userLoggedIn, userLikesIt, recipeData?.likedBy]);


    const handleLikeClick = async () => {
        if (userLoggedIn && recipeData) {
            if (userLikesIt) {
                const result = await removeLike({ chefWhoUnlikedId: userLoggedIn.uid, chefWhoGotUnlikedId: recipeData.chef.uid, recipeId: recipeData.id });
                if (result) {
                    dispatch(setRecipeLikedBy(recipeData?.likedBy.filter(l => l !== userLoggedIn.uid)))
                    dispatch(setRecipeLikes(recipeData.likes - 1))
                    setUserLikesIt(false);
                }
            } else {
                const result = await addLike({ chefWhoLikedId: userLoggedIn.uid, chefWhoGotLikedId: recipeData.chef.uid, recipeId: recipeData.id });
                if (result) {
                    dispatch(setRecipeLikedBy([...recipeData.likedBy, userLoggedIn.uid]))
                    dispatch(setRecipeLikes(recipeData.likes + 1))
                    setUserLikesIt(true);
                }
            }
        }
    };


    const handleOpenLikedBy = async (event: React.SyntheticEvent<HTMLParagraphElement>) => {
        event.stopPropagation();
        setIsLikedByModalOpen(true);
        await fetchMoreLikedByData();
    }

    const handleCloseLikedBy = () => {
        setIsLikedByModalOpen(false);
        setLikedByCardList([]);
        setHasMore(true);
        setPage(0);
    }

    const fetchMoreLikedByData = async () => {
        if (recipeData) {
            const newLikes: ChefTitleProps[] = await fetchLikedByBatch(recipeData.likedBy, page);
            setLikedByCardList([...likedByCardList, ...newLikes]);
            setPage((prevState) => prevState + 1);
            if (newLikes.length < 15) {
                setHasMore(false);
            }
        }
    };

    
    return (
        <>
            <Stack textAlign="center" justifyContent="center" alignItems="center" spacing={{ xs: 1, sm: 2, md: 4 }} direction={{ xs: 'row', sm: 'row', md: 'column' }}>
                <Box width="50%" padding="20px" border={`2px solid ${colors.primary}`} borderRadius="13px" sx={{ backgroundColor: colors.tertiary }}>
                    <AccessAlarm />
                    <Typography>Preparation:<br /><b>{minutesNeeded} min</b></Typography>
                </Box>
                <Box width="50%" padding="20px" border={`2px solid ${colors.primary}`} borderRadius="13px" sx={{ backgroundColor: colors.tertiary }}>
                    <Psychology />
                    <Typography>Difficulty:<br /><b>{difficulty}</b></Typography>
                </Box>
                <Box width="50%" padding="0px" borderRadius="13px" sx={userLikesIt ? likedStyle : notLikedStyle}>
                    <Button onClick={handleLikeClick} sx={userLikesIt ? unlikeButtonStyle : likeButtonStyle}>
                        <Favorite sx={{ color: userLikesIt ? colors.likePrimary : colors.primary }} />
                        <Typography component="p" color={userLikesIt ? colors.likePrimary : colors.primary}>
                            Likes:<br />
                            <b>{userLikesIt ? (
                                (recipeData && recipeData?.likedBy.length > 1) ?
                                    <Typography onClick={handleOpenLikedBy} component="p" sx={{ textDecoration: "underline", '&:hover': { fontWeight: "900" } }}>
                                        You and {recipeData.likes - 1} {recipeData.likes > 2 ? "others" : "other"} like this.
                                    </Typography>
                                    : <Typography component="p">You like this.</Typography>
                            ) : (
                                <Typography>{recipeData ? recipeData.likes : "NaN"}</Typography>
                            )}</b>
                        </Typography>
                    </Button>
                </Box>
                <Box width="50%" padding="20px" border={`2px solid ${colors.primary}`} borderRadius="13px" sx={{ backgroundColor: colors.tertiary }}>
                    <Visibility />
                    <Typography>Views:<br /><b>{views}</b></Typography>
                </Box>
            </Stack >
            <Modal
                open={isLikedByModalOpen}
                onClose={handleCloseLikedBy}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box style={{ position: "absolute", top: "50%", left: "50%", transform: 'translate(-50%, -50%)', width: "40vw", height: "90vh", border: "2px solid #000" }}
                    display="flex" flexDirection="column" justifyContent="center" alignItems="center" rowGap="30px"
                    bgcolor="antiquewhite" p={3}
                >
                    <Typography id="modal-title" variant="h6" component="h6">
                        "{recipeData?.title}" was liked by:
                    </Typography>
                    <Box id="scrollableBox" width="100%" display="flex" flexDirection="column" justifyContent="center" alignItems="center" rowGap="20px">
                        <InfiniteScroll
                            height="75vh"
                            dataLength={likedByCardList.length}
                            next={fetchMoreLikedByData}
                            hasMore={hasMore}
                            loader={<CircularProgress size="2rem" sx={{ color: colors.primary }} />}
                            endMessage={<Typography component="p" textAlign="center" marginTop="30px" fontSize="smaller">No more items to show.</Typography>}
                        >
                            <Box width="100%" display="flex" flexDirection="column" justifyContent="center" alignItems="center" rowGap="20px">
                                {likedByCardList.map((chef) => (
                                    <>
                                        <ChefTitle key={chef.chefData!.uid} chefData={chef.chefData} showFullDetails={true} />
                                        <Divider flexItem variant="middle" />
                                    </>
                                ))}
                            </Box>
                        </InfiniteScroll>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}


const likedStyle = {
    border: `2px solid ${colors.likePrimary}`,
    backgroundColor: colors.likeSecondary
}

const notLikedStyle = {
    border: `2px solid ${colors.primary}`,
    backgroundColor: colors.tertiary,
}

const likeButtonStyle = {
    width: "100%",
    padding: "20px",
    backgroundColor: colors.tertiary,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    rowGap: "8px",
    '&:hover': {
        backgroundColor: colors.likeSecondary
    },
    '&:active': {
        backgroundColor: colors.likePrimary,
        color: "white"
    }
}

const unlikeButtonStyle = {
    width: "100%",
    padding: "20px",
    backgroundColor: colors.likeSecondary,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    rowGap: "8px"
}

const doesUserLikeCurrentRecipe = (userLoggedInUid: string | undefined, likedBy: Array<string> | undefined) : boolean => {
    if (!userLoggedInUid || likedBy === undefined || likedBy.length === 0)
        return false;
    else 
        return likedBy.some((uid) => userLoggedInUid === uid);
}