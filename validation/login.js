const Validator = require('validator');
const isEmpty = require('./isEmpty'); 

module.exports = function validateLoginInput(data){
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : ''; 

  // email validation
  if(!Validator.isEmail(data.email)){
    errors.email = 'Email is invalid';
  }

  if(Validator.isEmpty(data.email)){
    errors.email = 'Email feild is required';
  }

  // password validation
  if(Validator.isEmpty(data.password)){
    errors.password = 'Password must be atleat 6 characters';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}