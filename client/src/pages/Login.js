import { Button, Form, Input } from "antd";
import React from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { hideLoading, showLoading } from "../redux/alertsSlice";
import "./Authentication.css";

// Configure axios base URL
axios.defaults.baseURL = "http://localhost:5001";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get("next");
  const onFinish = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/login", values);
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem("token", response.data.data);
        // If a deep link is provided, honor it first
        if (next) {
          navigate(next);
          return;
        }
        // Navigate based on selected role
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "doctor") {
          navigate("/doctor/dashboard");
        } else {
          navigate("/home");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="authentication">
      <div className="authentication-form card p-3">
        <h1 className="card-title">Welcome Back</h1>
        {role && (
          <p className="text-center" style={{ marginTop: -8, marginBottom: 8 }}>
            Logging in as <strong>{role}</strong>
          </p>
        )}
        {role === "doctor" && (
          <div className="d-flex justify-content-center mb-3" style={{ gap: 8 }}>
            <Button type="primary" onClick={() => { /* stay on login */ }}>
              Doctor Login
            </Button>
            <Button
              onClick={() => {
                if (localStorage.getItem("token")) {
                  navigate("/apply-doctor?standalone=1");
                } else {
                  navigate("/register?next=/apply-doctor%3Fstandalone%3D1");
                }
              }}
            >
              Apply as Doctor
            </Button>
          </div>
        )}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email">
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input placeholder="Password" type="password" />
          </Form.Item>

          <Button className="primary-button my-2 full-width-button" htmlType="submit">
            LOGIN
          </Button>

          <Link to="/register" className="anchor mt-2">
            CLICK HERE TO REGISTER
          </Link>
        </Form>
      </div>
    </div>
  );
}

export default Login;
