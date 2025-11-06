import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../components/Layout";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import axios from "axios";
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Space, Avatar, Badge, Typography, Spin } from "antd";
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  EditOutlined
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import "../Admin.css";

const { Title, Text } = Typography;

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    completedAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getDashboardData = async () => {
    try {
      dispatch(showLoading());
      const [usersRes, doctorsRes, appointmentsRes] = await Promise.all([
        axios.get("/api/admin/get-all-users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }),
        axios.get("/api/admin/get-all-doctors", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }),
        axios.get("/api/admin/get-all-appointments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
      ]);

      const users = usersRes.data.data || [];
      const doctors = doctorsRes.data.data || [];
      const appointments = appointmentsRes.data.data || [];

      setStats({
        totalUsers: users.length,
        totalDoctors: doctors.length,
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
        approvedAppointments: appointments.filter(apt => apt.status === 'approved').length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length
      });

      setRecentAppointments(appointments.slice(0, 5));
      setRecentUsers(users.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      dispatch(hideLoading());
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const appointmentColumns = [
    {
      title: 'Patient',
      dataIndex: 'userInfo',
      key: 'patient',
      render: (userInfo) => (
        <div className="d-flex align-items-center">
          <Avatar size="small" icon={<UserOutlined />} />
          <span className="ml-2">{userInfo?.name}</span>
        </div>
      ),
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorInfo',
      key: 'doctor',
      render: (doctorInfo) => (
        <div className="d-flex align-items-center">
          <Avatar size="small" icon={<MedicineBoxOutlined />} />
          <span className="ml-2">{doctorInfo?.firstName} {doctorInfo?.lastName}</span>
        </div>
      ),
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (record) => (
        <div>
          <div>{moment(record.date, "DD-MM-YYYY").format('MMM DD, YYYY')}</div>
          <div className="text-muted">{moment(record.time, "HH:mm").format('HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Symptoms',
      dataIndex: 'symptoms',
      key: 'symptoms',
      render: (symptoms) => (
        <div>
          {symptoms && symptoms.length > 0 ? (
            <div>
              {symptoms.slice(0, 2).map((symptom, index) => (
                <Tag key={index} color="blue" style={{ margin: 2 }}>
                  {symptom}
                </Tag>
              ))}
              {symptoms.length > 2 && (
                <Tag color="blue" style={{ margin: 2 }}>
                  +{symptoms.length - 2}
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', icon: <ClockCircleOutlined /> },
          approved: { color: 'blue', icon: <CheckCircleOutlined /> },
          completed: { color: 'green', icon: <CheckCircleOutlined /> },
          rejected: { color: 'red', icon: <ExclamationCircleOutlined /> }
        };
        const config = statusConfig[status] || { color: 'default', icon: null };
        return (
          <Tag color={config.color} icon={config.icon}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  const userColumns = [
    {
      title: 'User',
      key: 'user',
      render: (record) => (
        <div className="d-flex align-items-center">
          <Avatar size="small" icon={<UserOutlined />} />
          <div className="ml-2">
            <div className="font-weight-bold">{record.name}</div>
            <div className="text-muted small">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (record) => (
        <Tag color={record.isAdmin ? 'red' : record.isDoctor ? 'blue' : 'green'}>
          {record.isAdmin ? 'Admin' : record.isDoctor ? 'Doctor' : 'User'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'joined',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="admin-dashboard">
          <div className="admin-loading">
            <Spin size="large" />
            <Text style={{ marginLeft: 16, fontSize: 16 }}>Loading dashboard...</Text>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="mb-4">
          <Title level={1} className="page-title">Admin Dashboard</Title>
          <Text className="text-muted">Welcome back! Here's what's happening with your healthcare platform.</Text>
        </div>
        
        {/* Statistics Cards */}
        <Row gutter={[24, 24]} className="mb-4">
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card stats-card--users">
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card stats-card--doctors">
              <Statistic
                title="Total Doctors"
                value={stats.totalDoctors}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card stats-card--appointments">
              <Statistic
                title="Total Appointments"
                value={stats.totalAppointments}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card stats-card--pending">
              <Statistic
                title="Pending Appointments"
                value={stats.pendingAppointments}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              
              </Card>
            </Col>
        </Row>
        
        {/* Progress Overview */}
        <Row gutter={[24, 24]} className="mb-4">
          <Col xs={24} lg={12}>
            <Card title="Appointment Status Overview" className="progress-card">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Completed</span>
                  <span className="font-weight-bold">{stats.completedAppointments}</span>
                </div>
                <Progress 
                  percent={stats.totalAppointments > 0 ? (stats.completedAppointments / stats.totalAppointments) * 100 : 0} 
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Approved</span>
                  <span className="font-weight-bold">{stats.approvedAppointments}</span>
                </div>
                <Progress 
                  percent={stats.totalAppointments > 0 ? (stats.approvedAppointments / stats.totalAppointments) * 100 : 0} 
                  strokeColor="#1890ff"
                  showInfo={false}
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Pending</span>
                  <span className="font-weight-bold">{stats.pendingAppointments}</span>
                </div>
                <Progress 
                  percent={stats.totalAppointments > 0 ? (stats.pendingAppointments / stats.totalAppointments) * 100 : 0} 
                  strokeColor="#fa8c16"
                  showInfo={false}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Quick Actions" className="quick-actions-card">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button type="primary" icon={<UserOutlined />} block onClick={() => navigate('/admin/userslist')}>
                  Manage Users
                </Button>
                <Button type="default" icon={<MedicineBoxOutlined />} block onClick={() => navigate('/admin/doctorslist')}>
                  Manage Doctors
                </Button>
                <Button type="default" icon={<CalendarOutlined />} block onClick={() => navigate('/admin/appointments')}>
                  View All Appointments
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Recent Data Tables */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card 
              title="Recent Appointments" 
              extra={<Button type="link" onClick={() => navigate('/admin/appointments')}>View All</Button>}
              className="recent-table-card"
            >
              <Table
                columns={appointmentColumns}
                dataSource={recentAppointments}
                pagination={false}
                size="small"
                rowKey="_id"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card 
              title="Recent Users" 
              extra={<Button type="link" onClick={() => navigate('/admin/userslist')}>View All</Button>}
              className="recent-table-card"
            >
              <Table
                columns={userColumns}
                dataSource={recentUsers}
                pagination={false}
                size="small"
                rowKey="_id"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
