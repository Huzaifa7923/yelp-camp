const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
// const { campgroundSchema } = require('../schemas.js')
// const ExpressError = require('../utils/ExpressError')
// const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')
//validate from server side ka function
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })
// router.get('/', catchAsync(campgrounds.index))
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))
// above to can also be written as =>
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router