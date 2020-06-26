const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const minLength = 5;
const pattern = /^[A-Za-z0-9]+$/;

const getUserStatus = (req, res, next) => {
    let token = req.cookies['authToken'];

    if (!token) {
        req.isLoggedIn = false;
    }

    try {
        let info = jwt.verify(token, config.privateKey);
        req.username = info.username;
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

const generateToken = (userId, username, res) => {
    jwt.sign({ userId: userId, username: username }, config.privateKey, (err, token) => {
        if (err) {
            console.log(err);
            return;
        }

        res.cookie('authToken', token);
        res.redirect('/');
    });
}

const registerUser = async (req, res) => {
    let { username, password, repeatPassword } = req.body;

    if (username.length < minLength) {
        res.redirect('/register?error=Username must be at least 5 characters long!');
        return;
    }

    if (!username.match(pattern)) {
        res.redirect('/register?error=Username can contain only English letters and digits!');
        return;
    }

    if (password < minLength) {
        res.redirect('/register?error=Password must be at least 5 characters long!');
        return;
    }

    if (!password.match(pattern)) {
        res.redirect('/register?error=Password can contain only English letters and digits!');
        return;
    }

    if (password !== repeatPassword) {
        res.redirect('/register?error=Password and repeat password do not match!');
        return;
    }

    let salt = await bcrypt.genSalt(saltRounds);
    let hash = await bcrypt.hash(password, salt);

    let user = new User({
        username,
        password: hash
    });

    await user.save();
    generateToken(user._id, user.username, res);
}

const loginUser = async (req, res) => {
    let { username, password } = req.body;

    if (username.length < minLength) {
        res.redirect('/login?error=Username must be at least 5 characters long!');
        return;
    }

    if (!username.match(pattern)) {
        res.redirect('/login?error=Username can contain only English letters and digits!');
        return;
    }

    if (password < minLength) {
        res.redirect('/login?error=Password must be at least 5 characters long!');
        return;
    }

    if (!password.match(pattern)) {
        res.redirect('/login?error=Password can contain only English letters and digits!');
        return;
    }

    let user = await User.findOne({ username });

    if (!user) {
        res.redirect('/login?error=Invalid username or password!');
        return;
    }

    let status = await bcrypt.compare(password, user.password);

    if (!status) {
        res.redirect('/login?error=Invalid username or password!');
        return;
    }

    generateToken(user._id, user.username, res);
}

module.exports = {
    getUserStatus,
    checkGuest,
    checkGuestJson,
    authorize,
    authorizeJson,
    registerUser,
    loginUser
}