const cubesController = require('../controllers/cube-controller');

module.exports = (app) => {
    app.get('/', (req, res) => {
        cubesController.renderCubes(res);        
    });

    app.get('/about', (req, res) => {
        res.render('about', {title: 'About'});
    });

    app.get('/create', (req, res) => {
        res.render('create', {title: 'Add Cube'});
    });

    app.post('/create', (req, res) => {
        let {name,
            description,
            imageUrl,
            difficultyLevel} = req.body;

        let cube = cubesController.createCube(name, description, imageUrl, difficultyLevel);
        cubesController.saveCube(cube);

        cubesController.renderCubes(res);
    });

    app.get('/details/:id', (req, res) => {
        let id = req.params.id;

        cubesController.getCube(res, id);
    });

    app.post('/search', (req, res) => {
        let {search, from, to} = req.body;

        cubesController.search(search, from, to, res);
    });

    app.all('*', (req, res) => {
        res.render('404', {title: 'Not Found'});
    });
};