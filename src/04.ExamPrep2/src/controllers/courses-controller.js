const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const Course = require('../models/course');
const jwt = require('jsonwebtoken');

const createCourse = async (req, res) => {
    let { title, description, imageUrl, isPublic } = req.body;

    if (title.length < 4) {
        res.redirect('/course-create?error=Title has to be at least 4 characters long!');
        return;
    }

    if (description < 20) {
        res.redirect('/course-create?error=Description has to be at least 20 characters long!');
        return;
    }

    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('https')) {
        res.redirect('/course-create?error=Invalid image url!');
        return;
    }

    let public = false;

    if (isPublic) {
        public = true;
    }

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);
    let userId = info.userId;

    let date = new Date();

    let course = new Course({
        title,
        description,
        imageUrl,
        isPublic: public,
        creatorId: userId,
        createdAt: date
    });

    await course.save();

    res.redirect('/');
}

const getTopThreeCourses = async () => {
    let courses = await Course.find().lean();

    let result = courses.filter(c => c.isPublic).sort((a, b) => b.usersEnrolled.length - a.usersEnrolled.length).slice(0, 3);
    return result;
}

const getAllPublicCourses = async () => {
    let courses = await Course.find().lean();

    let result = courses.filter(c => c.isPublic).sort((a, b) => b.createdAt - a.createdAt);

    return result;
}

const getCourseWithUsersById = async (req, res) => {
    let courseId = req.params.id;

    if (!courseId) {
        res.redirect('/');
        return;
    }

    let course = await Course.findById(courseId).populate('usersEnrolled').lean();

    if (!course) {
        res.redirect('/');
        return;
    }

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);
    let userId = info.userId;

    res.render('details', {
        isLoggedIn: req.isLoggedIn,
        username: req.username,
        ...course,
        creator: userId == course.creatorId,
        enrolled: course.usersEnrolled.some(u => u._id == userId),
        error: req.query['error']
    });
}

const enrollInCourse = async (req, res) => {
    let courseId = req.params.id;

    if (!courseId) {
        res.redirect('/');
        return;
    }

    let course = await Course.findById(courseId).populate('usersEnrolled').lean();

    if (!course) {
        res.redirect('/');
        return;
    }

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);
    let userId = info.userId;

    if (course.usersEnrolled.some(u => u._id == userId)) {
        res.redirect('/');
        return;
    }

    await Course.findByIdAndUpdate(courseId, {
        $addToSet: {
            usersEnrolled: [userId]
        }
    });

    res.redirect(`/details/${courseId}`);
}

const getEditView = async (req, res) => {
    let courseId = req.params.id;

    if (!courseId) {
        res.redirect('/');
        return;
    }

    let course = await Course.findById(courseId).lean();

    if (!course) {
        res.redirect('/');
        return;
    }

    let token = req.cookies['authToken'];
    let info = jwt.verify(token, config.privateKey);
    let userId = info.userId;

    if (course.creatorId != userId) {
        res.redirect(`/details/${courseId}?error=Only creators can edit courses!`);
        return;
    }

    res.render('course-edit', {
        isLoggedIn: req.isLoggedIn,
        username: req.username,
        ...course,
        error: req.query['error']
    });
}

const editCourse = async (req, res) => {
    let courseId = req.params.id;

    let { title, description, imageUrl, isPublic } = req.body;

    if (title.length < 4) {
        res.redirect(`/course-edit/${courseId}?error=Title has to be at least 4 characters long!`);
        return;
    }

    if (description < 20) {
        res.redirect(`/course-edit/${courseId}?error=Description has to be at least 20 characters long!`);
        return;
    }

    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('https')) {
        res.redirect(`/course-edit/${courseId}?error=Invalid image url!`);
        return;
    }

    let public = false;

    if (isPublic) {
        public = true;
    }

    if (!courseId) {
        res.redirect('/');
        return;
    }

    let course = await Course.findById(courseId).lean();

    if (!course) {
        res.redirect('/');
        return;
    }

    let updateObj = {
        title,
        description,
        imageUrl,
        isPublic: public,
    };

    await Course.findByIdAndUpdate(courseId, updateObj);

    res.redirect(`/details/${courseId}`);
}

const deleteCourse = async (req, res) => {
    let courseId = req.params.id;

    if (!courseId) {
        res.redirect('/');
        return;
    }

    await Course.findByIdAndDelete(courseId);

    res.redirect('/');
}

const search = async (req, res) => {
    let search = req.body.search;
    
    if (!search) {
        res.redirect('/');
        return;
    }

    let courses = await Course.find().lean();

    let result = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    res.render('home-user', {
        isLoggedIn: req.isLoggedIn,
        username: req.username,
        courses: result,
        error: req.query['error'],
    });
}

module.exports = {
    createCourse,
    getTopThreeCourses,
    getAllPublicCourses,
    getCourseWithUsersById,
    enrollInCourse,
    getEditView,
    editCourse,
    deleteCourse,
    search
}