import { useState } from "react";
import { Box, Button } from "@mui/material";
import ReactQuill from "react-quill";

export const RecipeEditor = () => {

    const [value, setValue] = useState('');
    
    return (
        <>
            <Box>
                <ReactQuill theme="snow" value={value} onChange={setValue} />
                <Button variant="contained" color="success" onClick={() => handleSubmitRecipe()}>Submit</Button>
            </Box>
        </>
    )
}
