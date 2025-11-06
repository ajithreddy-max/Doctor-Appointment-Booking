import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "../components/Layout";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Table, Card, Typography, Tag, Spin } from "antd";
import moment from "moment";
import "./Appointments.css";

const { Title } = Typography;

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const getAppointmentsData = async () => {
    try {
      dispatch(showLoading());
      setLoading(true);
      const response = await axios.get("/api/user/get-appointments-by-user-id", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      setLoading(false);
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
      setLoading(false);
      toast.error("Failed to fetch appointments");
    }
  };
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'completed':
        return '🎉';
      default:
        return '⏳';
    }
  };

  const columns = [
    {
      title: "Appointment ID",
      dataIndex: "_id",
      render: (text) => (
        <span className="appointment-id">
          {text.substring(0, 8)}...
        </span>
      ),
    },
    {
      title: "Doctor",
      dataIndex: "name",
      render: (text, record) => (
        <span className="doctor-name">
          Dr. {record.doctorInfo.firstName} {record.doctorInfo.lastName}
        </span>
      ),
    },
    {
      title: "Contact",
      dataIndex: "phoneNumber",
      render: (text, record) => (
        <span className="phone-number">
          {record.doctorInfo.phoneNumber}
        </span>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span className="appointment-datetime">
          {moment(record.date, "DD-MM-YYYY").format("MMM DD, YYYY")} at {moment(record.time, "HH:mm").format("hh:mm A")}
        </span>
      ),
    },
    {
      title: "Symptoms",
      dataIndex: "symptoms",
      render: (symptoms) => (
        <div>
          {symptoms && symptoms.length > 0 ? (
            <div>
              {symptoms.slice(0, 3).map((symptom, index) => (
                <Tag key={index} color="blue" style={{ margin: 2 }}>
                  {symptom}
                </Tag>
              ))}
              {symptoms.length > 3 && (
                <Tag color="blue" style={{ margin: 2 }}>
                  +{symptoms.length - 3} more
                </Tag>
              )}
            </div>
          ) : (
            <span className="text-muted">No symptoms</span>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag className={`status-badge ${getStatusColor(status)}`}>
          <span style={{ marginRight: 4 }}>{getStatusIcon(status)}</span>
          {status.toUpperCase()}
        </Tag>
      ),
    }
  ];
  useEffect(() => {
    getAppointmentsData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="appointments-page">
          <Title level={1} className="page-title">My Appointments</Title>
          <hr />
          <div className="appointments-loading">
            <Spin size="large" />
            <p>Loading your appointments...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="appointments-page">
        <Title level={1} className="page-title">My Appointments</Title>
        <hr />
        <Card className="appointments-table-container">
          {appointments.length > 0 ? (
            <Table 
              columns={columns} 
              dataSource={appointments} 
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} appointments`,
              }}
              scroll={{ x: 800 }}
            />
          ) : (
            <div className="empty-appointments">
              <Title level={3}>No Appointments Found</Title>
              <p>You haven't booked any appointments yet.</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}

export default Appointments;
