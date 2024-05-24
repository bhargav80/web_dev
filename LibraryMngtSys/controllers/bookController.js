const books = require('../models/Books');
const Admin = require('../models/Admin')
const jwt = require('jsonwebtoken');

module.exports.addBook = async(req,res)=>
{
    try {
        const {title,author,quantity} = req.body;
        const book = await books.create({title,author,quantity});
        res.redirect('/admin-dashboard')
        
    } catch (error) {
        res.status(400).json(error)
    }
    
}

module.exports.viewBooks = async(req,res)=>
{
    try {
        const Books = await books.find()
        res.locals.books = Books;
        res.render('ViewBooks');
    } catch (err) {
        console.error('Error fetching books:', err);
            res.status(500).send('Error fetching books');
    }
}

