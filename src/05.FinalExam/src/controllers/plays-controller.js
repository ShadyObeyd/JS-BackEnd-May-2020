const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const Play = require('../models/play');
const jwt = require('jsonwebtoken');

const createPlay = async (req, res) => {
    let { title, description, imageUrl, isPublic } = req.body;

    if (title.length < 1) {
        res.redirect('/create-theater?error=Title cannot be empty!');
        return;
    }

    if (description.length < 1) {
        res.redirect('/create-theater?error=Description cannot be empty!');
        return;
    }

    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('https')) {
        res.redirect('/create-theater?error=Invalid image url!');
        return;
    }

    let public = false;

    if (isPublic) {
        public = true;
    }

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);
    let userId = info.userId;

    let play = new Play({
        title,
        description,
        imageUrl,
        isPublic: public,
        creatorId: userId,
        createdAt: new Date().toLocaleString()
    });

    await play.save();

    res.redirect('/');
}

const getTopThreePublicPlaysByLikesCount = async () => {
    let plays = await Play.find().lean();

    let result = plays.filter(p => p.isPublic).sort((a, b) => b.usersLiked.length - a.usersLiked.length).slice(0, 3);

    return result;
}

const getAllPublicPlaysByDate = async () => {
    let plays = await Play.find().lean();

    let result = plays.filter(p => p.isPublic).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return result;
}

const getPlayDetails = async (req, res) => {
    let playId = req.params.id;

    let play = await Play.findById(playId).lean();

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);
    let userId = info.userId;

    res.render('theater-details', {
        isLoggedIn: req.isLoggedIn,
        isCreator: play.creatorId == userId,
        liked: play.usersLiked.some(u => u._id == userId),
        ...play,
    });
}

const getEditPlay = async (req, res) => {
    let playId = req.params.id;

    let play = await Play.findById(playId).lean();

    res.render('edit-theater', {
        isLoggedIn: req.isLoggedIn,
        ...play,
        error: req.query['error']
    });
}

const editPlay = async (req, res) => {
    let { title, description, imageUrl, isPublic } = req.body;
    let playId = req.params.id;

    if (title.length < 1) {
        res.redirect(`/edit/${playId}?error=Title cannot be empty!`);
        return;
    }

    if (description.length < 1) {
        res.redirect(`/edit/${playId}?error=Description cannot be empty!`);
        return;
    }

    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('https')) {
        res.redirect(`/edit/${playId}?error=Invalid image url!`);
        return;
    }

    let public = false;

    if (isPublic) {
        public = true;
    }

    let updateObj = {
        title,
        description,
        imageUrl,
        isPublic: public
    };

    await Play.findByIdAndUpdate(playId, updateObj);

    res.redirect(`/details/${playId}`);
}

const deletePlay = async (req, res) => {
    let playId = req.params.id;

    await Play.findByIdAndDelete(playId);

    res.redirect('/');
}

const likePlay = async (req, res) => {
    let playId = req.params.id;

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);
    let userId = info.userId;

    
    await Play.findByIdAndUpdate(playId, {
        $addToSet: {
            usersLiked: [userId]
        }
    });

    res.redirect(`/details/${playId}`);
}

const sortPlaysByDate = async () => {
    let plays = await Play.find().lean();

    let result = plays.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return result;
}

const sortPlaysByLikes = async () => {
    let plays = await Play.find().lean();

    let result = plays.sort((a, b) => b.usersLiked.length - a.usersLiked.length);

    return result;
}

module.exports = {
    createPlay,
    getTopThreePublicPlaysByLikesCount,
    getAllPublicPlaysByDate,
    getPlayDetails,
    getEditPlay,
    editPlay,
    deletePlay,
    likePlay,
    sortPlaysByDate,
    sortPlaysByLikes
}