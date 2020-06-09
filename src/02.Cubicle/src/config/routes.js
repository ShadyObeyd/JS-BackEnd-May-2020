const cubesController = require('../controllers/cube-controller');
const accessoriesController = require('../controllers/accessory-controller');

module.exports = (app) => {
    app.get('/', async (req, res) => {
        let cubes = await cubesController.getAllCubes();

        res.render('index', {
            title: 'Cubes Workshop',
            cubes
        });
    });

    app.get('/about', (req, res) => {
        res.render('about', { title: 'About' });
    });

    app.get('/create', (req, res) => {
        res.render('create', { title: 'Add Cube' });
    });

    app.post('/create', async (req, res) => {
        let { name,
            description,
            imageUrl,
            difficultyLevel } = req.body;

         await cubesController.saveCube(name, description, imageUrl, difficultyLevel);

        res.redirect('/');
    });

    app.get('/details/:id', async (req, res) => {
        let id = req.params.id;

        let cube = await cubesController.getCubeById(id);

        res.render('details', {
            title: 'Details',
            ...cube
        });
    });

    app.get('/create/accessory', (req, res) => {
        res.render('createAccessory', { title: 'Create Accessory' });
    })

    app.post('/create/accessory', async (req, res) => {
        let { name,
            description,
            imageUrl } = req.body;

        await accessoriesController.saveAccessory(name, description, imageUrl);

        res.redirect('/');
    })

    app.get('/attach/accessory/:id', async (req, res) => {
        let id = req.params.id;

        let cube = await cubesController.getCubeById(id);

        let allAccessories = await accessoriesController.getAllAccessories();
        let cubeAccessories = cube.accessories;
        console.log(accessories);

        res.render('attachAccessory', {
            title: 'Attach Accessory',
            ...cube,
            accessories
        });
    });

    app.post('/attach/accessory/:id', async (req, res) => {
        let cubeId = req.params.id;
        let accessoryId = req.body.accessory;

        await cubesController.attachAccessoryToCube(cubeId, accessoryId);

        res.redirect(`/details/${cubeId}`);
    });

    app.post('/search', (req, res) => {
        let { search, from, to } = req.body;
    });

    app.all('*', (req, res) => {
        res.render('404', { title: 'Not Found' });
    });
};