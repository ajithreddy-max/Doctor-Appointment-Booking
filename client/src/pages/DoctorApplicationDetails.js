import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Card, Row, Col, Button, Image, Modal } from "antd";
import moment from "moment";

function DoctorApplicationDetails() {
  const [doctor, setDoctor] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { doctorId } = useParams();
  const dispatch = useDispatch();

  const getDoctorData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get(`/api/admin/get-doctor-by-id/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (response.data.success) {
        setDoctor(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Error fetching doctor details");
    }
  };

  const handleApprove = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/admin/change-doctor-account-status",
        {
          doctorId,
          status: "approved",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success("Doctor account approved successfully");
        getDoctorData();
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Error approving doctor account");
    }
  };

  const handleReject = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/admin/change-doctor-account-status",
        {
          doctorId,
          status: "rejected",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success("Doctor account rejected successfully");
        getDoctorData();
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Error rejecting doctor account");
    }
  };

  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  useEffect(() => {
    getDoctorData();
  }, []);

  return (
    <Layout>
      <h1 className="page-title">Doctor Application Details</h1>
      <hr />
      {doctor && (
        <div className="doctor-details">
          <Row gutter={20}>
            <Col span={8}>
              <Card title="Profile Photo">
                <Image
                  src={`http://localhost:5001/${doctor.photo}`}
                  alt="Profile Photo"
                  style={{ width: "100%", cursor: "pointer" }}
                  onClick={() => handlePreview(`http://localhost:5001/${doctor.photo}`)}
                />
              </Card>
            </Col>
            <Col span={16}>
              <Card title="Personal Information">
                <p><strong>Name:</strong> {doctor.firstName} {doctor.lastName}</p>
                <p><strong>Phone Number:</strong> {doctor.phoneNumber}</p>
                <p><strong>Address:</strong> {doctor.address}</p>
              </Card>
            </Col>
          </Row>

          <Row gutter={20} style={{ marginTop: "20px" }}>
            <Col span={12}>
              <Card title="Education Details">
                <p><strong>Medical College:</strong> {doctor.medicalCollege}</p>
                <p><strong>Year of Graduation:</strong> {doctor.graduationYear}</p>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Professional Information">
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                <p><strong>Experience:</strong> {doctor.experience} years</p>
                <p><strong>Fee Per Consultation:</strong> ${doctor.feePerCunsultation}</p>
                <p><strong>Timings:</strong> {doctor.timings[0]} - {doctor.timings[1]}</p>
              </Card>
            </Col>
          </Row>

          <Row gutter={20} style={{ marginTop: "20px" }}>
            <Col span={12}>
              <Card title="MBBS Certificate">
                <Image
                  src={`http://localhost:5001/${doctor.mbbsCertificate}`}
                  alt="MBBS Certificate"
                  style={{ width: "100%", cursor: "pointer" }}
                  onClick={() => handlePreview(`http://localhost:5001/${doctor.mbbsCertificate}`)}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Internship Certificate">
                <Image
                  src={`http://localhost:5001/${doctor.internshipCertificate}`}
                  alt="Internship Certificate"
                  style={{ width: "100%", cursor: "pointer" }}
                  onClick={() => handlePreview(`http://localhost:5001/${doctor.internshipCertificate}`)}
                />
              </Card>
            </Col>
          </Row>

          {doctor.status === "pending" && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <Button
                type="primary"
                onClick={handleApprove}
                style={{ marginRight: "10px" }}
              >
                Approve
              </Button>
              <Button danger onClick={handleReject}>
                Reject
              </Button>
            </div>
          )}

          <Modal
            open={previewVisible}
            title="Image Preview"
            footer={null}
            onCancel={() => setPreviewVisible(false)}
          >
            <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
          </Modal>
        </div>
      )}
    </Layout>
  );
}

export default DoctorApplicationDetails; 