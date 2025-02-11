import { connection } from "../config/connection.js";

const createLookupValues = async (req, res) => {

    const { lookup, option_text } = req.body;

    if (!lookup || option_text.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {

        const lookupquery = 'SELECT ID FROM answer_key WHERE `KEY` = ?';
        connection.query(lookupquery, [lookup], (err, result) => {
            if (err) {
                console.error('Error fetching lookup values:', err);
                return res.status(500).json({ error: 'Failed to fetch lookup values' });
            }

            if (result.length === 0) {
                const insertLookupQuery = 'INSERT INTO answer_key (`KEY`) VALUES (?)';
                connection.query(insertLookupQuery, [lookup], (err, result) => {
                    if (err) {
                        console.error('Error inserting lookup into answer_key:', err);
                        return res.status(500).json({ error: 'Failed to insert lookup into answer_key' });
                    }

                    const newLookupId = result.insertId
                    insertLookupOptions(newLookupId)
                })
            } else {
                const existingLookupId = result[0].ID;
                insertLookupOptions(existingLookupId)
            }

            function insertLookupOptions (lookupId)  {

                const lookupData = option_text.map(option => [lookupId, option]);
                const insertOptionquery = 'INSERT INTO answer_option (LOOKUP, option_text) VALUES ?';

                connection.query(insertOptionquery, [lookupData], (err, result) => {
                    if (err) {
                        console.error('Error inserting lookup values into answer_option:', err);
                        return res.status(500).json({ error: 'Failed to insert lookup values into answer_option' });
                    }

                    return res.status(200).json({
                        message: 'Lookup values inserted successfully',
                        lookupId, lookup
                    });
                })

            }
        });

    } catch (error) {
        console.error('Error while inserting lookup values:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

}


const getAllLookups = async (req, res) => {
    try {
        const query = `
            SELECT 
                DISTINCT ao.LOOKUP, 
                ak.KEY 
            FROM answer_option ao
            JOIN answer_key ak ON ao.LOOKUP = ak.ID
            ORDER BY ak.KEY ASC
        `;

        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching lookup values:', err);
                return res.status(500).json({ error: 'Failed to fetch lookup values' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No lookup values found' });
            }

            const lookupValues = results.map(result => ({
                lookupId: result.LOOKUP,
                key: result.KEY
            }));

            res.status(200).json({
                lookupValues: lookupValues
            });
        });
    } catch (error) {
        console.error('Error while fetching lookup values:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



const deleteLookup = async (req, res) => {

    const { lookupId } = req.params;

    if (!lookupId) {
        return res.status(400).json({ error: 'Lookup Id not found' });
    }

    try {

        connection.beginTransaction((err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Error starting transaction' });
            }

            const deleteLookupOptionQuery = 'DELETE FROM answer_option WHERE LOOKUP = ?';
            connection.query(deleteLookupOptionQuery, [lookupId], (err) => {
                
                    if (err) {
                        console.error('Error deleting lookup options:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ error: 'Error deleting lookup options' });
                        });
                    }

                const deleteLookUpQuery = 'DELETE FROM answer_key WHERE ID = ?';
                    connection.query(deleteLookUpQuery, [lookupId], (err) => {
                        if (err) {
                            console.error('Error deleting lookup:', err);
                            return connection.rollback(() => {
                                res.status(500).json({ error: 'Error deleting lookup' });
                            });
                        }
                        connection.commit((err) => {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                return connection.rollback(() => {
                                    res.status(500).json({ error: 'Error committing transaction' });
                                });
                            }
                            res.status(200).json({
                                message: 'LookUp deleted successfully',
                            });
                        });
                    });
            })
        })


    } catch (error) {
        console.error('Error while deleting lookup values:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

}


const updateOption = async (req, res) => {

    const { optionId } = req.params
    const { newOptionText, lookupId } = req.body;

    if (!newOptionText) {
        console.error('Missing required fields:', error);
        return res.status(400).json({ error: 'Missing required fields' });
    }


    try {

        if (optionId) {
            const updateQuery = 'UPDATE answer_option SET option_text = ? WHERE ID = ?';
            connection.query(updateQuery, [newOptionText, optionId], (err, result) => {
                if (err) {
                    console.error('Error updating option:', err);
                    return res.status(500).json({ error: 'Failed to update option' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: `No options found for the given lookup value: ${optionId}` });
                }

                res.status(200).json({
                    message: `Successfully updated option for lookup: ${optionId}`,
                    updatedData: {
                        newOptionText
                    }
                });
            });
        } else {

            const insertQuery = 'INSERT INTO answer_option (LOOKUP, option_text) VALUES (?, ?)';
            connection.query(insertQuery, [lookupId, newOptionText], (err, result) => {
                if (err) {
                    console.error('Error adding option:', err);
                    return res.status(500).json({ error: 'Failed to add new option' });
                }

                const optionId = result.insertId;

                res.status(201).json({
                    message: `Successfully added new option for lookupId: ${lookupId}`,
                    newOptionData: { optionText: newOptionText, optionId: optionId }
                });
            });

        }




    } catch (error) {
        console.error('Error during update operation:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteOption = async (req, res) => {

    const { optionId } = req.params

    if (!optionId) {
        return res.status(400).json({ error: 'Option ID is required' });
    }

    try {

        const deleteQuery = `
            DELETE FROM answer_option
            WHERE ID = ?`;

        connection.query(deleteQuery, [optionId], (err, result) => {
            if (err) {
                console.error('Error deleting option:', err);
                return res.status(500).json({ error: 'Failed to delete option' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: `No option found with ID: ${optionId}` });
            }

            res.status(200).json({
                message: `Successfully deleted option with ID: ${optionId}`,
            });
        });
    } catch (error) {
        console.error('Error during delete operation:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const updateLookupById = async (req, res) => {
    const { lookupId, newlookup } = req.body;

    if (!lookupId || !newlookup) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {

        const updateLookupQuery = 'UPDATE answer_key SET `KEY` = ? WHERE ID = ?';

        connection.query(updateLookupQuery, [newlookup, lookupId], (err, result) => {
            if (err) {
                console.error('Error updating LOOKUP in answer_key:', err);
                return res.status(500).json({ error: 'Failed to update lookup' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'LookUp not found' });
            }

            res.status(200).json({
                message: 'Lookup updated successfully',
                lookupId: lookupId,
                key: newlookup
            });
        });


    } catch (error) {
        console.error('Error while processing request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getLookupOptionsById = async (req, res) => {
    const { lookupId } = req.params;

    if (!lookupId) {
        return res.status(400).json({ error: 'Missing lookupId parameter' });
    }

    try {

        const query = `
            SELECT 
                ao.ID, 
                ao.LOOKUP, 
                ao.option_text, 
                ak.KEY,
                ak.ID as lookupId 
            FROM answer_option ao
            JOIN answer_key ak ON ao.LOOKUP = ak.ID
            WHERE ao.LOOKUP = ?
            ORDER BY ao.option_text
        `;

        connection.query(query, [lookupId], (err, results) => {
            if (err) {
                console.error('Error fetching lookups by ID:', err);
                return res.status(500).json({ error: 'Failed to fetch lookups' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No lookup values found for the specified lookupId' });
            }

            const groupedLookups = {};

            results.forEach(result => {
                const { LOOKUP, KEY, ID, option_text, lookupId } = result;

                if (!groupedLookups[LOOKUP]) {
                    groupedLookups[LOOKUP] = { key: KEY, lookupId: lookupId, options: [] };
                }

                groupedLookups[LOOKUP].options.push({
                    optionId: ID,
                    optionText: option_text
                });
            });

            Object.keys(groupedLookups).forEach(lookup => {
                groupedLookups[lookup].options.sort((a, b) => a.optionText.localeCompare(b.optionText));
            });

            const formattedLookups = Object.keys(groupedLookups).map(lookup => ({
                lookup: groupedLookups[lookup].key,
                lookupId: groupedLookups[lookup].lookupId,
                options: groupedLookups[lookup].options
            }));

            res.status(200).json({
                lookups: formattedLookups
            });
        });
    } catch (error) {
        console.error('Error while fetching lookups by ID:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



export { createLookupValues, getAllLookups, deleteLookup, updateOption, deleteOption, updateLookupById, getLookupOptionsById }