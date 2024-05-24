const Admin = require('../models/Admin')
const User = require('../models/User')
const jwt = require('jsonwebtoken');
const Book = require('../models/Books')

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'mysecret', {
        expiresIn: maxAge
    })
};
const handleError = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' }


    //incorrect email
    if(err.message === 'incorrect email')
    {
        errors.email = 'that email is not registered'
    }

    //incorrect password
    if(err.message === 'incorrect password')
    {
        errors.password = 'that password is not correct'
    }

    //duplicate error code

    if (err.code === 11000) {
        errors.email = 'that email is already registered';
        return errors;
    }

    //validation errors

    if (err.message.includes('users2 validation failed')) {
        //console.log(Object.values(err.errors));
        Object.values(err.errors).forEach(({ properties }) => {
            //console.log(properties);
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}

module.exports.admin_login = (req,res)=>
{
    res.render('admin_login')
}

module.exports.admin_login_post = async(req,res)=>
{
    const { email, password } = req.body;

    try {
        const admin= await Admin.login(email, password);
        const token = createToken(admin.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        console.log(admin)
        res.status(200).json({ admin: admin._id });
    } catch (err) {
        const errors = handleError(err)
        res.status(400).json({errors})
    }
}

module.exports.admin_signup = async (req,res)=>{
    const {name, email, password } = req.body;
    try {
        const admin = await Admin.create({ name,email, password });
        const token = createToken(admin.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ admin })
    } catch (err) {

        
        const errors = handleError(err);
        res.status(400).json({ errors });
    }
}

module.exports.admin_dashboard = (req,res)=>
{
    res.render('admin-dashboard');
}

module.exports.manageUsers = async(req,res)=>
    {
        const Users = await User.find()
        res.locals.Users = Users
        res.render("manage-Users")
    }

module.exports.viewProfile = async(req,res)=>
{
    const user = await User.findById(req.params.id)
    const bookIds = user.booksLent
    const books = await Book.find({ _id: { $in: bookIds } });
    res.locals.books = books;
   
    try {
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
    
}