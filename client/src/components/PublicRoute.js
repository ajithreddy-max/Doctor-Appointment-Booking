import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function PublicRoute(props) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get("next");

  if (localStorage.getItem("token")) {
    // If a deep link target is specified, honor it for authenticated users
    if (next) {
      return <Navigate to={next} />;
    }
    return <Navigate to="/home" />;
  } else {
    return props.children;
  }
}

export default PublicRoute;
