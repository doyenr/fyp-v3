import axios from "axios";
import { setAlert } from "./alert";
import setAuthToken from "../utils/setAuthToken";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT
} from "../types";

// Load User function
export const loadUser = () => async dispatch => {
  // check to see if theres a token in local storage
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }
  try {
    // response
    const res = await axios.get("/api/auth");

    // success dispatch
    dispatch({
      type: USER_LOADED,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    });
  }
};

// Register Action
export const register = ({ name, email, password }) => async dispatch => {
  // header config
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  // body
  const body = JSON.stringify({ name, email, password });

  try {
    //response for post request
    const res = await axios.post("/api/users", body, config);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });
    dispatch(loadUser());
  } catch (err) {
    //   set errors
    const errors = err.response.data.errors;
    // if errors
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: REGISTER_FAIL
    });
  }
};

//  login Action
export const loginUser = (email, password) => async dispatch => {
  // header config
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  // body
  const body = JSON.stringify({ email, password });

  try {
    //response for post request
    const res = await axios.post("/api/auth", body, config);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });
    dispatch(loadUser());
  } catch (err) {
    //   set errors
    const errors = err.response.data.errors;
    // if errors
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: LOGIN_FAIL
    });
  }
};

// logOUT //clear profile
export const logOut = () => dispatch => {
  dispatch({
    type: LOGOUT
  });
};