const { getUserStatus, checkGuest, checkGuestJson,
    authorize, authorizeJson, registerUser, loginUser } = require('../controllers/users-controller');

const { createPlay, getTopThreePublicPlaysByLikesCount, getAllPublicPlaysByDate, getPlayDetails,
    getEditPlay, editPlay, deletePlay, likePlay, sortPlaysByDate, sortPlaysByLikes } = require('../controllers/plays-controller');

module.exports = (app) => {
    app.get('/', getUserStatus, async (req, res) => {
        let isLoggedIn = req.isLoggedIn;

        if (isLoggedIn) {
            let plays = await getAllPublicPlaysByDate();

            res.render('user-home', {
                isLoggedIn,
                plays,
                error: req.query['error'],
            });
        } else {
            let plays = await getTopThreePublicPlaysByLikesCount();

            res.render('guest-home', {
                isLoggedIn,
                plays,
                error: req.query['error'],
            });
        }
    });

    app.get('/register', checkGuest, getUserStatus, (req, res) => {
        res.render('register', {
            isLoggedIn: req.isLoggedIn,
            error: req.query['error'],
        });
    });

    app.get('/login', checkGuest, getUserStatus, (req, res) => {
        res.render('login', {
            isLoggedIn: req.isLoggedIn,
            error: req.query['error'],
        });
    });

    app.get('/logout', authorizeJson, (req, res) => {
        res.clearCookie('authToken');
        res.redirect('/');
    });

    app.post('/register', checkGuestJson, async (req, res) => {
        await registerUser(req, res);
    });

    app.post('/login', checkGuestJson, async (req, res) => {
        await loginUser(req, res);
    });

    app.get('/create-theater', authorize, getUserStatus, async (req, res) => {
        res.render('create-theater', {
            isLoggedIn: req.isLoggedIn,
            error: req.query['error'],
        });
    });

    app.post('/create-theater', authorizeJson, async (req, res) => {
        await createPlay(req, res);
    });

    app.get('/details/:id', authorize, getUserStatus, async (req, res) => {
        await getPlayDetails(req, res);
    });

    app.get('/edit/:id', authorize, getUserStatus, async (req, res) => {
        await getEditPlay(req, res);
    });

    app.post('/edit/:id', authorizeJson, async (req, res) => {
        await editPlay(req, res);
    });

    app.get('/delete/:id', authorizeJson, async (req, res) => {
        await deletePlay(req, res);
    });

    app.get('/like/:id', authorizeJson, async (req, res) => {
        await likePlay(req , res);
    });

    app.get('/sort-by-date', authorize, getUserStatus, async (req, res) => {
        let plays = await sortPlaysByDate();

            res.render('user-home', {
                isLoggedIn: req.isLoggedIn,
                plays,
                error: req.query['error'],
            });
    });

    app.get('/sort-by-likes', authorize, getUserStatus, async (req, res) => {
        let plays = await sortPlaysByLikes();

            res.render('user-home', {
                isLoggedIn: req.isLoggedIn,
                plays,
                error: req.query['error'],
            });
    });
}