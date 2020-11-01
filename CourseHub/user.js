const mongoose = require('mongoose');
const user = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    selectedCourses: [String],
    interests: [String]


});

module.exports = mongoose.model('User', user);
