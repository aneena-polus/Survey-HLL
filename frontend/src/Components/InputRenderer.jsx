import React from 'react';
import { FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio, Select, MenuItem, TextField, Typography } from '@mui/material';

const InputRenderer = ({ question, index, response, onChange, isInvalid, data }) => {
    const handleChange = (e) => {
        const { type, checked, value } = e.target;
        const newValue = type === 'checkbox' 
            ? checked
                ? [...(Array.isArray(response.answer) ? response.answer : []), value]
                : (Array.isArray(response.answer) ? response.answer : []).filter((item) => item != value)
            : value;
        onChange(index, question.ID, newValue, response.actionType);
    };

    return (
        <FormControl fullWidth margin="normal">
            <Typography component="span">
                {question.IS_MANDATORY == 'T' && <Typography component="span" color="error" display="inline">*</Typography>}
                <FormLabel className='text-dark my-2'>{question.QUESTION}</FormLabel>
            </Typography>
            {question.TYPE === 'Checkbox' && (
                <>
                    <FormGroup>
                        {question.OPTIONS.map((option, idx) => (
                            <FormControlLabel key={idx} 
                                control={
                                    <Checkbox name={option.optionText} value={String(option.optionId)} disabled={data.survey_details.USER_SURVEY_STATUS==="completed"}
                                        checked={Array.isArray(response.answer) && response.answer.map(String).includes(String(option.optionId))}
                                        onChange={handleChange} />} label={<Typography variant="body1">{option.optionText}</Typography>} />
                        ))}
                    </FormGroup>
                    {isInvalid && (<Typography variant='caption' color='error'>*This field is required</Typography>)}
                </>
            )}
            {question.TYPE === 'Yes/No' && (
                <>
                    <RadioGroup value={response.answer} onChange={handleChange}>
                        <FormControlLabel value="Yes" control={<Radio disabled={data.survey_details.USER_SURVEY_STATUS=="completed"} size='small' />} label={<Typography variant="body1">Yes</Typography>}/>
                        <FormControlLabel value="No" control={<Radio disabled={data.survey_details.USER_SURVEY_STATUS=="completed"} size='small' />} label={<Typography variant="body1">No</Typography>}/>
                    </RadioGroup>
                    {isInvalid && (<Typography variant='caption' color='error'>*This field is required</Typography>)}
                </>
            )}
            {question.TYPE === 'Radio' && (
                <>
                    <RadioGroup value={response.answer} onChange={handleChange}>
                        {question.OPTIONS.map((option) => (
                            <FormControlLabel key={option.optionId} value={String(option.optionId)} 
                                control={<Radio disabled={data.survey_details.USER_SURVEY_STATUS=="completed"}/>}
                                label={<Typography variant="body1">{option.optionText}</Typography>} />
                        ))}
                    </RadioGroup>
                    {isInvalid && (<Typography variant='caption' color='error'>*This field is required</Typography>)}
                </>
            )}
            {question.TYPE === 'Dropdown' && (
                <>
                    <Select value={response.answer || ''} onChange={handleChange} displayEmpty size="small" disabled={data.survey_details.USER_SURVEY_STATUS=="completed"}
                        sx={{ border: isInvalid ? '2px solid red' : 'none', borderRadius: '4px' }}>
                        <MenuItem value=""><em>Select an option</em></MenuItem>
                        {question.OPTIONS.map((option) => (
                            <MenuItem key={option.optionId} value={String(option.optionId)}>{option.optionText}</MenuItem>
                        ))}
                    </Select>
                    {isInvalid && (<Typography variant='caption' color='error'>*This field is required</Typography>)}
                </>
            )}
            {(question.TYPE === 'Date' || question.TYPE === 'Text') && (
                <>
                    <TextField type={question.TYPE} value={response.answer || ''} size="small" disabled={data.survey_details.USER_SURVEY_STATUS=="completed"}
                        variant="filled" onChange={handleChange} fullWidth sx={{ border: isInvalid ? '2px solid red' : 'none', borderRadius: '4px' }}/>
                    {isInvalid && (<Typography variant='caption' color='error'>*This field is required</Typography>)}
                </>
            )}
        </FormControl>
    );
};

export default InputRenderer;
