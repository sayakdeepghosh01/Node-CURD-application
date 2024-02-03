//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000

//databse connection:
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;

db.on("error", (err)=> console.log(err));
db.once("open",()=> console.log("connected to the database!!"));


//middleWares:
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(session({
    secret: 'My secret key',
    saveUninitialized: true,
    resave: false
}));

//
app.use((req, res, next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

//mid for image
app.use(express.static('uploads'));
//templete engine
app.set('view engine', 'ejs');


// app.get('/',(req, res)=>{
//     res.send('hello world')
// });

//router connection prefix

app.use("",require('./routes/routes'))

app.listen(PORT, ()=>{
    console.log(`Server started at http://localhost:${PORT}`);

}) 