import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { Card, Row, Col, List, Typography, Tag } from "antd";

const { Title, Text } = Typography;

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const fetchDoctorInfo = async () => {
    try {
      const res = await axios.post(
        "/api/doctor/get-doctor-info-by-user-id",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) setDoctor(res.data.data);
    } catch (_) {}
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("/api/doctor/get-appointments-by-doctor-id", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) setAppointments(res.data.data || []);
    } catch (_) {}
  };

  useEffect(() => {
    fetchDoctorInfo();
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter((a) => a.status === "pending");
  const completed = appointments.filter((a) => a.status === "completed");

  return (
    <Layout>
      <div className="p-2">
        <Title level={2}>Doctor Dashboard</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Title level={4}>Total Appointments</Title>
              <Title level={2}>{appointments.length}</Title>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Title level={4}>Upcoming</Title>
              <Title level={2}>{upcoming.length}</Title>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Title level={4}>Completed</Title>
              <Title level={2}>{completed.length}</Title>
            </Card>
          </Col>
          {/* Status card removed as requested */}
        </Row>

        <Card className="mt-3" title="Upcoming Appointments">
          <List
            dataSource={upcoming}
            locale={{ emptyText: "No upcoming appointments" }}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: "100%" }}>
                  <Row>
                    <Col span={8}>
                      <Text strong>Date:</Text> {item.date}
                    </Col>
                    <Col span={8}>
                      <Text strong>Time:</Text> {item.time}
                    </Col>
                    <Col span={8}>
                      <Tag color="blue">{item.status}</Tag>
                    </Col>
                  </Row>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </Layout>
  );
}

export default DoctorDashboard;


