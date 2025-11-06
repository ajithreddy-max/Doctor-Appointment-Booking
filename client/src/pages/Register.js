import { Button, Form, Input } from "antd";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { hideLoading, showLoading } from "../redux/alertsSlice";
import "./Authentication.css";

// Configure axios base URL
axios.defaults.baseURL = "http://localhost:5001";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get("next");
  const onFinish = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/register", values);
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        // Preserve deep link to return to apply-doctor after login
        if (next) {
          navigate(`/login?next=${encodeURIComponent(next)}`);
        } else {
          navigate("/login");
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

          <Form.Item 
            label="Phone Number" 
            name="phone"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { 
                pattern: /^[0-9]{10}$/, 
                message: 'Phone number must be 10 digits' 
              }
            ]}
          >
            <Input placeholder="Phone Number" />
          </Form.Item>

          <Form.Item 
            label="Age" 
            name="age"
            rules={[
              { required: true, message: 'Please enter your age' },
              { 
                type: 'number', 
                min: 1, 
                max: 120, 
                message: 'Age must be between 1 and 120' 
              }
            ]}
          >
            <Input type="number" placeholder="Age" />
          </Form.Item>

          <Form.Item 
            label="Gender" 
            name="gender"
            rules={[{ required: true, message: 'Please select your gender' }]}
          >
            <select className="form-control">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
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
