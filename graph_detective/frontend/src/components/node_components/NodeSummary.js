import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export const NodeSummary = ({
    selectedAttribute,
    selectedOperator,
    selectedValue,
}) => {

    if (selectedAttribute == null || selectedOperator == null || selectedValue == '' || selectedValue == null) {
        return <div></div>
    }
    if (selectedValue instanceof (Object)) {
        const timestamp = Date.parse(selectedValue);
        if (isNaN(timestamp)) {
            selectedValue = ''
        } else {
            const selectedDate = new Date(timestamp);
            selectedValue = selectedDate.toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
    }

    selectedAttribute = selectedAttribute == null ? "" : selectedAttribute
    selectedOperator = selectedOperator == null ? "" : selectedOperator.label
    selectedValue = selectedValue == null ? "" : selectedValue
    return (
        <div>
            <Stack direction="column" spacing={1}>
                <Chip label={<b>{selectedAttribute}</b>} size="small" variant="filled" />
                <Chip label={<i>{selectedOperator}</i>} size="small" variant="outlined" />
                <i style={{ wordWrap: 'break-word'}}>{selectedValue}</i>
            </Stack>
        </div>
    );

}