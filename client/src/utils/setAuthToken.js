import axios from 'axios';

const setAuthToken = token => {
  if (token) {
    // apply to every request header
    axios.defaults.headers.common['Authorization'] = token;
  } else {
    // Delete the auth header
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default setAuthToken;
