const mongoose = require('mongoose');
const udemy = new mongoose.Schema({
    courseProvider: String,
    courseType: String,
    description: String,
    subCategory: String,
    photoUrl: String,
    courseId: String,
    url: String,
    name: String,
    avgRating: Number,
    relevancyScore: Number,
    metaphoneDescription: String,
    metaphoneName: String
});


module.exports = mongoose.model('Udemy', udemy);