import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Col, Row, Button, Form, Input, message, Card, Typography } from "antd";
import Doctor from "../components/Doctor";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import "./Home.css";

const { Title, Text } = Typography;

function Home() {
  const [doctors, setDoctors] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
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
      const response = await axios.post("/api/user/search-doctors", { searchTerm: values.healthIssue }, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.data.success) {
        setSearchResults(response.data.data);
        if (response.data.data.length === 0) {
          message.info("No doctors found matching your search");
        }
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error searching doctors");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Determine which doctors to display
  const doctorsToDisplay = searchResults.length > 0 ? searchResults : doctors;

  return (
    <Layout>
      <div className="home-page">
        <Title level={1} className="page-title">Find Your Perfect Doctor</Title>
        <hr />
        
        {/* Search Section */}
        <Card className="search-section">
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item 
              name="healthIssue" 
              label="Search doctor" 
              rules={[{ required: true, message: "Please enter doctor name to search!" }]}
            >
              <Input 
                placeholder="Enter doctor name..." 
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large">
                Search Doctor
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Search Results Section */}
        {searchResults.length > 0 && (
          <Card className="recommended-doctors">
            <Title level={2}>
              {searchResults.length > 0 ? `Found ${searchResults.length} Doctor(s)` : "No Doctors Found"}
            </Title>
            {searchResults.length === 0 && (
              <Text>No doctors found matching your search criteria.</Text>
            )}
          </Card>
        )}

        {/* Doctors Section */}
        <div className="doctors-grid">
          <Row gutter={[24, 24]}>
            {doctorsToDisplay.length > 0 ? (
              doctorsToDisplay.map((doctor) => (
                <Col span={8} xs={24} sm={12} lg={8} key={doctor._id}>
                  <Doctor doctor={doctor} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div className="no-doctors">
                  <Title level={3}>No Doctors Available</Title>
                  <Text>There are currently no approved doctors in the system.</Text>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </Layout>
  );
}

export default Home;