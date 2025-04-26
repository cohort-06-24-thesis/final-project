const {Category} = require("../Database/index.js")

module.exports={
    createCategory:async(req,res)=>{
        try {
            const {name}=req.body
            const category=await Category.create({
                name
            })
            res.status(201).json(category)
        } catch (error) {
            console.log(error)
            res.status(500).json({message:"Internal server error"})
        }
    },
    getAllCategories:async(req,res)=>{
        try {
            const categories=await Category.findAll()
            res.status(200).json(categories)
        } catch (error) {
            console.log(error)
            res.status(500).json({message:"Internal server error"})
        }
    },
    getCategoryById:async(req,res)=>{
        try {
            const {id}=req.params
            const category=await Category.findByPk(id)
            if(!category){
                return res.status(404).json({message:"Category not found"})
            }
            res.status(200).json(category)
        } catch (error) {
            console.log(error)
            res.status(500).json({message:"Internal server error"})
        }
    },
    updateCategory:async(req,res)=>{
        try {
            const {id}=req.params
            const {name}=req.body
            const category=await Category.findByPk(id)
            if(!category){
                return res.status(404).json({message:"Category not found"})
            }
            category.name=name
            await category.save()   
            res.status(200).json(category)
        } catch (error) {
            console.log(error)
            res.status(500).json({message:"Internal server error"})
        }
    },
    deleteCategory:async(req,res)=>{
        try {
            const {id}=req.params
            const category=await Category.findByPk(id)
            if(!category){
                return res.status(404).json({message:"Category not found"})
            }
            await category.destroy()
            res.status(204).json()
        } catch (error) {
            console.log(error)
            res.status(500).json({message:"Internal server error"})
        }
    },
    getCategoryByName:async(req,res)=>{
        try {
            const {name}=req.params
            const category=await Category.findOne({where:{name}})
            if(!category){
                return res.status(404).json({message:"Category not found"})
            }
            res.status(200).json(category)
        } catch (error) {
            console.log(error)
            res.status(500).json({message:"Internal server error"})
        }
    },
    getCategoryByDonationItemId:async(req,res)=>{
        try {
            const {id}=req.params
            const category=await Category.findOne({where:{donationItemId:id}})
            if(!category){
                return res.status(404).json({message:"Category not found"})
            }
            res.status(200).json(category)
        } catch (error) {
            console.log(error)
            res.status(500).json({message:"Internal server error"})
        }
    }
}