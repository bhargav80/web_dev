const { Router } = require('express')
const authController = require('../controllers/authControllers');
const bookController = require('../controllers/bookController');
const requireAuth = require('../middleware/authMiddleware');
const {requireAuthStudent,checkUser} = require('../middleware/authStudent');

const studentController = require('../controllers/studentController');
const Book = require('../models/Books');
const router = Router()

//for admin
router.get('/admin-login', authController.admin_login);
router.post('/admin-signup', authController.admin_signup)
router.get('/admin-dashboard', requireAuth, authController.admin_dashboard)
router.post('/admin-login', authController.admin_login_post)

//for books
router
    .get('/add-book', (req, res) => {
        res.render('addBook');
    })
    .post('/add-book', bookController.addBook)

    .get('/view-books', bookController.viewBooks)
    .delete('/books/delete/:id', async (req, res) => {

        try {
            await Book.deleteOne({ _id: req.params.id })
            res.redirect('/view-books');
        } catch (error) {
            console.error('Error deleting book:', error);
            res.status(500).json({ error: 'An error occurred while deleting the book' });
        }
    });

    router.get("/manage-users",requireAuth,authController.manageUsers)
            .get("/profile/:id",requireAuth,authController.viewProfile)


//for student    
router
    .get('/student-menu', (req, res) => {
        res.render('student_menu');
    })

    .get('/student/signup', (req, res) => {
        res.render('student_signup');
    })



    .post('/student/signup', studentController.student_signup)

    .get('/student_dashboard', requireAuthStudent,checkUser, (req, res) => {
        res.render('student_dashboard');
    })

    .get('/student/login', (req, res) => {
        res.render('student_login');
    })

    .post('/student/login',studentController.student_login)
    .get('/student/view-books',requireAuthStudent, studentController.viewBooks)
    .patch('/student/addBook/:bookId',studentController.addBooks)
    .get('/student/lendedBooks',studentController.viewLendedBooks)
    .delete('/student/books/remove/:bookId',studentController.removeBook)
    .get('/student/edit/profile',requireAuthStudent,checkUser, (req, res) => {
        res.render('edit_profile.ejs');
    })
    .patch('/student/edit/profile',studentController.editProfile);
module.exports = router