import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../components/Layout";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Table, Card, Typography, Tag, Button, Space, Avatar, DatePicker, Select } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined, CalendarOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";
import "./DoctorAppointments.css";

const { Title, Text } = Typography;

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ status: undefined, date: null });
  const dispatch = useDispatch();
  const getAppointmentsData = async () => {
    try {
      dispatch(showLoading());
      const resposne = await axios.get(
        "/api/doctor/get-appointments-by-doctor-id",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (resposne.data.success) {
        const base = resposne.data.data || [];
        // Enrich with user phone numbers if missing
        const enriched = await Promise.all(
          base.map(async (a) => {
            if (a?.userInfo?.phoneNumber) return a;
            try {
              const resp = await axios.post(
                "/api/user/get-user-info-by-id",
                { userId: a.userId },
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
              );
              if (resp.data.success && resp.data.data) {
                return {
                  ...a,
                  userInfo: {
                    ...a.userInfo,
                    phoneNumber: resp.data.data.phoneNumber || "",
                  },
                };
              }
            } catch (_) {}
            return a;
          })
        );
        setAppointments(enriched);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchStatus = filters.status ? appt.status === filters.status : true;
    const matchDate = filters.date ? moment(appt.date, "DD-MM-YYYY").isSame(filters.date, "day") : true;
    return matchStatus && matchDate;
  });

  const changeAppointmentStatus = async (record, status) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctor/change-appointment-status",
        { appointmentId : record._id, status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        getAppointmentsData();
      }
    } catch (error) {
      toast.error("Error changing appointment status");
      dispatch(hideLoading());
    }
  };

  const completeAppointment = async (record) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctor/complete-appointment",
        { appointmentId: record._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        getAppointmentsData();
      }
    } catch (error) {
      toast.error("Error completing appointment");
      dispatch(hideLoading());
    }
  };

  // View/Edit options removed as requested

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'orange';
      case 'approved':
        return 'blue';
      case 'completed':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };
  const columns = [
    {
      title: "Appointment ID",
      dataIndex: "_id",
      render: (text) => (
        <Text code style={{ fontSize: 12 }}>
          {text.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: "Patient",
      dataIndex: "userInfo",
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.userInfo.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.userInfo.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "userInfo",
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PhoneOutlined style={{ marginRight: 4, color: '#666' }} />
          <span style={{ fontFamily: 'monospace' }}>
            {record?.userInfo?.phoneNumber || record?.userId?.phoneNumber || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: 4, color: '#666' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{moment(record.date, "DD-MM-YYYY").format("MMM DD, YYYY")}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{moment(record.time, "HH:mm").format("hh:mm A")}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Symptoms",
      dataIndex: "symptoms",
      render: (symptoms) => (
        <div>
          {symptoms && symptoms.length > 0 ? (
            <div>
              {symptoms.map((symptom, index) => (
                <Tag key={index} color="blue" style={{ margin: 2 }}>
                  {symptom}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary">No symptoms</Text>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: 12, fontWeight: 600, textTransform: 'uppercase' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <Space>
          {/* View option removed */}
          {/* Edit option removed as requested */}
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => changeAppointmentStatus(record, "approved")}
                style={{ 
                  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  border: 'none',
                  borderRadius: 8
                }}
              >
                Approve
              </Button>
              <Button
                type="primary"
                danger
                size="small"
                onClick={() => changeAppointmentStatus(record, "rejected")}
                style={{ borderRadius: 8 }}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === "approved" && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => completeAppointment(record)}
              style={{ 
                background: 'linear-gradient(135deg, #00b894, #00a085)',
                border: 'none',
                borderRadius: 8
              }}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];
  useEffect(() => {
    getAppointmentsData();
  }, []);

  return (
    <Layout>
      <div className="doctor-appointments-page">
        <Title level={1} className="page-title">My Appointments</Title>
        <hr />
        <Card style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              allowClear
              placeholder="Filter by status"
              style={{ width: 180 }}
              value={filters.status}
              onChange={(value) => setFilters((f) => ({ ...f, status: value }))}
              options={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "completed", label: "Completed" },
                { value: "rejected", label: "Rejected" },
              ]}
              suffixIcon={<FilterOutlined />}
            />
            <DatePicker
              placeholder="Filter by date"
              value={filters.date}
              onChange={(value) => setFilters((f) => ({ ...f, date: value }))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => setFilters({ status: undefined, date: null })}>
              Reset
            </Button>
          </Space>
        </Card>
        <Card className="appointments-table-container">
          <Table 
            columns={columns} 
            dataSource={filteredAppointments}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} appointments`,
            }}
            scroll={{ x: 1000 }}
            rowKey="_id"
          />
        </Card>

        {/* View modal removed */}

        {/* Edit Appointment Modal removed as per request */}
      </div>
    </Layout>
  );
}

export default DoctorAppointments;
