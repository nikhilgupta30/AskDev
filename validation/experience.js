const Validator = require('validator');
const isEmpty = require('./isEmpty'); 

module.exports = function validateExperienceInput(data){
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.company = !isEmpty(data.company) ? data.company : ''; 
  data.from = !isEmpty(data.from) ? data.from : ''; 

  // title validation
  if(Validator.isEmpty(data.title)){
    errors.title = 'Job Title feild is required';
  }

  // company validation
  if(Validator.isEmpty(data.company)){
    errors.company = 'company feild is required';
  }

  // from validation
  if(Validator.isEmpty(data.from)){
    errors.from = 'from date feild is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}