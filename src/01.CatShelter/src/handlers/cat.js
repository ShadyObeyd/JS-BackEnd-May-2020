const url = require('url');
const fs = require('fs');
const path = require('path');
const qr = require('querystring');
const formidable = require('formidable');
const breeds = require('../data/breeds');
const cats = require('../data/cats.json');

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/cats/add-cat' && req.method === 'GET') {
        let filepath = path.normalize(path.join(__dirname, '../views/addCat.html'));

        fs.readFile(filepath, (err, data) => {
            if (err) {
                console.log(err);

                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.write('Error was found');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            
            let catBreedPlaceholder = breeds.map((breed) => `<option value="${breed}">${breed}</option>`);
            let modifiedData = data.toString().replace('{{catBreeds}}', catBreedPlaceholder);

            res.write(modifiedData);
            res.end();
        });
    } else if (pathname === '/cats/add-breed' && req.method === 'GET') {
        let filepath = path.normalize(path.join(__dirname, '../views/addBreed.html'));

        fs.readFile(filepath, (err, data) => {
            if (err) {
                console.log(err);

                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.write('Error was found');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });

            res.write(data);
            res.end();
        });
    } else if (pathname === '/cats/add-breed' && req.method === 'POST') {
        let formData = '';

        req.on('data', (data) => {
            formData += data;
        });

        req.on('end', () => {
            let body = qr.parse(formData);

            fs.readFile('./data/breeds.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let breeds = JSON.parse(data);

                breeds.push(body.breed);

                let json = JSON.stringify(breeds);

                fs.writeFile('./data/breeds.json', json, 'utf-8', () => console.log('Breed added successfully!'));
            });

            res.writeHead(302, {
                location: '/'
            });

            res.end();
        });
    } else if (pathname === '/cats/add-cat' && req.method === 'POST'){
        let form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log(err);
                throw err;
            }

            let oldPath = files.upload.path;
            let newPath = path.normalize(path.join(__dirname, '../content/images/' + files.upload.name));

            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }

                console.log('Files uploaded successfully');
            });

            fs.readFile('./data/cats.json', 'utf-8', (err, data) => {
                if (err) {
                    console.log(err);
                    throw err;
                }

                let allCats = JSON.parse(data);
                allCats.push({ id: allCats.length + 1, ...fields, image: files.upload.name });

                let json = JSON.stringify(allCats);

                fs.writeFile('./data/cats.json', json, () => {
                    res.writeHead(302, {
                        location: '/'
                    });

                    res.end();
                });
            });
        });
    } else if (pathname.includes('/cats-edit') && req.method === 'GET') {
        let filePath = path.normalize(path.join(__filename, '../../views/editCat.html'));

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);

                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.write('Error was found');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            
            let catId = Number(req.url.split('/')[2]);
            let cat = cats.find(c => c.id == catId);

            const breedsAsOption = breeds.map(b => `<option value ="${b}">${b}</option>`);

            let modifiedData = data.toString().replace('{{id}}', catId)
                                              .replace('{{name}}', cat.name)
                                              .replace('{{description}}', cat.description)
                                              .replace('{{catBreeds}}', breedsAsOption.join('/'))
                                              .replace('{{breed}}', cat.breed);


            res.write(modifiedData);
            res.end();
        });
    }  else if (pathname.includes('/cats-find-new-home') && req.method === 'GET') {
        let filePath = path.normalize(path.join(__filename, '../../views/catShelter.html'));

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);

                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.write('Error was found');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            
            let catId = Number(req.url.split('/')[2]);
            let cat = cats.find(c => c.id == catId);

            let modifiedData = data.toString().replace('{{id}}', catId);
            modifiedData = modifiedData.replace('{{name}}', cat.name);
            modifiedData = modifiedData.replace('{{image}}', cat.image);
            modifiedData = modifiedData.replace('{{description}}', cat.description);
            modifiedData = modifiedData.replace('{{breed}}', `<option value="${cat.breed}">${cat.breed}</option>`);

            res.write(modifiedData);
            res.end();
        });
    } else if (pathname.includes('/cats-edit') && req.method === 'POST') {
        
    } else if (pathname.includes('/cats-find-new-home') && req.method === 'POST') {

    } else {
        return true;
    }
}