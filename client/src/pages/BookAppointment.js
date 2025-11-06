import { Button, Col, DatePicker, Form, Input, Row, TimePicker, Select, Card, Typography } from "antd";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import DoctorForm from "../components/DoctorForm";
import moment from "moment";

const { Option } = Select;
const { Title } = Typography;

function BookAppointment() {
  const [isAvailable, setIsAvailable] = useState(false);
  const navigate = useNavigate();
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const [symptoms, setSymptoms] = useState([]);
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();

  // Common symptoms/diseases list
  const commonSymptoms = [
    "Fever",
    "Cough",
    "Headache",
    "Cold",
    "Flu",
    "Stomach Pain",
    "Back Pain",
    "Joint Pain",
    "Allergies",
    "Skin Rash",
    "Sore Throat",
    "Nausea",
    "Vomiting",
    "Diarrhea",
    "Fatigue",
    "Dizziness",
    "Shortness of Breath",
    "Chest Pain",
    "High Blood Pressure",
    "Diabetes",
    "Anxiety",
    "Depression",
    "Insomnia",
    "Weight Loss",
    "Weight Gain",
    "Eye Problems",
    "Ear Problems",
    "Nose Problems",
    "Throat Problems",
    "Dental Problems"
  ];

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
        const d = response.data.data;
        // Normalize timings to an array [start,end]
        let timings = d?.timings;
        if (timings && !Array.isArray(timings) && typeof timings === 'string') {
          try {
            const parsed = JSON.parse(timings);
            if (Array.isArray(parsed)) timings = parsed;
          } catch (e) {
            // fallback: try to split by comma e.g. "10:00,17:00"
            const parts = timings.split(',');
            if (parts.length === 2) timings = parts.map(s => s.trim());
          }
        }
        setDoctor({ ...d, timings });
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
    // Ensure time is within doctor's working hours
    if (doctor && doctor.timings && doctor.timings.length === 2) {
      const workStart = moment(doctor.timings[0], "HH:mm");
      const workEnd = moment(doctor.timings[1], "HH:mm");
      const selectedTimeOnly = moment(time, "HH:mm");
      if (!selectedTimeOnly.isBetween(workStart, workEnd, undefined, "[]")) {
        toast.error(`Selected time must be between ${workStart.format("HH:mm")} and ${workEnd.format("HH:mm")}`);
        return;
      }
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
    // Ensure time is within doctor's working hours before booking
    if (doctor && doctor.timings && doctor.timings.length === 2) {
      const workStart = moment(doctor.timings[0], "HH:mm");
      const workEnd = moment(doctor.timings[1], "HH:mm");
      const selectedTimeOnly = moment(time, "HH:mm");
      if (!selectedTimeOnly.isBetween(workStart, workEnd, undefined, "[]")) {
        toast.error(`Selected time must be between ${workStart.format("HH:mm")} and ${workEnd.format("HH:mm")}`);
        return;
      }
    }

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

    // Check if symptoms are selected
    if (symptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }

    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: {
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            phoneNumber: doctor.phoneNumber,
            specialization: doctor.specialization,
            address: doctor.address,
            feePerCunsultation: doctor.feePerCunsultation
          },
          userInfo: {
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber || ""
          },
          date: date,
          time: time,
          symptoms: symptoms
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
              <div style={{
                width: '100%',
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 100%)',
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <span className="gradient-text" style={{ fontSize: 28, fontWeight: 700 }}>
                  Book Your Appointment
                </span>
              </div>
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
                  disabledMinutes={(selectedHour) => {
                    // Disable minutes outside [start,end] bounds when on edge hours
                    if (!(doctor && doctor.timings && doctor.timings.length === 2)) return [];
                    const start = doctor.timings[0];
                    const end = doctor.timings[1];
                    const startHour = parseInt(start.split(':')[0]);
                    const startMinute = parseInt(start.split(':')[1]);
                    const endHour = parseInt(end.split(':')[0]);
                    const endMinute = parseInt(end.split(':')[1]);
                    const mins = [];
                    // If before start hour or after end hour, all minutes disabled (already handled by disabledHours)
                    if (selectedHour === startHour) {
                      for (let m = 0; m < startMinute; m++) mins.push(m);
                    }
                    if (selectedHour === endHour) {
                      for (let m = endMinute + 1; m < 60; m++) mins.push(m);
                    }
                    return mins;
                  }}
                  minuteStep={15}
                  onChange={(value) => {
                    setIsAvailable(false);
                    setTime(moment(value).format("HH:mm"));
                  }}
                />
                
                <Card title="Select Symptoms" className="mt-3">
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Select symptoms"
                    value={symptoms}
                    onChange={(value) => setSymptoms(value)}
                    tokenSeparators={[',']}
                  >
                    {commonSymptoms.map(symptom => (
                      <Option key={symptom} value={symptom}>{symptom}</Option>
                    ))}
                  </Select>
                  <p className="text-muted mt-2" style={{ fontSize: '12px', color: '#666' }}>
                    * Select all symptoms that apply to your condition
                  </p>
                </Card>
                
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