const mongoose = require('mongoose');
const udemy = new mongoose.Schema({
    courseProvider: String,
    courseType: String,
    partnerLogo: String,
    description: String,
    domainTypes: [{ subdomainId: String, domainId: String }],
    photoUrl: String,
    categories: [String],
    courseId: String,
    slug: String,
    name: String,
    instructorIds: [String],
    partnerIds: [String],
    specializations: [String],
    workload: String,
    primaryLanguages: [String],
    metaphoneDescription: String,
    metaphoneName: String
});


module.exports = mongoose.model('Udemy', udemy);