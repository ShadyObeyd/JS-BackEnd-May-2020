const fs = require('fs');
const Cube = require('../models/cube');
const databasePath = './config/database.json';
const utfEncoding = 'utf-8';

const createCube = (name, description, imageUrl, difficultyLevel) => {
    let cube = new Cube(name, description, imageUrl, difficultyLevel);

    return cube;
}

const saveCube = (cube) => {
    fs.readFile(databasePath, utfEncoding, (err, data) => {
        if (err) {
            console.log(err);
            throw err;
        }

        let allCubes = JSON.parse(data);

        let newCube = {
            id: cube.id,
            name: cube.name,
            description: cube.description,
            imageUrl: cube.imageUrl,
            difficultyLevel: cube.difficultyLevel
        };

        allCubes.push(newCube);

        let json = JSON.stringify(allCubes);

        fs.writeFile(databasePath, json, utfEncoding, (err) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    });
}

const renderCubes = (res) => {
    fs.readFile(databasePath, utfEncoding, (err, data) => {
        if (err) {
            console.log(err);
            throw err;
        }

        let allCubes = JSON.parse(data);

        res.render('index', {
            title: 'Cube Workshop',
            cubes: allCubes
        });
    });
}

const getCube = (res, id) => {
    fs.readFile(databasePath, utfEncoding, (err, data) => {
        if (err) {
            console.log(err);
            throw err;
        }

        let allCubes = JSON.parse(data);

        let cube = allCubes.find(c => c.id == id);

        res.render('details', {
            title: 'Details',
            name: cube.name,
            imageUrl: cube.imageUrl,
            description: cube.description,
            difficultyLevel: cube.difficultyLevel
        });
    });
}

const search = (string, from, to, res) => {
    fs.readFile(databasePath, utfEncoding, (err, data) => {
        if (err) {
            console.log(err);
            throw err;
        }

        let allCubes = JSON.parse(data);

        if (!string && !from && !to) {
            res.render('index', {
                title: 'Cube Workshop',
                cubes: allCubes
            });
        } else if (string && !from && !to) {
            let wantedCubes = allCubes.filter(c => c.name.toLowerCase().includes(string.toLowerCase()));

            if (wantedCubes.length === 0) {
                wantedCubes = allCubes.filter(c => c.description.toLowerCase().includes(string.toLowerCase()));

                if (wantedCubes.length === 0) {
                    res.render('index', {
                        title: 'Cube Workshop',
                        cubes: allCubes
                    });
                } else {
                    res.render('index', {
                        title: 'Cube Workshop',
                        cubes: wantedCubes
                    });
                }
            } else {
                res.render('index', {
                    title: 'Cube Workshop',
                    cubes: wantedCubes
                });
            }
        } else if (string && from && !to) {
            // TODO
        } else if (string && from && to) {
            // TODO
        } else if (!string && from && to) {
            // TODO
        } else if (!string && from && !to) {
            // TODO
        } else if (!string && !from && to) {
            // TODO
        }
    });
}

module.exports = {
    createCube,
    saveCube,
    renderCubes,
    getCube,
    search
};