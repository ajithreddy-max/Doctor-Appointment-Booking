import React from "react";
import Layout from "../components/Layout";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const standalone = searchParams.get("standalone") === "1";

  const onFinish = async (values) => {
    try {
      console.log("Form values:", values);
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
      } else {
        toast.error("Please upload a profile photo");
        dispatch(hideLoading());
        return;
      }
      if (values.mbbsCertificate?.[0]?.originFileObj) {
        formData.append('mbbsCertificate', values.mbbsCertificate[0].originFileObj);
      } else {
        toast.error("Please upload MBBS certificate");
        dispatch(hideLoading());
        return;
      }
      if (values.internshipCertificate?.[0]?.originFileObj) {
        formData.append('internshipCertificate', values.internshipCertificate[0].originFileObj);
      } else {
        toast.error("Please upload internship certificate");
        dispatch(hideLoading());
        return;
      }

      // Format timings
      formData.append('timings', JSON.stringify([
        moment(values.timings[0]).format("HH:mm"),
        moment(values.timings[1]).format("HH:mm"),
      ]));

      // Add userId manually (temporary fix)
      if (user && user._id) {
        formData.append('userId', user._id);
        console.log("Added userId manually:", user._id);
      }

      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

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
        navigate("/login/doctor");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Apply doctor error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const content = (
    <div style={{ padding: standalone ? 24 : 0 }}>
      <h1 className="page-title">Apply Doctor</h1>
      <hr />
      <DoctorForm onFinish={onFinish} />
    </div>
  );

  return standalone ? content : <Layout>{content}</Layout>;
}

export default ApplyDoctor;
