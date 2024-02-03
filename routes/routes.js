const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer'); // for image uploading
const fs = require('fs')

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

//get all users route

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.render('index', { title: 'Home Page', users: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
    //res.render("index", {title: "Home Page"})
    
// router.get('/users', (req, res)=>{
//     // res.send("Home Page");
//     res.render('index',{ title : 'Home Page'})
// });

//router for add nw users
router.get('/add', (req,res)=>{
    // res.send("Add New Users")
    res.render("add_users", {title: "Add Users"});
})

// edit user route
router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const user = await User.findById(id).exec();

        if (user === null) {
            res.redirect('/');
        } else {
            res.render('edit_users', {
                title: 'Edit User',
                user: user,
            });
        }
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// update user route

router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    })
    .then((result) => {
        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        res.redirect('/');
    })
    .catch((err) => {
        res.json({ message: err.message, type: 'danger' });
    });
});

// datbase time out 
router.get('/', async (req, res) => {
    try {
        const users = await User.find().timeout(30000).exec();
        res.render('index', { title: 'Home Page', users: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

//Delete users route

router.get('/delete/:id', (req, res) => {
    let id = req.params.id;

    User.findByIdAndDelete(id)
        .then((result) => {
            // Check if the user has an image and delete it
            if (result.image !== '') {
                try {
                    fs.unlinkSync("./uploads/" + result.image);
                } catch (err) {
                    console.log(err);
                }
            }

            req.session.message = {
                type: 'success',
                message: 'User deleted successfully!',
            };
            res.redirect('/');
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });
});


module.exports = router;