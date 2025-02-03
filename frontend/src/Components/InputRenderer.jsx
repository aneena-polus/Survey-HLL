import React from 'react';
import { FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio, Select, MenuItem, TextField, Typography } from '@mui/material';

const InputRenderer = ({ question, index, response, data, onChange }) => {
    const handleChange = (e) => {
        const { type, checked, value } = e.target;
        const newValue = type === 'checkbox'
            ? checked
                ? [...(response.answer || []), value]
                : (response.answer || []).filter((item) => item != value)
            : value;
        onChange(index, question.ID, newValue);
    };

    return (
        <FormControl fullWidth margin="normal">
            <Typography component="span">
                {question.IS_MANDATORY && <Typography component="span" color="error" display="inline">*</Typography>}
                <FormLabel className='text-dark my-2'>{question.QUESTION}</FormLabel>
            </Typography>
            {question.TYPE === 'checkbox' && (
                <FormGroup>
                    {question.OPTIONS.map((option, idx) => (
                        <FormControlLabel key={idx}
                            control={
                                <Checkbox name={option.optionText} value={String(option.optionId)}
                                    checked={Array.isArray(response.answer) && response.answer.map(String).includes(String(option.optionId))}
                                    onChange={handleChange} />} label={option.optionText}/>
                    ))}
                </FormGroup>
            )}
            {question.TYPE === 'Yes/No' && (
                <RadioGroup value={response.answer} onChange={handleChange}>
                    <FormControlLabel value="Yes" control={<Radio size='small' />} label="Yes" />
                    <FormControlLabel value="No" control={<Radio size='small' />} label="No"  />
                </RadioGroup>
            )}
            {question.TYPE === 'radio' && (
                <RadioGroup value={response.answer} onChange={handleChange}>
                    {question.OPTIONS.map((option) => (
                        <FormControlLabel key={option.optionId} value={String(option.optionId)} control={<Radio />}
                            label={option.optionText}  />
                    ))}
                </RadioGroup>
            )}
            {question.TYPE === 'dropdown' && (
                <Select value={response.answer || ''} onChange={handleChange} displayEmpty size="small">
                    <MenuItem value=""><em>Select an option</em></MenuItem>
                    {question.OPTIONS.map((option) => (
                        <MenuItem key={option.optionId} value={String(option.optionId)}>{option.optionText}</MenuItem>
                    ))}
                </Select>
            )}
            {(question.TYPE === 'date' || question.TYPE === 'text') && (
                <TextField type={question.TYPE} value={response.answer || ''} size="small"
                    variant="filled" onChange={handleChange} fullWidth />
            )}
        </FormControl>
    );
};

export default InputRenderer;
