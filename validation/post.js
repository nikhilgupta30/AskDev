const Validator = require('validator');
const isEmpty = require('./isEmpty'); 

module.exports = function validatePostInput(data){
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : ''; 

  // text validation
  if(!Validator.isLength(data.text, { min: 0, max: 500})) {
    errors.text = 'Post must be less than 500 characters';
  }

  if(Validator.isEmpty(data.text)){
    errors.text = 'text feild is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}