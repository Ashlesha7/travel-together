import React from "react";
import { Navigate } from "react-router-dom";

const withProfileCompletionCheck = (WrappedComponent) => {
  return (props) => {
    // Retrieve user from localStorage (or from context/state)
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Define what "complete" means – here we check for the key fields.
    const isProfileComplete =
      user &&
      user.phoneNumber &&
      user.citizenshipNumber &&
      user.citizenshipPhoto;

      console.log("withProfileCompletionCheck:", { user, isProfileComplete });

    // If the profile isn't complete, redirect the user to the profile page
    if (!isProfileComplete) {
      return <Navigate to="/profile" replace />;
    }

    // If complete, render the wrapped component
    return <WrappedComponent {...props} />;
  };
};

export default withProfileCompletionCheck;
