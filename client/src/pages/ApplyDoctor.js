import { Button, Col, Form, Input, Row, TimePicker } from "antd";
import React from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DoctorForm from "../components/DoctorForm";
import moment from "moment";

function ApplyDoctor() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      dispatch(showLoading());
      
      // Create FormData object to handle file uploads
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(values).forEach(key => {
        if (key !== 'photo' && key !== 'mbbsCertificate' && key !== 'internshipCertificate') {
          formData.append(key, values[key]);
        }
      });

      // Handle file uploads
      if (values.photo?.[0]?.originFileObj) {
        formData.append('photo', values.photo[0].originFileObj);
      }
      if (values.mbbsCertificate?.[0]?.originFileObj) {
        formData.append('mbbsCertificate', values.mbbsCertificate[0].originFileObj);
      }
      if (values.internshipCertificate?.[0]?.originFileObj) {
        formData.append('internshipCertificate', values.internshipCertificate[0].originFileObj);
      }

      // Format timings
      formData.append('timings', JSON.stringify([
        moment(values.timings[0]).format("HH:mm"),
        moment(values.timings[1]).format("HH:mm"),
      ]));

      // Add user ID
      formData.append('userId', user._id);

      const response = await axios.post(
        "/api/user/apply-doctor-account",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Apply Doctor</h1>
      <hr />
      <DoctorForm onFinish={onFinish} />
    </Layout>
  );
}

export default ApplyDoctor;
