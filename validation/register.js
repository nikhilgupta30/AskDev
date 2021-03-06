const Validator = require('validator');
const isEmpty = require('./isEmpty'); 

module.exports = function validateRegisterInput(data){
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';

  // name validation
  if(!Validator.isLength(data.name, { min: 2, max: 30 })){
    errors.name = 'Name must be bw 2 and 30 characters';
  }

  if(Validator.isEmpty(data.name)){
    errors.name = 'Name feild is required';
  }

  // email validation
  if(!Validator.isEmail(data.email)){
    errors.email = 'Email is invalid';
  }

  if(Validator.isEmpty(data.email)){
    errors.email = 'Email feild is required';
  }

  // password validation
  if(!Validator.isLength(data.password, { min: 6, max: 100 })){
    errors.password = 'Password must be atleat 6 characters';
  }

  if(Validator.isEmpty(data.password)){
    errors.password = 'Password feild required';
  }

  // password2 validation
  if(!Validator.equals(data.password, data.password2)){
    errors.password2 = 'Password and Confirm Password must match';
  }

  if(Validator.isEmpty(data.password)){
    errors.password2 = 'Confirm Password field required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}