import { Button, Form, Input } from "antd";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { hideLoading, showLoading } from "../redux/alertsSlice";

// Configure axios base URL
axios.defaults.baseURL = "http://localhost:5000";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/register", values);
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/login");
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
        <h1 className="card-title">Nice To Meet U</h1>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item 
            label="Name" 
            name="name"
            rules={[
              { required: true, message: 'Please enter your name' },
              { min: 3, message: 'Name must be at least 3 characters long' },
              { max: 50, message: 'Name cannot exceed 50 characters' },
              { 
                pattern: /^[A-Za-z]+(?:[A-Za-z\s]*[A-Za-z])?$/,
                message: 'Name can only contain letters and spaces, must start and end with a letter'
              }
            ]}
          >
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item 
            label="Email" 
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { 
                pattern: /^[A-Za-z]+[A-Za-z0-9]*@[A-Za-z0-9]+\.[A-Za-z]{2,}$/,
                message: 'Email must start with letters, can contain numbers, followed by @ and domain'
              }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item 
            label="Password" 
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters long' },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
              }
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Button
            className="primary-button my-2 full-width-button"
            htmlType="submit"
          >
            REGISTER
          </Button>

          <Link to="/login" className="anchor mt-2">
            CLICK HERE TO LOGIN
          </Link>
        </Form>
      </div>
    </div>
  );
}

export default Register;
