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

module.exports = router;