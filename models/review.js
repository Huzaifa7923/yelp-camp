const mongoose = require('mongoose')
const Schema = mongoose.Schema
// mongoose.set('strictQuery', true);
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Review', reviewSchema)
//connect multiple reviews with campground=>one to many