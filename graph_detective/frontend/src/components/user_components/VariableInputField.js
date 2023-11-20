import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export const VariableInputField = ({
    label,
    propertyName,
    value,
    updateEdgeData,
    sampleValue = "",
    options = [],
    variant = "standard",
    type = "range" // text, number, date, daterange, range
}) => {

    if (type === "text" || type === "number") {
        return (
            <div className="variableInputFieldContainer">
                <Autocomplete
                    freeSolo
                    options={options}
                    value={value}
                    onInput={(event) => {
                        updateEdgeData(event.target.value, type, propertyName);
                    }}
                    className="variableInputFieldItem"
                    renderInput={(params) => (
                        <TextField {...params} label={label} variant={variant} placeholder={"E.g. " + sampleValue} />
                    )}
                />
            </div>
        )
    }

    if (type === "number") {
        return (
            <div className="variableInputFieldContainer">
                <TextField label={label} value={value} variant={variant} type="number" className="variableInputFieldItem"
                onChange={(event) => {
                    updateEdgeData(event.target.value, type, propertyName);
                }}
                />
            </div>
        )
    }

    if (type === "date" || type === "datetime") {
        return (
            <div className="variableInputFieldContainer">
                <DatePicker label={label} placeholder={sampleValue} value={value} className="variableInputFieldItem" onChange={(event) => {
                    updateEdgeData(event, type, propertyName);
                }}
                />
            </div>
        )
    }

    if (type === "range") {
        return (
            <div className="variableInputFieldContainer">
                <TextField label={label + " (Von)"} variant={variant} value={value} type="number" className="variableInputFieldItem" onBlur={(event) => {
                    updateEdgeData(event.target.value, type, propertyName);
                }}
                />
                <TextField label={label + " (Bis)"} variant={variant} value={value} type="number" className="variableInputFieldItem" onBlur={(event) => {
                    updateEdgeData(event.target.value, type, propertyName);
                }}
                />
            </div>
        )
    }

    if (type == "daterange") {
        return (
            <div className="variableInputFieldContainer">
                <DatePicker label={label + " (From)"} value={value} className="variableInputFieldItem" onBlur={(event) => {
                    setValue(event.target.value, type, propertyName);
                }}
                />
                <DatePicker label={label + " (To)"} value={value} className="variableInputFieldItem" onBlur={(event) => {
                    setValue(event.target.value, type, propertyName);
                }}
                />
            </div>
        )
    }
}