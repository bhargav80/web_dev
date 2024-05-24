const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser =require('cookie-parser');
const methodOverride = require('method-override');
const app = express();



app.use(express.static('public')); 
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');




const dbURI = 'mongodb+srv://bhargab:882253@cluster0.wvfszkv.mongodb.net/natours?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));


app.get('/',(req,res)=>
{
    res.render('home')
})

app.use(authRoutes);