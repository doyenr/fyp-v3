const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");

// model
const ProfileModel = require("../../models/Profile");
const UserModel = require("../../models/User");

// @route   GET api/profile/me
// @desc    get current users profile private
// @access  private
router.get("/me", auth, async (req, res) => {
  try {
    //
    const profile = await ProfileModel.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    // not profile
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    // profile exists
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/profile
// @desc    create or update user profile
// @access  private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills are required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    //   error checking
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // pull field out of body
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;
    // check fields
    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    // main profile setup and edit
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    // skills to array
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }
    //social links buld social object
    profileFields.social = {};
    // checks
    if (youtube) profileFields.social.youtube = youtube;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;

    // update and insert the data
    try {
      let profile = await ProfileModel.findOne({ user: req.user.id });
      // look for profile and update
      if (profile) {
        profile = await ProfileModel.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        // return profile
        return res.json(profile);
      }

      //create profile if not found
      profile = new ProfileModel(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/profile
// @desc    route to get all profiles
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await ProfileModel.find().populate("user", [
      "name",
      "avatar"
    ]);
    // get profiles
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/profile/user/:user_id
// @desc    route to get profile by user ID
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await ProfileModel.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
    //   check if theres profile for the user
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    // get profile
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not Found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   DELETE api/profile
// @desc    route to DELETE profile,post, user
// @access  Public
router.delete("/", auth, async (req, res) => {
  try {
    // todo - remove users posts
    // remove profile
    await ProfileModel.findOneAndRemove({ user: req.user.id });
    // remove user
    await UserModel.findOneAndRemove({ _id: req.user.id });

    // return message
    res.json({ msg: "Account deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
module.exports = router;
