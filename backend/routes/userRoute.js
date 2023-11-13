const express = require('express');
const { loginUser, signupUser, logoutUser, followUser, updateProfile, updatePassword, forgotPassword, resetPassword, getUserDetails, getAccountDetails, getAllUsers, searchUsers, getUserDetailsById, deleteProfile } = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/auth');
const path = require('path');
const multer = require('multer');
const { PrivacyPalClient } = require('privacy-pal');
const { MongoClient, ObjectId } = require('mongodb');
const { default: handleAccess } = require('../privacy/access');
const jwt = require('jsonwebtoken');

const router = express();

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, '../../public/uploads/profiles'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '_' + uniqueSuffix + path.extname(file.originalname))
    }
})

const avatarUpload = multer({
    storage: avatarStorage,
    limit: { fileSize: 1000000 * 2 }
});

router.route("/signup").post(avatarUpload.single('avatar'), signupUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);

router.route("/me")
    .get(isAuthenticated, getAccountDetails)
    .delete(isAuthenticated, deleteProfile);

router.route("/user/:username").get(isAuthenticated, getUserDetails);
router.route("/userdetails/:id").get(isAuthenticated, getUserDetailsById);

router.route("/users/suggested").get(isAuthenticated, getAllUsers);
router.route("/users").get(isAuthenticated, searchUsers);

router.route("/follow/:id").get(isAuthenticated, followUser);

router.route("/update/profile").put(isAuthenticated, avatarUpload.single('avatar'), updateProfile);
router.route("/update/password").put(isAuthenticated, updatePassword);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route("/data").get(isAuthenticated, async (req, res) => {
    const mongoClient = new MongoClient(process.env.MONGO_URI);
    await mongoClient.connect();
    const privacyPalClient = new PrivacyPalClient(mongoClient);

    const { token } = req.cookies;
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const userLocator = {
        dataType: 'user',
        singleDocument: true,
        collection: "users",
        filter: {
            _id: new ObjectId(decodedData.id)
        }
    }

    const data = await privacyPalClient.processAccessRequest(handleAccess, userLocator, decodedData.id);
    console.log(data)

    res.json({
        success: true,
        data: JSON.stringify(data)
    })
});


module.exports = router;