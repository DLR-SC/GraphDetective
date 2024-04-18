import { useContext } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MessageContext } from '../../contexts/MessageContext';
import { DropzoneComponent } from './../user_components/DropzoneComponent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Stack from '@mui/material/Stack';

export const ValueEditor = ({
  selectedValue,
  setSelectedValue,
  valueOptions,
  selectedAttributeType,
  selectedOperator = null,
  label = "Value"
}) => {

  const { displayUserMessage } = useContext(MessageContext);

  const handleUpload = (parsedData) => {
    setSelectedValue(parsedData)
  }

  // Below: Show correct input component depending on the type of attribute that the user selected
  if (selectedAttributeType === "text") {
    if (selectedOperator && selectedOperator.value === "alphabetic_is_in") {
      return <Stack direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={0}>
        <DropzoneComponent
          onUpload={handleUpload}
          placeholder="Upload .txt file"
          filetype="txt"
          showIcon={false}
          padding="1px" />
        <Tooltip title="Provide your values as a comma-separated .txt file.">
          <IconButton>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    } else {
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
  }
  else if (selectedAttributeType === "number") {
    if (selectedOperator && selectedOperator.value === "numeric_is_in") {
      return <Stack direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={0}>
        <DropzoneComponent
          onUpload={handleUpload}
          placeholder="Upload .txt file"
          filetype="txt"
          showIcon={false}
          padding="1px" />
        <Tooltip title="Provide your values as a comma-separated .txt file.">
          <IconButton>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    } else {
      return <TextField
        label={label}
        type="number"
        variant="standard"
        onChange={(event) => {
          setSelectedValue(event.target.value);
        }}
      />
    }
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