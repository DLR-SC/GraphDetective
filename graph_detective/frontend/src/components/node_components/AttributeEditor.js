import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';


export const AttributeEditor = ({
    attributeOptions,
    selectedAttribute,
    setSelectedAttribute,
    label="Attribute"
}) => {

    return (
        <div>
            <Autocomplete
                options={attributeOptions}
                value={selectedAttribute}
                onChange={(event, newValue) => {
                    setSelectedAttribute(newValue);
                }}
                sx={{ width: 200 }}
                renderInput={(params) => (
                    <TextField {...params} label={label} variant="standard" />
                )}
            />
        </div>
    );
}