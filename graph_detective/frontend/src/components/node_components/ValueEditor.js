import {useContext} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MessageContext } from '../../contexts/MessageContext';

export const ValueEditor = ({
  selectedValue,
  setSelectedValue,
  valueOptions,
  selectedAttributeType,
  label = "Value"
}) => {

  const { displayUserMessage } = useContext(MessageContext);

  // Below: Show correct input component depending on the type of attribute that the user selected
  if (selectedAttributeType === "text") {
    return <Autocomplete
      freeSolo
      options={valueOptions}
      value={selectedValue}
      onBlur={(event) => {
        setSelectedValue(event.target.value);
      }}
      sx={{ width: 200 }}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="standard" />
      )}
    />
  }
  else if (selectedAttributeType === "number") {
    return <TextField
      label={label}
      type="number"
      variant="standard"
      onChange={(event) => {
        setSelectedValue(event.target.value);
      }}
    />
  }
  else if (["date", "datetime"].includes(selectedAttributeType)) {
    return <DatePicker
      label={label}
      value={selectedValue instanceof Date ? selectedValue : ''}
      className="variableInputFieldItem"
      onChange={(event) => {
        setSelectedValue(event);
      }}
    />
  }
  else {
    if (selectedAttributeType) {
      displayUserMessage(`The selected attribute is of type '${selectedAttributeType}' for which no operators are available.`, "warning")
    }
  }
  return (
    <div>

    </div>
  );
}