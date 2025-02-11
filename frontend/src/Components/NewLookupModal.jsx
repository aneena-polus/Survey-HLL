import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, TextField, Button, InputLabel, Stack, IconButton, Tooltip } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CloseIcon from "@mui/icons-material/Close";
import AddBoxIcon from '@mui/icons-material/AddBox';
import SaveIcon from "@mui/icons-material/Save";
import { addLookupOption, deleteLookupOption, editLookupOption, getAllLookupOptions, updateLookupTitle } from "../services/userResponse";
import { ToastMessage } from "../common/Toast";
import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";
import { deleteLookupOptions, editLookupOptions, addLookupOptions, getLookupOptions, clearLookupOptions, saveAddLookupOptions, editLookupTitle } from "../redux/Slice/surveySlice";

const NewLookupModal = ({ open, onClose, onSave, editData }) => {
    const dispatch = useDispatch();
    const modalRef = useRef(null);
    const [lookupType, setLookupType] = useState("");
    const [errors, setErrors] = useState({});
    const lookupOptions = useSelector(state => state.questions.lookupOptions || []);
    const [editIndex, setEditIndex] = useState(null);
    const [prevOptionText, setPrevOptionText] = useState("");

    useEffect(() => {
        if (editData) {
            setLookupType(editData.key);
            getAllLookupOptions(editData.lookupId).then((res) => {
                dispatch(getLookupOptions(res.data.lookups[0].options));
            });
        } else {
            setLookupType("");
        }
        setErrors({});
    }, [editData]);

    const handleLookupTypeChange = (e) => {
        setLookupType(e.target.value);
    };

    const handleClose = () => {
        dispatch(clearLookupOptions());
        setLookupType("");
        setErrors({});
        setEditIndex(null);
        onClose();
    };

    const handleUpdateTitle = () => {
        const reqObj = { lookupId: editData.lookupId, newlookup: lookupType };
        updateLookupTitle(reqObj).then((res) => {
            dispatch(editLookupTitle({ lookupId: res.data.lookupId, key: res.data.key }));
            ToastMessage('Title Updated Successfully!');
        })
    };

    const handleOptionChange = (optionId, value) => {
        dispatch(editLookupOptions({ optionId, optionText: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!lookupType.trim()) {
            newErrors.lookupType = "* Lookup Type is required";
        }
        if (lookupOptions.some(option => !option.optionText.trim())) {
            newErrors.lookupValues = "* All options must be filled";
        }
        if (!editData && lookupOptions.filter(option => option.optionText).length < 2) {
            newErrors.lookupValues = "* At least two options are required";
        }
        if (editData && lookupOptions.filter(option => !option.isNew).length < 2) {
            newErrors.lookupValues = "* At least two saved options are required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({ lookup: lookupType, option_text: lookupOptions.map(opt => opt.optionText) });
        handleClose();
    };

    const handleEdit = (optionId) => {
        if (editIndex) {
            const prevValue = lookupOptions.find((opt) => opt.optionId === editIndex);
            if (prevValue) {
                dispatch(editLookupOptions({ optionId: editIndex, optionText: prevOptionText }));
            }
        }
        const option = lookupOptions.find((opt) => opt.optionId === optionId);
        if (option) {
            setPrevOptionText(option.optionText);
        }
        setEditIndex(optionId);
    };

    const handleCancelEdit = (optionId) => {
        dispatch(editLookupOptions({ optionId, optionText: prevOptionText }));
        setEditIndex(null);
    };

    const handleSaveEdit = (optionId) => {
        const option = lookupOptions.find(opt => opt.optionId === optionId);
        if (!option) return;
        editLookupOption(optionId, { newOptionText: option.optionText }).then(() => {
            dispatch(editLookupOptions({ optionId, optionText: option.optionText }));
            ToastMessage('Option Updated Successfully!');
            setEditIndex(null);
            setPrevOptionText("");
        });
    };

    const handleAddOption = () => {
        dispatch(addLookupOptions({ optionId: Date.now(), optionText: "", isNew: true }));
        setTimeout(() => {
            if (modalRef.current) {
                modalRef.current.scrollTo({ top: modalRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 100); 
    };
    

    const handleSaveAdd = (option) => {
        const reqObj = {
            newOptionText: option.optionText,
            lookupId: editData.lookupId
        }
        addLookupOption(reqObj).then((res) => {
            dispatch(saveAddLookupOptions({ optionId: option.optionId, options: res.data.newOptionData }));
        })
    };

    const handleRemoveOption = (optionId, isNew) => {
        if (!isNew) {
            deleteLookupOption(optionId).then(() => {
                dispatch(deleteLookupOptions(optionId));
                ToastMessage('Option Deleted Successfully!');
            });
        }
        else {
            dispatch(deleteLookupOptions(optionId));
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box ref={modalRef} className="modal-container scrollable-modal" sx={{ width: { xs: "90%", sm: "80%", md: "50%", lg: "40%" } }}>
                <IconButton
                    onClick={handleClose}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" className="mb-3">{editData ? "Edit Lookup" : "Add Lookup"}</Typography>
                <InputLabel className="fw-bold mb-0">Lookup Title</InputLabel>
                <div className="d-flex align-items-center justify-content-center mb-3">
                    <TextField
                        fullWidth margin="normal"
                        name="LOOKUP_TYPE" className="my-0"
                        value={lookupType}
                        onChange={handleLookupTypeChange}
                        error={Boolean(errors.lookupType)}
                        helperText={errors.lookupType || ""}
                    />
                    <Tooltip title="Save">
                        <IconButton color="primary" onClick={handleUpdateTitle}>
                            <SaveIcon />
                        </IconButton>
                    </Tooltip>
                </div>
                <div className="d-flex mt-4 align-items-center justify-content-between">
                    <InputLabel className="fw-bold mb-0">
                        Lookup Options
                        </InputLabel>
                        <Tooltip title="Add Option">
                            <IconButton color="primary" onClick={handleAddOption}>
                                <AddBoxIcon />
                            </IconButton>
                        </Tooltip>
                </div>
                {lookupOptions.map((option) => (
                    <div key={option.optionId} className="d-flex align-items-center">
                        <TextField disabled={!(editIndex === option.optionId || option.isNew)}
                            fullWidth margin="normal"
                            value={option.optionText}
                            className="mt-0 textfield-custom"
                            onChange={(e) => handleOptionChange(option.optionId, e.target.value)}
                        />
                        {editIndex === option.optionId ? (
                            <>
                                <Tooltip title="Clear">
                                    <IconButton color="primary" onClick={() => handleCancelEdit(option.optionId)}>
                                        <CloseIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Save">
                                    <IconButton color="primary" onClick={() => handleSaveEdit(option.optionId)}>
                                        <SaveIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                {!option.isNew && (
                                    <Tooltip title="Edit">
                                        <IconButton color="primary" onClick={() => handleEdit(option.optionId)}>
                                            <ModeEditIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {(lookupOptions.filter(opt => !opt.isNew).length > 2 || option.isNew) && (
                                    <Tooltip title="Delete">
                                        <IconButton color="error" onClick={() => handleRemoveOption(option.optionId, option.isNew)}>
                                            <RemoveIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {editData && option.isNew && (
                                    <Tooltip title="Save">
                                        <IconButton color="primary" onClick={() => handleSaveAdd(option)}>
                                            <SaveIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </>
                        )}
                    </div>
                ))}
                {errors.lookupValues && <div className="text-danger mt-2">{errors.lookupValues}</div>}
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                    {!editData && (<><Button variant="outlined" onClick={handleClose}>Cancel</Button>
                        <Button variant="contained" onClick={handleSave}>
                            Save
                        </Button></>)}
                </Stack>
            </Box>
        </Modal>
    );
};

export default NewLookupModal;
