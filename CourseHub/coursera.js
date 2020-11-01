const mongoose = require('mongoose');
const coursera = new mongoose.Schema({
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

module.exports = mongoose.model('Coursera', coursera);
// current total courses on coursera 5203
// https://api.coursera.org/api/courses.v1?limit=52&fields=instructorIds,partnerIds,specializations,domainTypes,categories,description,workload,primaryLanguages,partnerLogo,photoUrl

// https://build.coursera.org/app-platform/catalog/