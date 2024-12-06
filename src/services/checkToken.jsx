import React from "react";

const checkToken = (props) => {
  const aToken = localStorage.getItem("aToken");
  if (aToken) {
    return (props = true);
  } else {
    return (props = false);
  }
};

export default checkToken;
