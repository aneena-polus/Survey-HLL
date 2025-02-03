import React, { useEffect, useState } from 'react';
import { getOptionTypes } from '../services/userResponse';
import { MenuItem, FormControl, InputLabel, Select, FormHelperText, Box } from '@mui/material';

function ChoiceSelect({ setQuestionType, setLookupType, resetTrigger, errors }) {

    const [optionTypes, setOptionTypes] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [lookupTypes, setLookupTypes] = useState([]);
    const [selectedLookup, setSelectedLookup] = useState('');

    useEffect(() => {
        getOptionTypes().then((response) => {
            setOptionTypes(response.data.answerTypes);
            setLookupTypes(response.data.lookupValues);
        });
    }, []);

    useEffect(() => {
        setSelectedOption('');
        setSelectedLookup('');
    }, [resetTrigger]);

    const handleQuestionChange = (e) => {
        setQuestionType(e.target.value);
        setSelectedOption(e.target.value);
    };

    const handleOptionChange = (e) => {
        setLookupType(e.target.value);
        setSelectedLookup(e.target.value);
    };

    return (
        <Box display="grid" gap={2} sx={{ gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <FormControl fullWidth error={!!errors.answerType}>
                <InputLabel>Question Type</InputLabel>
                <Select value={selectedOption} size='md' onChange={handleQuestionChange} label="Question Type">
                    <MenuItem value="">
                        <em>Select Option</em>
                    </MenuItem>
                    {optionTypes.map((option) => (
                        <MenuItem key={option.ID} value={option.TYPE}>
                            {option.TYPE}
                        </MenuItem>
                    ))}
                </Select>
                {errors.answerType && (
                    <FormHelperText>Option type is required</FormHelperText>
                )}
            </FormControl>
            {(selectedOption === 'checkbox' || selectedOption === 'dropdown') && (
                <FormControl fullWidth error={!!errors.lookup}>
                    <InputLabel>Lookup Type</InputLabel>
                    <Select value={selectedLookup} size='md' onChange={handleOptionChange} label="Lookup Type">
                        <MenuItem value="">
                            <em>Select Lookup</em>
                        </MenuItem>
                        {lookupTypes.map((lookup) => (
                            <MenuItem key={lookup.LOOKUP} value={lookup.LOOKUP}>
                                {lookup.LOOKUP}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.lookup && (
                        <FormHelperText>Lookup type is required</FormHelperText>
                    )}
                </FormControl>
            )}
        </Box>
    );
}

export default ChoiceSelect;
