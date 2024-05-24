const mongoose = require('mongoose')
const Book = require('./Books');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema;


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    
    email:
    {
        type: String,
        required: true

    },

    password:
    {
        type: String,
        required:true
    },
    booksLent: [{ type: Schema.Types.ObjectId, ref: 'Book' ,
    lendedAt:{
        type:Date,
        default: Date.now
    }
}]
    
});


userSchema.pre('save', async function (next) {

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// static method to login user

userSchema.statics.login = async function(email,password){
    const user = await this.findOne({email})
    if(user)
    {
        const auth = await bcrypt.compare(password,user.password);
        if(auth)
        {
            return user;
        }
        throw Error ('incorrect password');
    }
    throw Error('incorrect email')
}
/*
userSchema.statics.addBook = async function(userId, bookId) {
    try {
        // Find the user by ID
        const user = await this.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Add the book's ID to the user's booksLent array
        user.borrowedBooks.push(bookId);

        // Save the updated user object
        await user.save();

        return { success: true, message: 'Book added to user successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
*/
userSchema.methods.addBook = async function(bookId) {
    try {
        // Add the book's ID to the student's booksLent array
        this.booksLent.push(bookId);

        // Save the updated student object
        await this.save();

        return { success: true, message: 'Book added to student successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
userSchema.methods.removeBook = async function(bookId) {
    try {
        // Remove the book's ID from the student's booksLent array
        this.booksLent = this.booksLent.filter(id => id.toString() !== bookId.toString());

        // Save the updated student object
        await this.save();

        return { success: true, message: 'Book removed from student successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

userSchema.methods.calculateFine=  function () {
   
    const finePerDay = 1;
    const maxLendingDays = 1;
    let totalFine = 0;

    this.booksLent.forEach(lentBook=>{
        const lendedAt = lentBook.lendedAt;
        const currentDate = new Date();
        const daysLent = Math.floor((currentDate - lendedAt)/(1000 * 60 * 60 * 24));
        if (daysLent > maxLendingDays) {
            totalFine += (daysLent - maxLendingDays) * finePerDay;
        }
    })
    return totalFine;
}
const User= mongoose.model('user5', userSchema);

module.exports = User;