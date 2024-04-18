import { useContext } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { MessageContext } from '../../contexts/MessageContext';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const operatorOptions = [
  // Generic operators
  {
    "value": "equals", "label": "equals",
    "groupName": "Common", "groupKey": 0
  },
  {
    "value": "equals_not", "label": "does not equal",
    "groupName": "Common", "groupKey": 0
  },

  // Alphabetic operators
  {
    "value": "alphabetic_contains", "label": "contains",
    "groupName": "Alphabetic", "groupKey": 1
  },
  // {
  //   "value": "alphabetic_contains_not", "label": "does not contain",
  //   "groupName": "Alphabetic", "groupKey": 1
  // },
  {
    "value": "alphabetic_starts_with", "label": "starts with",
    "groupName": "Alphabetic", "groupKey": 1
  },
  {
    "value": "alphabetic_is_in", "label": "contained in list",
    "groupName": "Alphabetic", "groupKey": 1
  },
  // {
  //   "value": "alphabetic_ends_with", "label": "ends with",
  //   "groupName": "Alphabetic", "groupKey": 1
  // },

  // Numeric operators
  {
    "value": "numeric_equals", "label": "equals",
    "groupName": "Numeric", "groupKey": 2
  },
  {
    "value": "numeric_smaller_than", "label": "smaller",
    "groupName": "Numeric", "groupKey": 2
  },
  {
    "value": "numeric_smaller_or_equal", "label": "smaller or equal",
    "groupName": "Numeric", "groupKey": 2
  },
  {
    "value": "numeric_larger_than", "label": "larger",
    "groupName": "Numeric", "groupKey": 2
  },
  {
    "value": "numeric_larger_or_equal", "label": "larger or equal",
    "groupName": "Numeric", "groupKey": 2
  },
  {
    "value": "numeric_is_in", "label": "contained in list",
    "groupName": "Numeric", "groupKey": 2
  },

  // Date operators
  {
    "value": "date_smaller_than", "label": "before",
    "groupName": "Date", "groupKey": 3
  },
  {
    "value": "date_smaller_or_equal", "label": "on or before",
    "groupName": "Date", "groupKey": 3
  },
  {
    "value": "date_larger_than", "label": "after",
    "groupName": "Date", "groupKey": 3
  },
  {
    "value": "date_larger_or_equal", "label": "on or after",
    "groupName": "Date", "groupKey": 3
  },
]

export const OperatorEditor = ({
  selectedOperator,
  setSelectedOperator,
  selectedAttributeType,
  label = "Operator"
}) => {
  const { displayUserMessage } = useContext(MessageContext);

  // Below: Filter available operators based on the type of attribute that the user selected
  let filteredOperators = []
  if (selectedAttributeType === "text") {
    filteredOperators = operatorOptions.filter(
      (item) => item.groupKey === 0 || item.groupKey === 1
    );
  }
  else if (selectedAttributeType === "number") {
    filteredOperators = operatorOptions.filter(
      (item) => item.groupKey === 2
    );
  }
  else if (["date", "datetime"].includes(selectedAttributeType)) {
    filteredOperators = operatorOptions.filter(
      (item) => item.groupKey === 3
    );
  }
  else {
    if (selectedAttributeType) {
      displayUserMessage(`The selected attribute is of type '${selectedAttributeType}' for which no operators are available.`, "warning")
    }
  }

  return (
    <div>
      <Autocomplete
        options={filteredOperators}
        groupBy={(option) => option.groupName}
        value={selectedOperator}
        onChange={(event, newValue) => {
          setSelectedOperator(newValue);
        }}
        sx={{ width: 200 }}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        renderInput={(params) => (
          <TextField {...params} label={label} variant="standard" />
        )}
      />
    </div>
  );
}