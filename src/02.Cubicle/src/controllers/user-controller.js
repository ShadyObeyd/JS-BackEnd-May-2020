const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const createUser = async (req, res) => {
    let { username, password, repeatPassword } = req.body;

    if (password !== repeatPassword) {
        res.render('register', { title: 'Register' });
        return;
    }

    let salt = await bcrypt.genSalt(saltRounds);
    let hash = await bcrypt.hash(password, salt);

    let user = new User({
        username,
        password: hash
    });

    await user.save((err) => {
        if (err) {
            console.log(err);
            return;
        }
    });

    jwt.sign({ userId: user._id, username: user.username }, config.privateKey, (err, token) => {
        if (err) {
            console.log(err);
            return;
        }

        res.cookie('authToken', token);
        res.redirect('/');
    });
};

const loginUser = async (req, res) => {
    let { username, password } = req.body;

    let user = await User.findOne({ username });

    if (!user) {
        res.render('login', { title: 'Login' });
        return;
    }

    let status = await bcrypt.compare(password, user.password);

    if (!status) {
        res.render('login', { title: 'Login' });
        return;
    }

    jwt.sign({ userId: user._id, username: user.username }, config.privateKey, (err, token) => {
        if (err) {
            console.log(err);
            return;
        }

        res.cookie('authToken', token);
        res.redirect('/');
    });
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

const checkGuest = (req, res, next) => {
    let token = req.cookies['authToken'];

    if (token) {
        res.redirect('/');
        return;
    }
    next();
};

const getUserStatus = (req, res, next) => {
    let token = req.cookies['authToken'];

    if (!token) {
        req.isLoggedIn = false;
    }

    try {
        jwt.verify(token, config.privateKey);
        req.isLoggedIn = true;
    } catch (e) {
        req.isLoggedIn = false;
    }

    next();
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

module.exports = {
    createUser,
    loginUser,
    authorize,
    checkGuest,
    getUserStatus,
    authorizeJson,
    checkGuestJson
}