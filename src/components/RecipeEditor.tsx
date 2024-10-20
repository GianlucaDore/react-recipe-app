import { Dispatch } from "react";
import { Box } from "@mui/material";
import ReactQuill from "react-quill";
import { RecipeCreatedAction } from "../utils/interfaces";
import { withPreparation } from "../utils/hocs";

interface RecipeEditorProps {
    preparation: string;
    dispatcher: Dispatch<RecipeCreatedAction>
}

const RecipeEditor = (props: RecipeEditorProps) => {
    const { dispatcher, preparation } = props;

    const handleChange = (content: string) => {
        dispatcher({ type: "edit-preparation", payload: content });
    }
    
    return (
        <>
            <Box>
                <ReactQuill theme="snow" value={preparation} onChange={handleChange} />
            </Box>
        </>
    )
}

export const RecipeEditorMemoized = withPreparation(RecipeEditor);
