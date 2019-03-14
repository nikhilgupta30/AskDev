const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile model
const Profile = require('../../models/Profile');
// Load User model
const User = require('../../models/User');

// Load input validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Profile Works"}));

// @route   GET api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
  const errors = {};
  
  Profile.find()
    .populate('user', ['name', 'avatar'])  
    .then(profiles => {
      if(!profiles) {
        errors.noprofile = 'There are no profiles';
        res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({noprofile: 'There are no profiles'}));
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};
  
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])  
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this handle';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};
  
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])  
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user ID';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({noprofile: 'There is no profile for this handle'}));
});

// @route   POST api/profile
// @desc    Create or Update user profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
   
  // checking validation
  const {errors, isValid} = validateProfileInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }
  
  // Get feilds
  const profileFields = {};
  // id
  profileFields.user = req.user.id;
  // handle
  if(req.body.handle) profileFields.handle = req.body.handle;
  // company
  if(req.body.company) profileFields.company = req.body.company;
  // website
  if(req.body.website) profileFields.website = req.body.website;
  // location
  if(req.body.location) profileFields.location = req.body.location;
  // bio
  if(req.body.bio) profileFields.bio = req.body.bio;
  // status
  if(req.body.status) profileFields.status = req.body.status;
  // githubusername
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
  // skills - split into array
  if(typeof(req.body.skills) !== 'undefined'){
    profileFields.skills = req.body.skills.split(',');
  }
  // Social
  profileFields.social = {};
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id }).then(profile => {
    if(profile) {
      // Update
      Profile.findOneAndUpdate(
        { user: req.user.id }, 
        { $set: profileFields }, 
        { new: true }
      )
      .then(profile => res.json(profile));
    } else{
      // Create

      // check if handle exists
      Profile.findOne({ handle: profileFields.handle })
        .then(profile => {
          if(profile){
            errors.handle = 'Handle already exist';
            res.status(400).json(errors);
          }

          // save profile
          new Profile(profileFields).save()
            .then(profile => res.json(profile)
          );
        });
    }
  });
});

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  // checking validation
  const {errors, isValid} = validateExperienceInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }
  
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // add to exp array
      profile.experience.unshift(newExp);
      profile.save()
        .then(profile => res.json(profile));
    });
});

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  // checking validation
  const {errors, isValid} = validateEducationInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }
  
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // add to edu array
      profile.education.unshift(newEdu);
      profile.save()
        .then(profile => res.json(profile));
    });
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      // splice out of array
      profile.experience.splice(removeIndex, 1);

      // Save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      // splice out of array
      profile.education.splice(removeIndex, 1);

      // Save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({ success: true }));
    })
});

module.exports = router;