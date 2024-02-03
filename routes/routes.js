const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer'); // for image uploading


//imaage upload

var storage = multer.diskStorage({
    destination: function(req, res, cb){
        cb(null, './uploads')
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    }
}) 

//middleware for image upload
var upload = multer({
    storage: storage,
}).single('image');

//post route  for incerting data
router.post('/add', upload, async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    try {
        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


router.get('/',(req,res)=>{
    res.render("index", {title: "Home Page"})
});
// router.get('/users', (req, res)=>{
//     // res.send("Home Page");
//     res.render('index',{ title : 'Home Page'})
// });

//router for add nw users
router.get('/add', (req,res)=>{
    // res.send("Add New Users")
    res.render("add_users", {title: "Add Users"});
})

module.exports = router;