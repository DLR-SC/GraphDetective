import { useState, useEffect } from 'react';
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { GET_ATTRIBUTES } from '../../backend/services/collection.tsx';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


export const MultipleSelect = ({ collectionName, updateSelectedAttributes }) => {
    const [selectedProps, setSelectedProps] = React.useState([]);
    const [propertyNames, setPropertyNames] = React.useState([]);

    useEffect(() => {
      updateSelectedAttributes(collectionName, selectedProps)
    }, [selectedProps])

      // Add node to flow canvas when the user clicks on the list
    useEffect(() => {
      const loadAttributes = async () => {
        try {
          // Attributes of the selected collection
          let atts = await GET_ATTRIBUTES(collectionName)
          atts = atts.map(att => att['key'])
          setPropertyNames(atts)
        } catch (error) {
          console.log(error)
        }
      };
      loadAttributes();
    }, []);
  
    const handleChange = (event) => {
      const {
        target: { value },
      } = event;
      setSelectedProps(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
      );
    };
  
    console.log(`Property names ${collectionName}: `, propertyNames)

    return (
      <div>
        <FormControl sx={{ m: 1, width: 300 }} size="small">
          <InputLabel id="demo-multiple-chip-label">Properties</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            multiple
            value={selectedProps}
            onChange={handleChange}
            input={<OutlinedInput id="select-multiple-chip" label="Properties" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {propertyNames.map((propertyName) => (
              <MenuItem
                key={propertyName}
                value={propertyName}
              >
                {propertyName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
}