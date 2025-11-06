import { Tabs, Card, Button, Badge, Avatar, Tag, Typography, Empty, Divider } from "antd";
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  InfoCircleOutlined,
  DeleteOutlined,
  CheckOutlined
} from "@ant-design/icons";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { hideLoading, showLoading } from "../redux/alertsSlice";
import { setUser } from "../redux/userSlice";
import moment from "moment";
import "./Notifications.css";

const { Text } = Typography;

function Notifications() {
  const {user} = useSelector((state) => state.user);
  const unseen = Array.isArray(user?.unseenNotifications) ? user.unseenNotifications : [];
  const seen = Array.isArray(user?.seenNotifications) ? user.seenNotifications : [];
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNotificationClick = (notification) => {
    // Prefer explicit onClickPath from backend. Fallback by type if missing.
    if (notification.onClickPath) {
      return navigate(notification.onClickPath);
    }
    if (notification.type === "new-doctor-request" && notification.data?.doctorId) {
      return navigate(`/admin/doctor-application/${notification.data.doctorId}`);
    }
    if (user?.isDoctor) {
      return navigate("/doctor/appointments");
    }
    if (user?.isAdmin) {
      return navigate("/admin/dashboard");
    }
    return navigate("/appointments");
  };

  const markAllAsSeen = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/mark-all-notifications-as-seen", {userId : user._id} , {
        headers: {
          Authorization : `Bearer ${localStorage.getItem("token")}`
        }
      });
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message)
        dispatch(setUser(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  }

  const deleteAll = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/delete-all-notifications", {userId : user._id} , {
        headers: {
          Authorization : `Bearer ${localStorage.getItem("token")}`
        }
      });
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message)
        dispatch(setUser(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new-doctor-request':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'new-doctor-request-changed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'new-appointment-request':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <BellOutlined style={{ color: '#722ed1' }} />;
    }
  };

  const getNotificationType = (type) => {
    switch (type) {
      case 'new-doctor-request-changed':
        return 'success';
      case 'new-appointment-request':
        return 'warning';
      default:
        return 'info';
    }
  };

  const NotificationItem = ({ notification, index, isSeen = false }) => {
    const type = getNotificationType(notification?.type);
    // Derive a visible message if backend didn't set one (handle older records defensively)
    const displayMessage = notification?.message
      || notification?.data?.message
      || (notification?.type === 'new-doctor-request'
          ? `${notification?.data?.name || 'A doctor'} has applied for a doctor account`
          : notification?.type === 'new-doctor-request-changed'
          ? `Doctor application was ${notification.status || 'updated'}`
          : notification?.type === 'new-appointment-request'
          ? `You have a new appointment request`
          : notification?.type === 'new-appointment'
          ? `A new appointment has been created`
          : notification?.type === 'appointment-booked'
          ? `Your appointment has been booked successfully`
          : notification?.type === 'appointment-completed'
          ? `Your appointment has been completed`
          : notification?.type === 'appointment-status-changed'
          ? `Your appointment status has changed`
          : notification?.type === 'appointment-updated'
          ? `Your appointment has been updated`
          : 'You have a new notification');
    const createdAt = notification?.createdAt || notification?.timestamp || Date.now();
    
    return (
      <Card 
        className={`notification-card ${!isSeen ? 'notification-unread' : ''}`}
        size="small"
        style={{ marginBottom: 16, cursor: 'pointer' }}
        onClick={() => handleNotificationClick(notification)}
        hoverable
      >
        <div className="d-flex align-items-start">
          <Avatar 
            size={48} 
            icon={getNotificationIcon(notification.type)}
            className="notification-avatar"
            style={{ 
              background: isSeen ? 'linear-gradient(135deg, #95a5a6, #7f8c8d)' : 'linear-gradient(135deg, #667eea, #764ba2)',
              boxShadow: isSeen ? '0 2px 8px rgba(149, 165, 166, 0.3)' : '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          />
          <div className="notification-content" style={{ flex: 1, marginLeft: 16 }}>
            <div className="d-flex justify-content-between align-items-start">
              <div style={{ flex: 1 }}>
                <Text strong style={{ 
                  fontSize: 16,
                  display: 'block',
                  marginBottom: 6,
                  color: isSeen ? '#374151' : '#111827' /* darker for better readability */
                }}>
                  {notification.type === 'new-doctor-request' ? 'New Doctor Application' :
                   notification.type === 'new-doctor-request-changed' ? 'Doctor Application Updated' :
                   notification.type === 'new-appointment-request' ? 'New Appointment Request' :
                   notification.type === 'new-appointment' ? 'New Appointment' :
                   notification.type === 'appointment-booked' ? 'Appointment Booked' :
                   notification.type === 'appointment-completed' ? 'Appointment Completed' :
                   notification.type === 'appointment-status-changed' ? 'Appointment Status Changed' :
                   notification.type === 'appointment-updated' ? 'Appointment Updated' :
                   'Notification'}
                </Text>
                <Text style={{ 
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#1f2937'
                }}>
                  {displayMessage}
                </Text>
              </div>
              <div className="notification-actions">
                {!isSeen && (
                  <Badge 
                    status="processing" 
                    style={{ 
                      background: '#ff4757',
                      boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)'
                    }}
                  />
                )}
              </div>
            </div>
            <Divider style={{ margin: '12px 0 8px 0', borderColor: '#e9ecef' }} />
            <div className="d-flex justify-content-between align-items-center">
              <Tag color={type} size="small" style={{ borderRadius: 12, fontWeight: 600 }}>
                {type.toUpperCase()}
              </Tag>
              <Text type="secondary" style={{ 
                fontSize: 12, 
                display: 'flex', 
                alignItems: 'center',
                color: '#95a5a6'
              }}>
                <ClockCircleOutlined style={{ marginRight: 6, fontSize: 12 }} />
                {moment(createdAt).isValid() ? moment(createdAt).fromNow() : 'Just now'}
              </Text>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="notifications-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="page-title">
              <BellOutlined style={{ marginRight: 12, fontSize: '2.2rem' }} />
              Notifications
            </h1>
            <p className="text-muted">Stay updated with your appointment activities and system updates</p>
          </div>
          {unseen.length > 0 && (
            <Button 
              type="primary" 
              icon={<CheckOutlined />}
              onClick={markAllAsSeen}
              size="large"
            >
              Mark All as Read
            </Button>
          )}
        </div>
        
        <Card className="notifications-container">
          <Tabs 
            defaultActiveKey="unseen"
            className="notification-tabs"
            items={[
              {
                key: "unseen",
                label: (
                  <span>
                    <BellOutlined />
                    <span style={{ marginLeft: 8 }}>
                      Unseen ({unseen.length})
                    </span>
                    {unseen.length > 0 && (
                      <Badge count={unseen.length} style={{ marginLeft: 8 }} />
                    )}
                  </span>
                ),
                children: (
                  <div>
                    {unseen.length === 0 ? (
                      <Empty 
                        description={
                          <div style={{ textAlign: 'center' }}>
                            <BellOutlined style={{ fontSize: 48, color: '#bdc3c7', marginBottom: 16 }} />
                            <div style={{ fontSize: 18, color: '#6c757d', marginBottom: 8 }}>All caught up!</div>
                            <div style={{ fontSize: 14, color: '#95a5a6' }}>No unseen notifications at the moment</div>
                          </div>
                        }
                        image={null}
                      />
                    ) : (
                      unseen.map((notification, index) => (
                        <NotificationItem 
                          key={index} 
                          notification={notification} 
                          index={index}
                          isSeen={false}
                        />
                      ))
                    )}
                  </div>
                ),
              },
              {
                key: "seen",
                label: (
                  <span>
                    <CheckCircleOutlined />
                    <span style={{ marginLeft: 8 }}>
                      Seen ({seen.length})
                    </span>
                  </span>
                ),
                children: (
                  <div>
                    {seen.length === 0 ? (
                      <Empty 
                        description={
                          <div style={{ textAlign: 'center' }}>
                            <CheckCircleOutlined style={{ fontSize: 48, color: '#bdc3c7', marginBottom: 16 }} />
                            <div style={{ fontSize: 18, color: '#6c757d', marginBottom: 8 }}>No history yet</div>
                            <div style={{ fontSize: 14, color: '#95a5a6' }}>Your notification history will appear here</div>
                          </div>
                        }
                        image={null}
                      />
                    ) : (
                      <div className="d-flex justify-content-end mb-3">
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={deleteAll}
                        >
                          Delete All
                        </Button>
                      </div>
                    )}
                    {seen.map((notification, index) => (
                      <NotificationItem 
                        key={index} 
                        notification={notification} 
                        index={index}
                        isSeen={true}
                      />
                    ))}
                  </div>
                ),
              }
            ]}
          />
        </Card>
      </div>
    </Layout>
  );
}

export default Notifications;
