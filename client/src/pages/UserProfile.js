import { Button, Col, Form, Input, Row, message, Divider, Card, Statistic, Modal, Upload, Avatar } from "antd";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";
import { UploadOutlined, UserOutlined } from '@ant-design/icons';

function UserProfile() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.photo || null);

  useEffect(() => {
    if (user) {
      // Pre-fill the form with current user data
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
      });
    }
  }, [user, form]);

  const onFinish = async (values) => {
    Modal.confirm({
      title: 'Confirm Profile Update',
      content: 'Are you sure you want to update your profile information?',
      okText: 'Yes, Update',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await axios.post(
            "/api/user/update-user-profile",
            {
              ...values,
              userId: user._id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          if (response.data.success) {
            toast.success(response.data.message);
            // Update the user data in Redux store
            dispatch(setUser(response.data.data));
            navigate("/");
          } else {
            toast.error(response.data.message);
          }
        } catch (error) {
          console.error("Profile update error:", error);
          toast.error("Something went wrong. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handlePhotoUpload = async (file) => {
    try {
      setPhotoLoading(true);
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('userId', user._id);

      const response = await axios.post(
        "/api/user/upload-profile-photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile photo updated successfully!");
        setProfilePhoto(response.data.data.photo);
        // Update the user data in Redux store
        dispatch(setUser(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePhotoChange = (info) => {
    if (info.file.status === 'uploading') {
      setPhotoLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setPhotoLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      toast.error('You can only upload JPG/PNG files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error('Image must be smaller than 2MB!');
      return false;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePhoto(e.target.result);
    };
    reader.readAsDataURL(file);
    
    return true;
  };

  return (
    <Layout>
      <div>
        <h1 className="page-title">User Profile</h1>
        <hr />
        <Row gutter={20} className="mt-5">
          <Col span={8} sm={24} xs={24} lg={8}>
            <Card className="text-center">
              <div className="profile-photo-container">
                <Avatar
                  size={150}
                  src={profilePhoto ? `http://localhost:5000/${profilePhoto}` : null}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <div className="photo-upload-overlay">
                  <Upload
                    name="photo"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    customRequest={({ file }) => handlePhotoUpload(file)}
                    accept="image/*"
                    onChange={handlePhotoChange}
                  >
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      loading={photoLoading}
                      className="upload-button"
                    >
                      {photoLoading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                  </Upload>
                  {profilePhoto && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => {
                        Modal.confirm({
                          title: 'Remove Profile Photo',
                          content: 'Are you sure you want to remove your profile photo?',
                          okText: 'Yes, Remove',
                          cancelText: 'Cancel',
                          onOk: async () => {
                            try {
                              setPhotoLoading(true);
                              const response = await axios.post(
                                "/api/user/remove-profile-photo",
                                { userId: user._id },
                                {
                                  headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                  },
                                }
                              );
                              
                              if (response.data.success) {
                                toast.success("Profile photo removed successfully!");
                                setProfilePhoto(null);
                                dispatch(setUser(response.data.data));
                              } else {
                                toast.error(response.data.message);
                              }
                            } catch (error) {
                              console.error("Photo removal error:", error);
                              toast.error("Failed to remove photo. Please try again.");
                            } finally {
                              setPhotoLoading(false);
                            }
                          }
                        });
                      }}
                      className="remove-photo-button"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <h2 className="mt-3">{user?.name}</h2>
              <p className="text-muted">{user?.email}</p>
              <p className="text-muted">
                <i className="ri-user-line"></i> {user?.isAdmin ? 'Administrator' : user?.isDoctor ? 'Doctor' : 'Patient'}
              </p>
              <p className="text-muted">
                <i className="ri-time-line"></i> Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
              
              <div className="photo-upload-info">
                <p className="text-muted" style={{ fontSize: '11px', marginTop: '10px' }}>
                  <i className="ri-information-line"></i> Photo Requirements:
                </p>
                <p className="text-muted" style={{ fontSize: '10px', margin: '0' }}>
                  • JPG or PNG format only
                </p>
                <p className="text-muted" style={{ fontSize: '10px', margin: '0' }}>
                  • Maximum size: 2MB
                </p>
                <p className="text-muted" style={{ fontSize: '10px', margin: '0' }}>
                  • Hover over photo to upload
                </p>
              </div>
              
              <Divider />
              
              <Row gutter={16} className="mt-3">
                <Col span={12}>
                  <Statistic
                    title="Total Appointments"
                    value={user?.appointmentCount || 0}
                    prefix={<i className="ri-calendar-line" />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Account Status"
                    value={user?.isAdmin ? 'Admin' : user?.isDoctor ? 'Doctor' : 'Active'}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<i className="ri-shield-check-line" />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={16} sm={24} xs={24} lg={16}>
            <Card title="Edit Profile Information" className="mt-3">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Row gutter={20}>
                  <Col span={12} xs={24} sm={24} lg={12}>
                    <Form.Item
                      label="Full Name"
                      name="name"
                      rules={[{ required: true, message: "Please enter your name" }]}
                    >
                      <Input placeholder="Enter your full name" />
                    </Form.Item>
                  </Col>
                  <Col span={12} xs={24} sm={24} lg={12}>
                    <Form.Item
                      label="Email Address"
                      name="email"
                      rules={[
                        { required: true, message: "Please enter your email" },
                        { type: "email", message: "Please enter a valid email" },
                      ]}
                    >
                      <Input placeholder="Enter your email" disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12} xs={24} sm={24} lg={12}>
                    <Form.Item
                      label="Phone Number"
                      name="phoneNumber"
                      rules={[
                        { required: true, message: "Please enter your phone number" },
                        { pattern: /^[0-9+\-\s()]+$/, message: "Please enter a valid phone number" },
                      ]}
                    >
                      <Input placeholder="Enter your phone number" />
                    </Form.Item>
                  </Col>
                  <Col span={12} xs={24} sm={24} lg={12}>
                    <Form.Item
                      label="Address"
                      name="address"
                      rules={[
                        { required: true, message: "Please enter your address" },
                      ]}
                    >
                      <Input placeholder="Enter your address" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <div className="d-flex justify-content-end">
                  <Button
                    className="primary-button"
                    htmlType="submit"
                    loading={loading}
                    style={{ marginRight: "10px" }}
                  >
                    <i className="ri-save-line"></i> Update Profile
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                  >
                    <i className="ri-close-line"></i> Cancel
                  </Button>
                </div>
              </Form>
            </Card>
            
            <Card title="Account Information" className="mt-3">
              <Row gutter={20}>
                <Col span={12} xs={24} sm={24} lg={12}>
                  <div className="info-item">
                    <i className="ri-fingerprint-line"></i>
                    <span><strong>User ID:</strong> {user?._id}</span>
                  </div>
                  <div className="info-item">
                    <i className="ri-user-settings-line"></i>
                    <span><strong>Account Type:</strong> {user?.isAdmin ? 'Administrator' : user?.isDoctor ? 'Doctor' : 'Patient'}</span>
                  </div>
                </Col>
                <Col span={12} xs={24} sm={24} lg={12}>
                  <div className="info-item">
                    <i className="ri-checkbox-circle-line"></i>
                    <span><strong>Email Verified:</strong> <span style={{ color: '#52c41a' }}>✓ Yes</span></span>
                  </div>
                  <div className="info-item">
                    <i className="ri-time-line"></i>
                    <span><strong>Last Login:</strong> {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}

export default UserProfile; 