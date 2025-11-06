import React, { useCallback, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Button, Card, Checkbox, Col, DatePicker, Form, InputNumber, Row, TimePicker, Typography, message } from "antd";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import './Availability.css';

const { Title } = Typography;
const { RangePicker } = TimePicker;

const Availability = () => {
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState(null);

  const workingDaysOptions = [
    { label: 'Monday', value: 'Mon' },
    { label: 'Tuesday', value: 'Tue' },
    { label: 'Wednesday', value: 'Wed' },
    { label: 'Thursday', value: 'Thu' },
    { label: 'Friday', value: 'Fri' },
    { label: 'Saturday', value: 'Sat' },
    { label: 'Sunday', value: 'Sun' },
  ];

  const fetchDoctorInfo = useCallback(async () => {
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
      if (res.data.success) {
        setDoctor(res.data.data);
        form.setFieldsValue({
          workingDays: res.data.data.workingDays || [],
          timings: res.data.data.timings && res.data.data.timings.length === 2 
            ? [moment(res.data.data.timings[0], "HH:mm"), moment(res.data.data.timings[1], "HH:mm")] 
            : [],
          slotDurationMinutes: res.data.data.slotDurationMinutes || 30
        });
        setHolidays(res.data.data.holidays || []);
      }
    } catch (error) {
      message.error("Failed to fetch doctor information");
    }
  }, [form]);

  useEffect(() => {
    fetchDoctorInfo();
  }, [fetchDoctorInfo]);

  const onFinish = async (values) => {
    try {
      const response = await axios.post(
        "/api/doctor/set-availability",
        {
          workingDays: values.workingDays,
          timings: values.timings ? [
            moment(values.timings[0]).format("HH:mm"),
            moment(values.timings[1]).format("HH:mm")
          ] : [],
          slotDurationMinutes: values.slotDurationMinutes,
          holidays: holidays
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.success) {
        message.success(response.data.message);
        fetchDoctorInfo(); // Refresh data
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Something went wrong");
    }
  };

  const addHoliday = () => {
    if (newHoliday) {
      const formattedDate = moment(newHoliday).format("DD-MM-YYYY");
      if (!holidays.includes(formattedDate)) {
        setHolidays([...holidays, formattedDate]);
        setNewHoliday(null);
      } else {
        message.warning("This date is already in your holidays list");
      }
    }
  };

  const removeHoliday = (date) => {
    setHolidays(holidays.filter(holiday => holiday !== date));
  };

  return (
    <Layout>
      <div className="availability-container">
        <Title level={2}>Manage Availability</Title>
        <Card title="Working Hours and Days">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              slotDurationMinutes: 30
            }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="workingDays"
                  label="Working Days"
                  rules={[{ required: true, message: 'Please select at least one working day' }]}
                >
                  <Checkbox.Group options={workingDaysOptions} />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="timings"
                  label="Working Hours"
                  rules={[{ required: true, message: 'Please select your working hours' }]}
                >
                  <RangePicker format="HH:mm" minuteStep={30} />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="slotDurationMinutes"
                  label="Appointment Slot Duration (minutes)"
                  rules={[{ required: true, message: 'Please enter slot duration' }]}
                >
                  <InputNumber min={5} max={240} step={5} />
                </Form.Item>
              </Col>
            </Row>
            
            <Card title="Holidays" style={{ marginBottom: 20 }}>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item label="Add Holiday">
                    <DatePicker 
                      value={newHoliday} 
                      onChange={(date) => setNewHoliday(date)} 
                      format="DD-MM-YYYY" 
                      placeholder="Select a holiday"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Button 
                    type="primary" 
                    onClick={addHoliday}
                    style={{ marginTop: 30 }}
                  >
                    Add Holiday
                  </Button>
                </Col>
              </Row>
              
              {holidays.length > 0 && (
                <div>
                  <Title level={5}>Current Holidays:</Title>
                  <ul>
                    {holidays.map((holiday, index) => (
                      <li key={index}>
                        {holiday} 
                        <Button 
                          type="link" 
                          danger 
                          onClick={() => removeHoliday(holiday)}
                          style={{ marginLeft: 10 }}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
            
            <Button type="primary" htmlType="submit">
              Update Availability
            </Button>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default Availability;