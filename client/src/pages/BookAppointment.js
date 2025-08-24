import { Button, Col, DatePicker, Form, Input, Row, TimePicker } from "antd";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import DoctorForm from "../components/DoctorForm";
import moment from "moment";

function BookAppointment() {
  const [isAvailable, setIsAvailable] = useState(false);
  const navigate = useNavigate();
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();

  const getDoctorData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctor/get-doctor-info-by-id",
        {
          doctorId: params.doctorId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());
      if (response.data.success) {
        setDoctor(response.data.data);
      }
    } catch (error) {
      console.log(error);
      dispatch(hideLoading());
    }
  };
  const checkAvailability = async () => {
    // Validate that date and time are selected
    if (!date || !time) {
      toast.error("Please select both date and time");
      return;
    }

    // Additional validation to ensure selected date/time is not in the past
    const selectedDateTime = moment(`${date} ${time}`, "DD-MM-YYYY HH:mm");
    const currentDateTime = moment();
    
    if (selectedDateTime.isBefore(currentDateTime)) {
      toast.error("Cannot book appointments in the past. Please select a future date and time.");
      return;
    }

    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/check-booking-avilability",
        {
          doctorId: params.doctorId,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        setIsAvailable(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error booking appointment");
      dispatch(hideLoading());
    }
  };
  const bookNow = async () => {
    setIsAvailable(false);
    
    // Double-check validation before booking
    if (!date || !time) {
      toast.error("Please select both date and time");
      return;
    }

    const selectedDateTime = moment(`${date} ${time}`, "DD-MM-YYYY HH:mm");
    const currentDateTime = moment();
    
    if (selectedDateTime.isBefore(currentDateTime)) {
      toast.error("Cannot book appointments in the past. Please select a future date and time.");
      return;
    }

    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/appointments')
      }
    } catch (error) {
      toast.error("Error booking appointment");
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getDoctorData();
  }, []);
  return (
    <Layout>
      {doctor && (
        <div>
          <h1 className="page-title">
            {doctor.firstName} {doctor.lastName}
          </h1>
          <hr />
          <Row gutter={20} className="mt-5" align="middle">

            <Col span={8} sm={24} xs={24} lg={8}>
              <img
                src="https://thumbs.dreamstime.com/b/finger-press-book-now-button-booking-reservation-icon-online-149789867.jpg"
                alt=""
                width="100%"
                height='400'
              />
            </Col>
            <Col span={8} sm={24} xs={24} lg={8}>
              <h1 className="normal-text">
                <b>Timings :</b> {doctor.timings[0]} - {doctor.timings[1]}
              </h1>
              <p>
                <b>Phone Number : </b>
                {doctor.phoneNumber}
              </p>
              <p>
                <b>Address : </b>
                {doctor.address}
              </p>
              <p>
                <b>Fee per Visit : </b>
                {doctor.feePerCunsultation}
              </p>
              <div className="d-flex flex-column pt-2 mt-2">
                <DatePicker
                  format="DD-MM-YYYY"
                  placeholder="Select appointment date"
                  disabledDate={(current) => {
                    // Disable past dates - only allow current date and future dates
                    return current && current < moment().startOf('day');
                  }}
                  showToday={true}
                  onChange={(value) => {
                    setDate(moment(value).format("DD-MM-YYYY"));
                    setIsAvailable(false);
                  }}
                />
                <TimePicker
                  format="HH:mm"
                  placeholder="Select appointment time"
                  className="mt-3"
                  disabledHours={() => {
                    // Disable hours outside doctor's working hours if available
                    if (doctor && doctor.timings && doctor.timings.length === 2) {
                      const startHour = parseInt(doctor.timings[0].split(':')[0]);
                      const endHour = parseInt(doctor.timings[1].split(':')[0]);
                      const hours = [];
                      for (let i = 0; i < 24; i++) {
                        if (i < startHour || i > endHour) {
                          hours.push(i);
                        }
                      }
                      return hours;
                    }
                    // Default business hours: 8 AM to 8 PM
                    return [0, 1, 2, 3, 4, 5, 6, 7, 20, 21, 22, 23];
                  }}
                  minuteStep={15}
                  onChange={(value) => {
                    setIsAvailable(false);
                    setTime(moment(value).format("HH:mm"));
                  }}
                />
                <p className="text-muted mt-2" style={{ fontSize: '12px', color: '#666' }}>
                  * Only current date and future dates are available for booking
                </p>
                <p className="text-muted mt-1" style={{ fontSize: '12px', color: '#666' }}>
                  * Time slots are available in 15-minute intervals during business hours
                </p>
              {!isAvailable &&   <Button
                  className="primary-button mt-3 full-width-button"
                  onClick={checkAvailability}
                >
                  Check Availability
                </Button>}

                {isAvailable && (
                  <Button
                    className="primary-button mt-3 full-width-button"
                    onClick={bookNow}
                  >
                    Book Now
                  </Button>
                )}
              </div>
            </Col>
           
          </Row>
        </div>
      )}
    </Layout>
  );
}

export default BookAppointment;
