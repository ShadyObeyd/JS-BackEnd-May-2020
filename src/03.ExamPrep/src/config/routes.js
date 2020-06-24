const { createUser,
    getUserStatus,
    checkGuest, checkGuestJson, authorize, authorizeJson, loginUser } = require('../controllers/users-controller');

const { getAllTripps, createTripp, getTrippDetails, joinTrip, deleteTripp } = require('../controllers/tripps-controller');

module.exports = (app) => {
    app.get('/', getUserStatus, (req, res) => {
        res.render('home', {
            title: 'Home',
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail
        });
    });

    app.get('/login', checkGuest, getUserStatus, (req, res) => {
        res.render('login', {
            title: 'Login',
            error: req.query['error'],
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail
        });
    });

    app.get('/register', checkGuest, getUserStatus, (req, res) => {
        res.render('register', {
            title: 'Register',
            error: req.query['error'],
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail
        });
    });

    app.post('/register', checkGuestJson, async (req, res) => {
        await createUser(req, res);
    });

    app.post('/login', checkGuestJson, async (req, res) => {
        await loginUser(req, res);
    });

    app.get('/logout', authorize, (req, res) => {
        res.clearCookie('authToken');
        res.redirect('/');
    });

    app.get('/sharedTripps', authorize, getUserStatus, async (req, res) => {

        let tripps = await getAllTripps();

        res.render('sharedTripps', {
            title: 'Shared Tripps',
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail,
            tripps
        });
    });

    app.get('/offerTripp', authorize, getUserStatus, (req, res) => {
        res.render('offerTripp', {
            title: 'Offer Tripp',
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail,
            error: req.query['error']
        });
    });

    app.post('/offerTripp', authorizeJson, async (req, res) => {
        await createTripp(req, res);
    });

    app.get('/details/:id', authorize, getUserStatus, async (req, res) => {
        await getTrippDetails(req, res);
    });

    app.get('/joinTripp/:id', authorizeJson, async (req, res) => {
        await joinTrip(req, res);
    });

    app.get('/deleteTripp/:id', authorizeJson, async (req, res) => {
        await deleteTripp(req, res);
    });

    app.all('*', getUserStatus, (req, res) => {
        res.render('404', { 
            title: 'Not Found',
            isLoggedIn: req.isLoggedIn,
            loggedEmail: req.loggedEmail
        });
    });
};