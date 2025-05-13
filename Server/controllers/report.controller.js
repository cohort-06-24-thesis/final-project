const {report} = require("../Database/index.js")


module.exports= {
    createReport: async (req, res) => {
    try {
        const createdReport = await report.create({
            reason: req.body.reason,
            userId: req.body.userId,
            itemId: req.body.itemId,
            itemType: req.body.itemType // <--- Add this
        });
        
        res.status(201).json(createdReport);
    } catch (error) {
        console.error('Error creating report:', error); // Log the detailed error
        res.status(500).json({
            message: error.message || "Some error occurred while creating the report."
        });
    }
},

// Get all reports
findAllReport: async (req, res) => {
    try {
        const reports = await report.findAll();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Some error occurred while retrieving reports."
        });
    }
},

// Get a single report by id
findOneReport: async (req, res) => {
    const id = req.params.id;
    try {
        const report = await report.findByPk(id);
        if (report) {
            res.status(200).json(report);
        } else {
            res.status(404).json({
                message: `Report with id=${id} not found`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message || "Error retrieving report with id=" + id
        });
    }
},

// Update a report by id
updateReport: async (req, res) => {
    const id = req.params.id;
    try {
        const num = await report.update(req.body, {
            where: { id: id }
        });
        if (num[0] === 1) {
            res.status(200).json({
                message: "Report was updated successfully."
            });
        } else {
            res.status(404).json({
                message: `Cannot update Report with id=${id}. Maybe Report was not found!`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message || "Error updating Report with id=" + id
        });
    }
},

// Delete a report by id
deleteReport: async (req, res) => {
    const id = req.params.id;
    try {
        const num = await report.destroy({
            where: { id: id }
        });
        if (num === 1) {
            res.status(200).json({
                message: "Report was deleted successfully!"
            });
        } else {
            res.status(404).json({
                message: `Cannot delete Report with id=${id}. Maybe Report was not found!`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message || "Could not delete Report with id=" + id
        });
    }}
};