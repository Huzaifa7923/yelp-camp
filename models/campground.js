const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;//jisse baar baar mongoose.Schema na likha padhe\
// mongoose.set('strictQuery', true);
const ImageSchema = new Schema({
    url: String,
    filename: String
})
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})
//to add properties wala section as down below
const opts = { toJSON: { virtuals: true } }
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);
//to look like this of schema (for mapbox)without changing the original schema
// {
// properties:{
// popUpMarkup:
// }
// }
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 40)}...</p>
    `
})
//now every campground will have campground.properties.popUpMarkUp just like campground.title
// read virtual in json on mongoose docs
//mongoose middleware
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);