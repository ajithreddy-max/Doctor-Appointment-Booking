import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../components/Layout";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import {toast} from 'react-hot-toast'
import axios from "axios";
import { Table, Card, Typography, Tag, Button } from "antd";
import moment from "moment";
import "../Admin.css";

const { Title } = Typography;

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const dispatch = useDispatch();
  const getDoctorsData = async () => {
    try {
      dispatch(showLoading());
      const resposne = await axios.get("/api/admin/get-all-doctors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (resposne.data.success) {
        setDoctors(resposne.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  const changeDoctorStatus = async (record, status) => {
    try {
      dispatch(showLoading());
      const resposne = await axios.post(
        "/api/admin/change-doctor-account-status",
        { doctorId: record._id, userId: record.userId, status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (resposne.data.success) {
        toast.success(resposne.data.message);
        getDoctorsData();
      }
    } catch (error) {
      toast.error('Error changing doctor account status');
      dispatch(hideLoading());
    }
  };
  useEffect(() => {
    getDoctorsData();
  }, []);
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'orange';
      case 'approved':
        return 'green';
      case 'blocked':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: "Doctor Name",
      dataIndex: "name",
      render: (text, record) => (
        <span style={{ fontWeight: 600, color: '#2c3e50' }}>
          Dr. {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      render: (text) => (
        <span style={{ fontFamily: 'monospace', color: '#6c757d' }}>
          {text}
        </span>
      ),
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      render: (text) => (
        <Tag color="blue" style={{ borderRadius: 12, fontWeight: 600 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Joined Date",
      dataIndex: "createdAt",
      render: (record, text) => moment(record.createdAt).format("MMM DD, YYYY"),
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {record.status === "pending" && (
            <Button
              type="primary"
              size="small"
              onClick={() => changeDoctorStatus(record, "approved")}
              style={{ 
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600
              }}
            >
              Approve
            </Button>
          )}
          {record.status === "approved" && (
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => changeDoctorStatus(record, "blocked")}
              style={{ 
                borderRadius: 8,
                fontWeight: 600
              }}
            >
              Block
            </Button>
          )}
          {record.status === "blocked" && (
            <Button
              type="primary"
              size="small"
              onClick={() => changeDoctorStatus(record, "approved")}
              style={{ 
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600
              }}
            >
              Unblock
            </Button>
          )}
        </div>
      ),
    },
  ];
  return (
    <Layout>
      <div className="doctors-list-page">
        <Title level={1} className="page-header">Doctors Management</Title>
        <hr />
        <Card className="doctors-table-container">
          <Table 
            columns={columns} 
            dataSource={doctors}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} doctors`,
            }}
            scroll={{ x: 800 }}
            rowKey="_id"
          />
        </Card>
      </div>
    </Layout>
  );
}

export default DoctorsList;
