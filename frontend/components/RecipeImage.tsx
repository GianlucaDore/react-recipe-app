import { AddPhotoAlternate, Delete } from "@mui/icons-material"
import { Box, IconButton } from "@mui/material"
import { Dispatch, useCallback, useEffect, useRef, useState } from "react"
import { RecipeCreatedAction } from "../utils/interfaces"
import { withImage } from "../utils/hocs"
import { retrieveImageFromURL } from "../utils/DEPRECATED_apicalls"
import { showSnackbarError, showSnackbarSuccess } from "../utils/helpers"
import { useAppDispatch } from "../redux/hooks"

interface RecipeImageProps {
    dispatcher: Dispatch<RecipeCreatedAction>;
    currentImageURL: string | null;
}

const RecipeImage = (props: RecipeImageProps) => {
    const { dispatcher, currentImageURL } = props;

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const dispatch = useAppDispatch();

    /* Ref to manually empty the image file input each time we remove the image. */
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        return () => URL.revokeObjectURL(selectedImage!);
    }, [selectedImage]);


    const getImageFromURL = useCallback(async () => {
        try {
            if (currentImageURL && currentImageURL !== '') {
                const imageRetrieved = await retrieveImageFromURL(currentImageURL);
                if (imageRetrieved) {
                    const localImageURL = URL.createObjectURL(imageRetrieved as Blob);
                    setSelectedImage(localImageURL);
                }    
            }
        }
        catch (error) {
            console.error("Can't retrieve image from URL: ", currentImageURL);
            showSnackbarError(dispatch, error);
        }
    }, [currentImageURL])


    useEffect(() => {
        getImageFromURL();
    }, [getImageFromURL]);


    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const localImageURL = URL.createObjectURL(event.target.files[0]);
            setSelectedImage(localImageURL);
            dispatcher({ type: "edit-image", payload: event.target.files[0]});
            showSnackbarSuccess(dispatch, "New image uploaded successfully!");
        }
        else {
            showSnackbarError(dispatch, "Failed to upload image. Please try again or use a different image.")
        }
    }

    const handleImageRemoval = () => {
        if (fileInputRef.current) {  
            fileInputRef.current.value = ''; 
        }
        setSelectedImage(null);
        dispatcher({ type: "edit-image", payload: '' });
        showSnackbarSuccess(dispatch, "Image removed successfully!");
    }

    return (
        <Box>
            <IconButton color="primary" aria-label="Upload picture..." component="label">
                <AddPhotoAlternate />
                <input 
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                />
            </IconButton>
            {selectedImage && (
                <IconButton color="primary" aria-label="Remove picture..." component="label" onClick={handleImageRemoval}>
                    <Delete />
                </IconButton>
            )}
            {selectedImage && (
                <Box mt={2}>
                    <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%', height: 'auto' }} />
                </Box>
            )}
        </Box> 
    )
}

export const RecipeImageMemoized = withImage(RecipeImage);