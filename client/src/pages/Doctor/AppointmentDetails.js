import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Card, Descriptions, Typography, Avatar } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { UserOutlined, PhoneOutlined, CalendarOutlined, ClockCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const { Title, Text } = Typography;

function AppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);

  const fetchDetails = async () => {
    try {
      const res = await axios.get(`/api/doctor/get-appointment-details/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) setAppointment(res.data.data);
    } catch (_) {}
  };

  useEffect(() => { fetchDetails(); }, [appointmentId]);

  return (
    <Layout>
      <div className="doctor-appointments-page">
        <Card style={{ marginBottom: 16 }}>
          <a onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <ArrowLeftOutlined style={{ marginRight: 8 }} /> Back
          </a>
        </Card>

        <Title level={2} className="page-title">Appointment Details</Title>
        <hr />
        <Card>
          {appointment && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Appointment ID">
                <Text code>{appointment._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Patient Name">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                  {appointment.userInfo?.name || 'N/A'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Patient Email">
                {appointment.userInfo?.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Patient Phone">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneOutlined style={{ marginRight: 4 }} />
                  {appointment.userInfo?.phoneNumber || 'N/A'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Doctor Name">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                  Dr. {appointment.doctorInfo?.firstName || ''} {appointment.doctorInfo?.lastName || ''}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Specialization">
                {appointment.doctorInfo?.specialization || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Appointment Date">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {moment(appointment.date, "DD-MM-YYYY").format("MMMM DD, YYYY")}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Appointment Time">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {moment(appointment.time, "HH:mm").format("hh:mm A")}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Symptoms">
                {appointment.symptoms && appointment.symptoms.length > 0 ? (
                  <div>
                    {appointment.symptoms.map((symptom, index) => (
                      <span key={index} style={{ 
                        display: 'inline-block', 
                        background: '#e6f7ff', 
                        border: '1px solid #91d5ff', 
                        borderRadius: 4, 
                        padding: '2px 8px', 
                        margin: '2px', 
                        color: '#1890ff' 
                      }}>
                        {symptom}
                      </span>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">No symptoms reported</Text>
                )}
              </Descriptions.Item>
              {appointment.doctorNotes && (
                <Descriptions.Item label="Doctor Notes">
                  {appointment.doctorNotes}
                </Descriptions.Item>
              )}
              {appointment.prescription && (
                <Descriptions.Item label="Prescription">
                  {appointment.prescription}
                </Descriptions.Item>
              )}
              {appointment.followUpDate && (
                <Descriptions.Item label="Follow-up Date">
                  {moment(appointment.followUpDate).format("MMMM DD, YYYY")}
                </Descriptions.Item>
              )}
              {appointment.completedAt && (
                <Descriptions.Item label="Completed At">
                  {moment(appointment.completedAt).format("MMMM DD, YYYY hh:mm A")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Created At">
                {moment(appointment.createdAt).format("MMMM DD, YYYY hh:mm A")}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>
      </div>
    </Layout>
  );
}

export default AppointmentDetails;


