const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    author:
    {
        type: String,
        required:true
    }
    ,
    quantity:
    {
        type: Number,
        required:true
    }
});

bookSchema.methods.decrement = async function(bookId) {
    try {
        // Add the book's ID to the student's booksLent array
        this.quantity = this.quantity - 1;

        // Save the updated student object
        await this.save();

        return { success: true, message: 'Book added to student successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

bookSchema.methods.increment = async function(bookId) {
    try {
        // Add the book's ID to the student's booksLent array
        this.quantity = this.quantity + 1;

        // Save the updated student object
        await this.save();

        return { success: true, message: 'Book added to student successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};



const Book= mongoose.model('book', bookSchema);

module.exports = Book;