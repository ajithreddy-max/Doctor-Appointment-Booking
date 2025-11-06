import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/userSlice";
import { showLoading, hideLoading } from "../redux/alertsSlice";

function ProtectedRoute(props) {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getUser = async () => {
    try {
      dispatch(showLoading())
      const response = await axios.post(
        "/api/user/get-user-info-by-id",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        dispatch(setUser(response.data.data));
      } else {
        localStorage.clear()
        navigate("/login");
      }
    } catch (error) {
      dispatch(hideLoading());
      localStorage.clear()
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!user) {
      getUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (localStorage.getItem("token")) {
    // Role-based redirects and guards
    const path = window.location.pathname;
    if (user?.isDoctor && path === "/") {
      return <Navigate to="/doctor/dashboard" />;
    }
    if (user?.isAdmin && path === "/") {
      return <Navigate to="/admin/dashboard" />;
    }
    if (!user?.isAdmin && path.startsWith("/admin")) {
      return <Navigate to="/home" />;
    }
    if (!user?.isDoctor && path.startsWith("/doctor")) {
      return <Navigate to="/home" />;
    }
    return props.children;
  } else {
    return <Navigate to="/login/user" />;
  }
}

export default ProtectedRoute;
