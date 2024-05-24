const jwt = require('jsonwebtoken');

const Student = require('../models/User')


const requireAuthStudent = (req, res, next) => {
    const token = req.cookies.jwt;
    //check json web token exits and is verified
    if (token) {
        jwt.verify(token, 'mysecret', (err, decodedToken) => {
            if (err) {
                console.log(err.message)
                res.redirect('/student-menu')
            }
            else {
                console.log(decodedToken);
                next();
            }
        });
    }
    else {
        res.redirect('/student-menu');
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
                let user = await Student.findById(decodedToken.id);
                res.locals.student = user;
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

module.exports =  {requireAuthStudent,checkUser};

