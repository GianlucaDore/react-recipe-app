import { AddPhotoAlternate, Delete } from "@mui/icons-material"
import { Box, IconButton } from "@mui/material"
import { Dispatch, useCallback, useEffect, useRef, useState } from "react"
import { RecipeCreatedAction } from "../utils/interfaces"
import { withImage } from "../utils/hocs"
import { retrieveImageFromURL } from "../utils/apicalls"

interface RecipeImageProps {
    dispatcher: Dispatch<RecipeCreatedAction>;
    currentImageURL: string | null;
}

const RecipeImage = (props: RecipeImageProps) => {
    const { dispatcher, currentImageURL } = props;

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        }
    }

    const handleImageRemoval = () => {
        if (fileInputRef.current) {  
            fileInputRef.current.value = ''; // Manually clean the image file input. 
        }
        setSelectedImage(null);
        dispatcher({ type: "edit-image", payload: '' });
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