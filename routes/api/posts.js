const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile model
const Profile = require('../../models/Profile');
// // Load User model
// const User = require('../../models/User');
// Load Post model
const Post = require('../../models/Post');

// Load input validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"}));

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
  Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostsfound: 'No posts found'}));
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json(post);
    })
    .catch(err => res.status(404).json({nopostfound: 'No post found with this id'}));
});

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', passport.authenticate('jwt',{ session: false }), (req, res) => {
  // input validation
  const {errors, isValid} = validatePostInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });

  newPost.save().then(post => res.json(post));
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', passport.authenticate('jwt',{ session: false }), (req, res) => {

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // check for post owner
          if(post.user.toString() !== req.user.id){
            return res.status(401).json({ notauthorized: 'user not authorized' });
          }

          // delete post
          post.remove().then(() => res.json({ success: true}));
        })
        .catch(err => res.status(404).json({ postnotfound: 'no post found'}));
    })
});

// @route   POST api/posts/like/:id
// @desc    Like a post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt',{ session: false }), (req, res) => {

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ alreadyliked: 'user already liked this post' });
          }

          // add user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'no post found'}));
    })
});

// @route   POST api/posts/unlike/:id
// @desc    UnLike a post
// @access  Private
router.post('/unlike/:id', passport.authenticate('jwt',{ session: false }), (req, res) => {

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({ notliked: 'you have not liked this post yet' });
          }
          
          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);           

          // splice user id from likes array
          post.likes.splice(removeIndex, 1);
          
          // save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'no post found'}));
    })
});

// @route   POST api/posts/comment/:id
// @desc    Add Comment to a post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt',{ session: false }), (req, res) => {
  // input validation
  const {errors, isValid} = validatePostInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      };

      // add to comments array
      post.comments.unshift(newComment);

      // save
      post.save().then(post => res.json(post));

    })
    .catch(err => res.status(404).json({ postnotfound: 'no post found'}));
});

module.exports = router;