import React, { useEffect, useState } from 'react';
import { getOptionTypes } from '../services/userResponse';
import { MenuItem, FormControl, InputLabel, Select, FormHelperText, Box } from '@mui/material';

function ChoiceSelect({ questionType, lookupType, setQuestionType, setLookupType, resetTrigger, errors }) {

    const [optionTypes, setOptionTypes] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [lookupTypes, setLookupTypes] = useState([]);
    const [selectedLookup, setSelectedLookup] = useState('');

    useEffect(() => {
        getOptionTypes().then((response) => {
            setOptionTypes(response.data.answerTypes);
            setLookupTypes(response.data.lookupValues);
        }).catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        setSelectedOption(questionType ? questionType : '');
        setSelectedLookup(lookupType ? lookupType : '');
    }, [resetTrigger, questionType, lookupType]);

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
            <div className='d-flex flex-column'>
                <InputLabel className="fw-bold"><span className='text-danger'>*</span> Question Type</InputLabel>
                <FormControl fullWidth error={!!errors.answerType}>
                    <Select value={selectedOption} size='md' onChange={handleQuestionChange} displayEmpty>
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
                        <FormHelperText>* Question type is required</FormHelperText>
                    )}
                </FormControl>
            </div>
            {(selectedOption === 'Checkbox' || selectedOption === 'Radio' || selectedOption === 'Dropdown') && (
                <div className='d-flex flex-column'>
                    <InputLabel className="fw-bold"><span className='text-danger'>*</span> Lookup Type</InputLabel>
                    <FormControl fullWidth error={!!errors.lookup}>
                        <Select value={selectedLookup} size='md' onChange={handleOptionChange} displayEmpty>
                            <MenuItem value="">
                                <em>Select Lookup</em>
                            </MenuItem>
                            {lookupTypes.map((lookup) => (
                                <MenuItem key={lookup.LOOKUP} value={lookup.KEY}>
                                    {lookup.KEY}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.lookup && (
                            <FormHelperText>* Lookup type is required</FormHelperText>
                        )}
                    </FormControl>
                </div>

            )}
        </Box>
    );
}

export default ChoiceSelect;
