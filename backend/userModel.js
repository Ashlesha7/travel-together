// const mongoose = require('mongoose');

// // Define the User schema
// const UserSchema = new mongoose.Schema({
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     phoneNumber: { type: String, required: true },
//     citizenshipNumber: { type: String, required: true },
//     password: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
// });

// // Export the User model
// module.exports = mongoose.model('User', UserSchema);


const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: false, default: "" },
    citizenshipNumber: { type: String, required: false, default: "" },
    citizenshipPhoto: { type: String, required: false, default: "" },
    profilePhoto: { type: String, required: true }, 
    password: { type: String, required: false, default: "" },
    createdAt: { type: Date, default: Date.now },
    bio: { type: String, default: "" },                     
    coverPhoto: { type: String, default: "" },
    homeBase: { type: String, default: "" },
    birthYear: { type: String, default: "" },
    gender: { type: String, default: "" },
    resetCode: { type: String, default: "" },
    resetCodeExpiry: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
