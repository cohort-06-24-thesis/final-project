const { DonationItem, User, Category } = require("../Database/index.js")

module.exports = {
    createDonationItem: async (req, res) => {
        try {
            const { title, description, image, location, UserId, categoryId } = req.body
            const donationItem = await DonationItem.create({
                title,
                description,
                image,
                location,
                UserId,
                categoryId
            })
            res.status(201).json(donationItem)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    getAllDonationItems: async (req, res) => {
        try {
            const donationItems = await DonationItem.findAll({
                include: [
                  { model: User, attributes: ['id', 'name', 'email', 'rating', 'profilePic'] },
                  { model: Category, attributes: ['name'] }
                ]
            });
            res.status(200).json(donationItems);
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    getDonationItemById: async (req, res) => {
        try {
            const { id } = req.params
            const donationItem = await DonationItem.findByPk(id, {
                include: [{ model: User, attributes: ['id', 'name', 'email', 'rating', 'profilePic'] }]
            });
            if (!donationItem) {
                return res.status(404).json({ message: "Donation item not found" })
            }
            res.status(200).json(donationItem)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    updateDonationItem: async (req, res) => {
        try {
            const { id } = req.params
            const { title, description, image, location } = req.body
            const donationItem = await DonationItem.findByPk(id)
            if (!donationItem) {
                return res.status(404).json({ message: "Donation item not found" })
            }
            donationItem.title = title
            donationItem.description = description
            donationItem.image = image
            donationItem.location = location
            await donationItem.save()
            res.status(200).json(donationItem)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    deleteDonationItem: async (req, res) => {
        try {
            const { id } = req.params
            const donationItem = await DonationItem.findByPk(id)
            if (!donationItem) {
                return res.status(404).json({ message: "Donation item not found" })
            }
            await donationItem.destroy()
            res.status(200).json({ message: "Donation item deleted successfully" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    reserveDonationItem: async (req, res) => {
        try {
            const { id } = req.params
            const donationItem = await DonationItem.findByPk(id)
            if (!donationItem) {
                return res.status(404).json({ message: "Donation item not found" })
            }
            donationItem.status = 'reserved'
            await donationItem.save()
            res.status(200).json(donationItem)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    claimDonationItem: async (req, res) => {
        try {
            const { id } = req.params
            const donationItem = await DonationItem.findByPk(id)
            if (!donationItem) {
                return res.status(404).json({ message: "Donation item not found" })
            }
            donationItem.status = 'claimed'
            await donationItem.save()
            res.status(200).json(donationItem)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    getAvailableDonationItems: async (req, res) => {
        try {
            const donationItems = await DonationItem.findAll({
                where: {
                    status: 'available'
                }
            })
            res.status(200).json(donationItems)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    getReservedDonationItems: async (req, res) => {
        try {
            const donationItems = await DonationItem.findAll({
                where: {
                    status: 'reserved'
                }
            })
            res.status(200).json(donationItems)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    getClaimedDonationItems: async (req, res) => {
        try {
            const donationItems = await DonationItem.findAll({
                where: {
                    status: 'claimed'
                }
            })
            res.status(200).json(donationItems)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    getDonationItemsByLocation: async (req, res) => {
        try {
            const { location } = req.params
            const donationItems = await DonationItem.findAll({
                where: {
                    location: location
                }
            })
            res.status(200).json(donationItems)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    getDonationItemsByStatus: async (req, res) => {
        try {
            const { status } = req.params
            const donationItems = await DonationItem.findAll({
                where: {
                    status: status
                }
            })
            res.status(200).json(donationItems)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    getDonationItemsByTitle: async (req, res) => {
        try {
            const { title } = req.params
            const donationItems = await DonationItem.findAll({
                where: {
                    title: title
                }
            })
            res.status(200).json(donationItems)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    },

}