const { getUserStatus, checkGuest, checkGuestJson,
    authorize, authorizeJson, registerUser, loginUser } = require('../controllers/users-controller');

const { createCourse, getTopThreeCourses, getAllPublicCourses, getCourseWithUsersById,
    enrollInCourse, getEditView, editCourse, deleteCourse, search } = require('../controllers/courses-controller');

module.exports = (app) => {
    app.get('/', getUserStatus, async (req, res) => {
        let isLoggedIn = req.isLoggedIn;
        if (isLoggedIn) {
            let courses = await getAllPublicCourses();

            res.render('home-user', {
                isLoggedIn,
                username: req.username,
                courses,
                error: req.query['error'],
            });
        } else {
            let courses = await getTopThreeCourses();

            res.render('home-guest', {
                isLoggedIn,
                courses,
                error: req.query['error'],
            });
        }
    });

    app.get('/register', checkGuest, getUserStatus, (req, res) => {
        res.render('register', {
            isLoggedIn: req.isLoggedIn,
            username: req.username,
            error: req.query['error'],
        });
    });

    app.get('/login', checkGuest, getUserStatus, (req, res) => {
        res.render('login', {
            isLoggedIn: req.isLoggedIn,
            username: req.username,
            error: req.query['error'],
        });
    });

    app.post('/register', checkGuestJson, async (req, res) => {
        await registerUser(req, res);
    });

    app.post('/login', checkGuestJson, async (req, res) => {
        await loginUser(req, res);
    });

    app.get('/logout', authorizeJson, (req, res) => {
        res.clearCookie('authToken');
        res.redirect('/');
    });

    app.get('/course-create', authorize, getUserStatus, (req, res) => {
        res.render('course-create', {
            isLoggedIn: req.isLoggedIn,
            username: req.username
        });
    });

    app.post('/course-create', authorizeJson, async (req, res) => {
        await createCourse(req, res);
    });

    app.get('/details/:id', authorize, getUserStatus, async (req, res) => {
        await getCourseWithUsersById(req, res);
    });

    app.get('/enroll/:id', authorizeJson, async (req, res) => {
        await enrollInCourse(req, res);
    });

    app.get('/course-edit/:id', authorize, getUserStatus, async (req, res) => {
        await getEditView(req, res);
    });

    app.post('/course-edit/:id', authorizeJson, async (req, res) => {
        await editCourse(req, res);
    });

    app.get('/course-delete/:id', authorizeJson, async (req, res) => {
        await deleteCourse(req, res);
    });

    app.post('/search', authorizeJson, getUserStatus, async (req, res) => {
        await search(req, res);
    });
}