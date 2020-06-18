const cubesController = require('../controllers/cube-controller');
const accessoriesController = require('../controllers/accessory-controller');
const usersController = require('../controllers/user-controller');

module.exports = (app) => {
    app.get('/', usersController.getUserStatus, async (req, res) => {
        let cubes = await cubesController.getAllCubes();

        res.render('index', {
            title: 'Cubes Workshop',
            cubes,
            isLoggedIn: req.isLoggedIn
        });
    });

    app.get('/about', usersController.getUserStatus, (req, res) => {
        res.render('about', {
            title: 'About',
            isLoggedIn: req.isLoggedIn
        });
    });

    app.get('/create', usersController.authorize, usersController.getUserStatus, (req, res) => {
        res.render('create', {
            title: 'Add Cube',
            isLoggedIn: req.isLoggedIn,
            error: req.query['error']
        });
    });

    app.post('/create', usersController.authorizeJson, async (req, res) => {
        await cubesController.saveCube(req, res);
    });

    app.get('/details/:id', usersController.getUserStatus, async (req, res) => {
        let id = req.params.id;

        let cube = await cubesController.getCubeById(id);
        let isOwnCube = cubesController.isOwnCube(req, cube);
        res.render('details', {
            title: 'Details',
            ...cube,
            isLoggedIn: req.isLoggedIn,
            isOwnCube
        });
    });

    app.get('/create/accessory', usersController.authorize, usersController.getUserStatus, (req, res) => {
        res.render('createAccessory', {
            title: 'Create Accessory',
            isLoggedIn: req.isLoggedIn,
            error: req.query['error']
        });
    })

    app.post('/create/accessory', usersController.authorizeJson, async (req, res) => {
        await accessoriesController.saveAccessory(req, res);
    })

    app.get('/attach/accessory/:id', usersController.authorize, usersController.getUserStatus, async (req, res) => {
        let id = req.params.id;

        let cube = await cubesController.getCubeById(id);

        let accessories = await accessoriesController.getAllAccessories();

        res.render('attachAccessory', {
            title: 'Attach Accessory',
            ...cube,
            accessories,
            isLoggedIn: req.isLoggedIn
        });
    });

    app.post('/attach/accessory/:id', usersController.authorizeJson, async (req, res) => {
        let cubeId = req.params.id;
        let accessoryId = req.body.accessory;

        await cubesController.attachAccessoryToCube(cubeId, accessoryId);

        res.redirect(`/details/${cubeId}`);
    });

    app.get('/register', usersController.checkGuest, usersController.getUserStatus, (req, res) => {

        res.render('register', { 
            title: 'Register',
            isLoggedIn: req.isLoggedIn,
            error: req.query['error']
        });
    });

    app.post('/register', usersController.checkGuestJson, async (req, res) => {
        await usersController.createUser(req, res);
    });

    app.get('/login', usersController.checkGuest, usersController.getUserStatus, (req, res) => {
        res.render('login', { 
            title: 'Login',
            isLoggedIn: req.isLoggedIn,
            error: req.query['error']
        });
    });

    app.post('/login', usersController.checkGuestJson, async (req, res) => {
        await usersController.loginUser(req, res);
    });

    app.get('/edit/:id', usersController.authorize, usersController.getUserStatus, async (req, res) => {
        let id = req.params.id;
        let cube = await cubesController.getCubeById(id);

        let levels = {
            1: 'Very Easy',
            2: 'Easy',
            3: 'Medium (Standard 3x3)',
            4: 'Intermediate',
            5: 'Expert',
            6: 'Hardcore'
        };

        let difficultyLevelAsText = levels[cube.difficultyLevel];

        res.render('editCube', {
            title: 'Edit Cube',
            ...cube,
            difficultyLevelAsText,
            isLoggedIn: req.isLoggedIn
        });
    });

    app.post('/edit/:id', usersController.authorizeJson, async (req, res) => {

        let id = req.params.id;
        let { name,
            description,
            imageUrl,
            difficultyLevel } = req.body;

        await cubesController.editCube(id, name, description, imageUrl, difficultyLevel);

        res.redirect(`/details/${id}`);
    });

    app.get('/delete/:id', usersController.authorize, usersController.getUserStatus, async (req, res) => {
        let id = req.params.id;
        let cube = await cubesController.getCubeById(id);

        let levels = {
            1: 'Very Easy',
            2: 'Easy',
            3: 'Medium (Standard 3x3)',
            4: 'Intermediate',
            5: 'Expert',
            6: 'Hardcore'
        };

        let difficultyLevelAsText = levels[cube.difficultyLevel];

        res.render('deleteCube', {
            title: 'Delete Cube',
            ...cube,
            difficultyLevelAsText,
            isLoggedIn: req.isLoggedIn
        });
    });

    app.post('/delete/:id', usersController.authorizeJson, async (req, res) => {
        let id = req.params.id;
        await cubesController.deleteCube(id);

        res.redirect('/');
    });

    app.get('/logout', usersController.authorize, async (req, res) => {
        res.clearCookie('authToken');
        res.redirect('/');
    });

    app.post('/search', (req, res) => {
        let { search, from, to } = req.body;
    });

    app.all('*', (req, res) => {
        res.render('404', { title: 'Not Found' });
    });
};