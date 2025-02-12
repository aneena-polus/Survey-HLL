import React, { useEffect, useState } from "react";
import { Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import { deleteLookup, getAllLookups, saveLookupOptions } from "../services/userResponse";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NewLookupModal from "./NewLookupModal";
import { useDispatch, useSelector } from "react-redux";
import { addLookupData, deleteLookupData, getLookupData } from "../redux/Slice/surveySlice";
import { ToastMessage } from "../common/Toast";
import AlertDialogModal from "../common/Confirmation";

function LookupMaintenance() {
    const dispatch = useDispatch();
    const lookupData = useSelector(state => state.questions.lookupData || []);
    const [lookupModalOpen, setLookupModalOpen] = useState(false);
    const [editLookupData, setEditLookupData] = useState(null);
    const [deleteLookupId, setDeleteLookupId] = useState('');
    const [isDeleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        getAllLookups().then((response) => {
            dispatch(getLookupData(response.data.lookupValues));
        }).catch((err) => console.log(err));
    }, [dispatch]);

    const handleAddLookup = () => {
        setEditLookupData(null);
        setLookupModalOpen(true);
    };

    const handleEditLookup = (lookup) => {
        setEditLookupData(lookup);
        setLookupModalOpen(true);
    };

    const openDeleteConfirm = (deleteId) => {
        setDeleteLookupId(deleteId);
        setDeleteConfirm(true);
    }

    const handleDeleteLookup = () => {
        deleteLookup(deleteLookupId).then(() => {
            setDeleteConfirm(false);
            ToastMessage('Lookup Deleted Successfully!');
            dispatch(deleteLookupData(deleteLookupId));
            setDeleteLookupId('');
        }).catch((err) => console.log(err));
    };

    const handleCloseModal = () => {
        setLookupModalOpen(false);
        setEditLookupData(null);
    };

    const saveLookupValues = (lookupObj) => {
        if (!editLookupData)
            saveLookupOptions(lookupObj).then((res) => {
                ToastMessage(`Lookup Added Successfully!`);
                dispatch(addLookupData({ lookupId: res.data.lookupId, key: res.data.lookup }));
                setLookupModalOpen(false);
            }).catch((err) => console.log(err));
        else
            ToastMessage(`Lookup Updated Successfully!`);
    };

    return (
        <div className="container my-4">
            <Box display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary" className="mb-3" onClick={handleAddLookup}>
                    Add Lookup
                </Button>
            </Box>
            <TableContainer component={Paper} className="mt-3 shadow">
                <Table size="small">
                    <TableHead>
                        <TableRow className="bg-body-tertiary">
                            <TableCell sx={{ width: "10%" }}><b>Id</b></TableCell>
                            <TableCell sx={{ flexGrow: 1 }}><b>Lookup Name</b></TableCell>
                            <TableCell sx={{ width: "15%" }}><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {lookupData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell sx={{ flexGrow: 1 }}>{row.key}</TableCell>
                                <TableCell>
                                    <Tooltip title="Edit" disableInteractive>
                                        <IconButton color="primary" onClick={() => handleEditLookup(row)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete" disableInteractive>
                                        <IconButton color="error" size="small" onClick={() => openDeleteConfirm(row.lookupId)} >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {isDeleteConfirm && (
                <AlertDialogModal open={isDeleteConfirm} onClose={() => { setDeleteConfirm(false); setDeleteLookupId('') }} onConfirm={() => handleDeleteLookup()} />
            )}
            <NewLookupModal open={lookupModalOpen} onClose={handleCloseModal} onSave={saveLookupValues}
                editData={editLookupData} />
        </div>
    );
}

export default LookupMaintenance;
