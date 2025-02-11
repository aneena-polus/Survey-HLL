import React from 'react';
import { Modal, Box, Typography, Button, Stack } from '@mui/material';

const CopySurveyModal = ({ open, handleClose, survey, handleCopy }) => {
    return (
        <Modal open={open} onClose={handleClose}>
            <Box className='modal-container' sx={{width: { xs: "90%", sm: "80%", md: "50%", lg: "40%" }}}>
                <Typography variant="h6" className='mb-2'>Copy Survey</Typography>
                <Typography variant="body1">
                    Are you sure you want to copy '{survey}'?
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="flex-end" className="mt-2">
                    <Button onClick={handleClose} color="error">
                        Cancel
                    </Button>
                    <Button onClick={handleCopy} variant="contained" color="primary">
                        Yes
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default CopySurveyModal;
