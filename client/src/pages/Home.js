import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Col, Row, Button, Form, Input, message } from "antd";
import Doctor from "../components/Doctor";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";

function Home() {
  const [doctors, setDoctors] = useState([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(showLoading())
      const response = await axios.get("/api/user/get-all-approved-doctors", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      dispatch(hideLoading())
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading())
    }
  };

  const onFinish = async (values) => {
    try {
      const response = await axios.post("/api/user/recommend-doctor", { healthIssue: values.healthIssue });
      if (response.data.success) {
        setRecommendedDoctors(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error fetching recommended doctors");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Layout>
      <div>
        <h1 className="page-title">Home</h1>
        <hr />
        <Row gutter={20} className="mt-5">
          <Col span={24}>
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item name="healthIssue" label="Enter your health issue" rules={[{ required: true, message: "Please input your health issue!" }]}>
                <Input placeholder="e.g., headache, fever, heart pain" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
        {recommendedDoctors.length > 0 && (
          <Row gutter={20} className="mt-5">
            <Col span={24}>
              <h2>Recommended Doctors</h2>
              <ul>
                {recommendedDoctors.map((doctor) => (
                  <li key={doctor._id}>{doctor.firstName} {doctor.lastName} - {doctor.specialization}</li>
                ))}
              </ul>
            </Col>
          </Row>
        )}
      </div>
      <Row gutter={20}>
        {doctors.map((doctor) => (
          <Col span={8} xs={24} sm={24} lg={8}>
            <Doctor doctor={doctor} />
          </Col>
        ))}
      </Row>
    </Layout>
  );
}

export default Home;
