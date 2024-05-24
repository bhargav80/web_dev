const Student = require('../models/User');
const jwt = require('jsonwebtoken');
const books = require('../models/Books');
const Book = require('../models/Books');
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'mysecret', {
        expiresIn: maxAge
    })
};

module.exports.student_signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const student = await Student.create({ name, email, password });
        const token = createToken(student.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        console.log(token);
        //res.locals.student = student
        // Redirect to student_dashboard with student ID as query parameter
        //res.render(`student_dashboard`,{student});
        res.redirect('/student_dashboard')
    } catch (error) {
        res.status(400).json(error);
    }
}

module.exports.student_login = async(req,res)=>
{
    const {email,password} = req.body;
    try {
        const student= await Student.login(email, password);
        const token = createToken(student.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        console.log(student)
        res.redirect('/student_dashboard');
        //res.status(200).json({ student: student._id });
        
    } catch (err) {
        
        res.status(400).json({err})
    }
}

module.exports.viewBooks = async(req,res)=>
{
    try {
        const Books = await books.find()
        res.locals.books = Books;
        res.render('student_book_menu');
    } catch (err) {
        console.error('Error fetching books:', err);
            res.status(500).send('Error fetching books');
    }
}

module.exports.addBooks = async (req,res)=>
{
    const {bookId} = req.params;
    try {
        const book = await Book.findById(bookId);
        if(!book)
        {
            return res.status(404).json({error:'Book not found'});
        }
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
                    //console.log(decodedToken);
                    let student = await Student.findById(decodedToken.id);
                    res.locals.student = student;

                   const result = await student.addBook(book._id);
                   await book.decrement(book._id);
                   if (result.success) {
                    return res.status(200).json({ message: result.message });
                } else {
                    return res.status(400).json({ error: result.message });
                }
                   //console.log(student._id,book._id)
                    
                }
            });
        }
    } catch (error) {
        
    }
}



module.exports.viewLendedBooks = async (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'mysecret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
            } else {
                try {
                    // Find the student using the decoded token
                    const user = await Student.findById(decodedToken.id);
                    if (!user) {
                        throw new Error('User not found');
                    }

                    // Get the IDs of books lent by the user
                    const bookIds = user.booksLent;

                    // Find the books with the IDs in bookIds array
                    const books = await Book.find({ _id: { $in: bookIds } });
                    const fine = user.calculateFine();
                    
                    res.locals.student = user;
                    res.locals.books = books;
                    res.locals.fine = fine;
                    res.render('lendedBooks')

                    // Render your view or send JSON response with books data
                    // res.render('view_lended_books', { student: user, books });
                    // Or send JSON response if using API
                    // res.status(200).json({ student: user, books });
                } catch (error) {
                    console.error(error);
                    res.locals.user = null;
                }
            }
        });
    } else {
        res.locals.user = null;
    }
};

module.exports.removeBook = async(req,res)=>
{
    const {bookId} = req.params;
    try {
        const book = await Book.findById(bookId);
        console.log("From remove book",book.id)
        const token = req.cookies.jwt;
        if(token)
        {
            jwt.verify(token, 'mysecret', async(err, decodedToken) => {
                if (err) {
                    console.log(err.message)
                    
                    next();
                }
                else {
                    //console.log(decodedToken);
                    let student = await Student.findById(decodedToken.id);
                  
                   const result = await student.removeBook(book._id);
                   await book.increment(book._id);
                   if (result.success) {
                    res.redirect('/student_dashboard');
                } else {
                    return res.status(400).json({ error: result.message });
                }
                   //console.log(student._id,book._id)
                    
                }
            });
        }
    } catch (error) {
        
    }
}


module.exports.editProfile = async (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'mysecret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.student = null;
            } else {
                try {
                    // Find the student using the decoded token
                    const student = await Student.findById(decodedToken.id);
                    if (!student) {
                        throw new Error('Student not found');
                    }

                    // Update the student's profile
                    student.name = req.body.name;
                    student.email = req.body.email;
                    student.password = req.body.password; // Consider hashing the password

                    // Save the updated student
                    await student.save();

                    res.locals.student = student;
                    res.redirect('/student_dashboard'); // Redirect to dashboard or any other page

                } catch (error) {
                    console.error(error);
                    res.locals.student = null;
                }
            }
        });
    } else {
        res.locals.student = null;
    }
};