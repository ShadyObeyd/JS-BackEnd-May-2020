const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const emailPattern = /^[A-Za-z0-9]+@[a-z]+[.][a-z]{2,3}$/;

const createUser = async (req, res) => {
    let { email, password, repeatPassword } = req.body;

    if (!email.match(emailPattern)) {
        res.redirect('/register?error=Invalid email format!');
        return;
    }

    if (password.length < 6) {
        res.redirect('/register?error=Passowrd must be at least 6 characters long!');
        return;
    }

    if (password !== repeatPassword) {
        res.redirect('/register?error=Password and Repeat Password do not match!');
        return;
    }

    let existingUser = await User.findOne({ email });

    if (existingUser) {
        res.redirect('/register?error=Email is already taken!');
        return;
    }


    let salt = await bcrypt.genSalt(saltRounds);
    let hash = await bcrypt.hash(password, salt);

    let user = new User({
        email,
        password: hash
    });

    await user.save();

    jwt.sign({ userId: user._id, loggedEmail: user.email }, config.privateKey, (err, token) => {
        if (err) {
            console.log(err);
            return;
        }

        res.cookie('authToken', token);
        res.redirect('/');
    });
}

const loginUser = async (req, res) => {
    let { email, password } = req.body;

    if (!email.match(emailPattern)) {
        res.redirect('/login?error=Invalid email format!');
        return;
    }

    if (password.length < 6) {
        res.redirect('/login?error=Passowrd must be at least 6 characters long!');
        return;
    }

    let user = await User.findOne({ email });

    if (!user) {
        res.redirect('/login?error=Invalid email or password!');
        return;
    }

    let status = await bcrypt.compare(password, user.password);

    if (!status) {
        res.redirect('/login?error=Invalid email or password!');
        return;
    }

    jwt.sign({ userId: user._id, loggedEmail: user.email }, config.privateKey, (err, token) => {
        if (err) {
            console.log(err);
            return;
        }

        res.cookie('authToken', token);
        res.redirect('/');
    });
};

const getUserById = async (userId) => {
    let user = await User.findById(userId).lean();

    return user;
}

const getUserStatus = (req, res, next) => {
    let token = req.cookies['authToken'];

    if (!token) {
        req.isLoggedIn = false;
    }

    try {
        let info = jwt.verify(token, config.privateKey);
        req.loggedEmail = info.loggedEmail;
        req.isLoggedIn = true;
    } catch (e) {
        req.isLoggedIn = false;
    }

    next();
};

const checkGuest = (req, res, next) => {
    let token = req.cookies['authToken'];

    if (token) {
        res.redirect('/');
        return;
    }

    next();
};

const checkGuestJson = (req, res, next) => {
    let token = req.cookies['authToken'];

    if (token) {
        res.json({
            "error": "You are already Authorized!"
        });
        return;
    }
    next();
};

const authorize = (req, res, next) => {
    let token = req.cookies['authToken'];

    if (!token) {
        res.redirect('/');
        return;
    }

    try {
        jwt.verify(token, config.privateKey);
        next();
    } catch (e) {
        res.redirect('/');
    }
};

const authorizeJson = (req, res, next) => {
    let token = req.cookies['authToken'];

    if (!token) {
        res.json({
            "error": "Not Authorized!"
        });

        return;
    }

    try {
        jwt.verify(token, config.privateKey);
        next();
    } catch (e) {
        res.json({
            "error": "Not Authorized!"
        });
    }
};

module.exports = {
    createUser,
    getUserStatus,
    checkGuest,
    checkGuestJson,
    authorize,
    authorizeJson,
    loginUser,
    getUserById
}