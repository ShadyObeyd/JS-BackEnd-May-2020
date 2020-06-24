const Tripp = require('../models/tripp');
const destinationPattern = /^[A-Za-z ]{4,} - [A-Za-z ]{4,}$/;
const dateTimePattern = /^[A-Za-z0-9.: ]{6,} - [A-Za-z0-9.: ]{6,}$/;
const jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const { getUserById } = require('./users-controller');

const getAllTripps = async () => {
    let tripps = await Tripp.find().lean();

    return tripps;
}

const createTripp = async (req, res) => {
    let { destination, dateTime, carImage, seats, description } = req.body;

    if (!destination.match(destinationPattern)) {
        res.redirect('/offerTripp?error=Start and end point should be separated by space dash and space ( - ) and both need to be at least 4 characters long!');
        return;
    }

    if (!dateTime.match(dateTimePattern)) {
        res.redirect('/offerTripp?error=Date and Time should be separated by space dash and space ( - ) and both need to be at least 6 characters long!');
        return;
    }

    if (!carImage.startsWith('http://') && !carImage.startsWith('https://')) {
        res.redirect('/offerTripp?error=Invalid car image url!');
        return;
    }

    if (seats < 1) {
        res.redirect('/offerTripp?error=Must have at least 1 available seat!');
        return;
    }

    if (description.length < 10) {
        res.redirect('/offerTripp?error=Description must be at least 10 characters long!');
        return;
    }
    let destinationTokens = destination.split(' - ');

    let startPoint = destinationTokens[0];
    let endPoint = destinationTokens[1];

    let dateTimeTokens = dateTime.split(' - ');

    let date = dateTimeTokens[0];
    let time = dateTimeTokens[1];

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);

    let tripp = new Tripp({
        startPoint,
        endPoint,
        date,
        time,
        seats,
        description,
        carImage,
        creatorId: info.userId
    });

    await tripp.save();

    res.redirect('/sharedTripps');
}

const getTrippWithBuddiesById = async (trippId) => {
    let tripp = await Tripp.findById(trippId).populate('buddies').lean();

    return tripp;
}

const getTrippDetails = async (req, res) => {
    let trippId = req.params.id;

    if (!trippId) {
        res.render('404', {
            title: 'Not Found',
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail
        });

        return;
    }

    let tripp = await getTrippWithBuddiesById(trippId);

    if (!tripp) {
        res.render('404', {
            title: 'Not Found',
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail
        });

        return;
    }

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);

    let isOwner = tripp.creatorId == info.userId;

    let areAvailableSeats = tripp.seats > tripp.buddies.length;

    let alreadyJoined = tripp.buddies.some(b => b._id == info.userId);

    let driver = await getUserById(tripp.creatorId);

    let buddies = tripp.buddies.map(b => b.email).join(', ');

    res.render('trippDetails', {
        title: 'Details',
        isOwner,
        areAvailableSeats,
        alreadyJoined,
        ...tripp,
        availableSeats: tripp.seats - tripp.buddies.length,
        driverEmail: driver.email,
        isLoggedIn: req.isLoggedIn,
        loggedEmail: req.loggedEmail,
        buddies
    });
}

const joinTrip = async (req, res) => {
    let trippId = req.params.id;

    if (!trippId) {
        res.render('404', {
            title: 'Not Found',
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail
        });

        return;
    }

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);

    let tripp = await getTrippWithBuddiesById(trippId);

    if (tripp.buddies.some(b => b._id == info.userId)) {
        res.redirect(`/details/${trippId}`);
        return;
    }

    await Tripp.findByIdAndUpdate(trippId, {
        $addToSet:{
            buddies: [info.userId]
        }
    });
    
    res.redirect(`/details/${trippId}`);
}

const deleteTripp = async (req, res) => {
    let trippId = req.params.id;

    if (!trippId) {
        res.render('404', {
            title: 'Not Found',
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail
        });

        return;
    }

    await Tripp.findByIdAndDelete(trippId);

    res.redirect('/sharedTripps');
}

module.exports = {
    getAllTripps,
    createTripp,
    getTrippDetails,
    joinTrip,
    deleteTripp
}