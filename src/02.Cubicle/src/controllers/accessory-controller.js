const Accessory = require('../models/accessory');
const pattern = /^[A-Za-z0-9 ]+$/;

const getAllAccessories = async () => {
    let accessories = await Accessory.find().lean();

    return accessories;
}

const saveAccessory = async (req, res) => {
    let { name,
        description,
        imageUrl } = req.body;

    if (!name || name.length < 5) {
        res.redirect('/create/accessory?error=Name must be at least 5 characters long!');
        return;
    }

    if (!name.match(pattern)) {
        res.redirect('/create/accessory?error=Name must contain only English letters and digits!');
        return;
    }

    if (!description || description.length < 20) {
        res.redirect('/create/accessory?error=Description must be at least 20 characters long!');
        return;
    }

    if (!description.match(pattern)) {
        res.redirect('/create/accessory?error=Description must contain only English letters and digits!');
        return;
    }

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        res.redirect('/create/accessory?error=Invalid image url!');
        return;
    }

    let accessory = new Accessory({ name, description, imageUrl });

    await accessory.save();
};

module.exports = {
    saveAccessory,
    getAllAccessories
}