import { AddPhotoAlternate } from "@mui/icons-material"
import { Box, IconButton } from "@mui/material"
import { useEffect, useState } from "react"

interface RecipeImageProps {
    setImage: (file: File) => void;
}

export const RecipeImage = (props: RecipeImageProps) => {
    const { setImage } = props;

    const [selectedImage, setSelectedImage] = useState<string>('');

    useEffect(() => {
        return () => URL.revokeObjectURL(selectedImage);
    }, [selectedImage]);


    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedImage(URL.createObjectURL(event.target.files[0]));
            setImage(event.target.files[0]);
        }
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
                />
            </IconButton>
        </Box> 
    )
}