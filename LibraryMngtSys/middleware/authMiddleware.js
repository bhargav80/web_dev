const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/User')


const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    //check json web token exits and is verified
    if (token) {
        jwt.verify(token, 'mysecret', (err, decodedToken) => {
            if (err) {
                console.log(err.message)
                res.redirect('/admin-login')
            }
            else {
                console.log(decodedToken);
                next();
            }
        });
    }
    else {
        res.redirect('/admin-login');
    }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token)
    {
        jwt.verify(token, 'mysecret', async(err, decodedToken) => {
            if (err) {
                console.log(err.message)
                res.locals.user = null;
                next();
            }
            else {
                console.log(decodedToken);
                let user = await Admin.findById(decodedToken.id);
                res.locals.admin = user;
                next();
            }
        });
    }
    else
    {
        res.locals.user = null;
        next();
    }
}

module.exports =  requireAuth;

