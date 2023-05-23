const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary")

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}
module.exports.showCampground = async (req, res) => {
    // nested populate
    const campground = await Campground.findById(req.params.id).populate({
        //we are saying populate all the reviews from reviews array then again on each review populate their author and then populate author of this cp
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    // console.log(campground)
    if (!campground) {
        req.flash('error', 'cannot find that cp')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    await campground.save()
    console.log(campground)
    req.flash('success', 'successfully made a new cp')
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        res.flash('error', 'cannot find that cp')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        // console.log(campground)
    }
    req.flash('success', 'successfully updated cp')
    res.redirect(`/campgrounds/${campground._id}`)

}
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully delete cp') /
        res.redirect('/campgrounds');
}   
