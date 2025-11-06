import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function InitialLanding() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  
  // Simulated doctor images (in a real app, these would be actual image URLs)
  const doctorImages = [
    { id: 1, alt: "Doctor 1" },
    { id: 2, alt: "Doctor 2" },
    { id: 3, alt: "Doctor 3" }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % doctorImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const handleNext = () => {
    navigate("/portal-selection");
  };
  
  return (
    <div 
      className="home-container" 
      style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 24,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }}
    >
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-12 text-center mb-5">
            <h1 
              className="page-title mb-4"
              style={{
                animation: "fadeInDown 1s ease-out"
              }}
            >
              Welcome to Doctor Appointment Booking
            </h1>
            <p 
              className="text-muted mb-5" 
              style={{ 
                fontSize: '1.3rem',
                maxWidth: '600px',
                margin: '0 auto',
                animation: "fadeInUp 1s ease-out 0.3s both"
              }}
            >
              Your health is our priority. Connect with top medical professionals anytime, anywhere.
            </p>
          </div>
          
          {/* Doctor Image Carousel */}
          <div className="col-12 col-md-6 mb-5 order-md-2">
            <div 
              className="doctor-image-container"
              style={{
                position: 'relative',
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                perspective: '1000px'
              }}
            >
              {doctorImages.map((image, index) => (
                <div
                  key={image.id}
                  className="doctor-image"
                  style={{
                    position: 'absolute',
                    width: '250px',
                    height: '300px',
                    borderRadius: '20px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    transform: `rotateY(${(index - currentImage) * 60}deg) translateZ(${index === currentImage ? '0' : '-100px'})`,
                    opacity: index === currentImage ? 1 : 0.7,
                    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    zIndex: index === currentImage ? 2 : 1
                  }}
                >
                  <div>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍⚕️</div>
                    <div>Dr. {image.alt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Features Section */}
          <div className="col-12 col-md-6 order-md-1 mb-5">
            <div 
              className="features-container"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                animation: "fadeInLeft 1s ease-out 0.6s both"
              }}
            >
              <h3 style={{
                color: '#2c3e50',
                marginBottom: '20px',
                fontWeight: '700'
              }}>
                Why Choose Us?
              </h3>
              <ul 
                className="features-list"
                style={{
                  listStyle: 'none',
                  padding: 0
                }}
              >
                {["Top Medical Professionals", "Easy Online Booking", "Secure & Confidential"].map((feature, index) => (
                  <li 
                    key={index}
                    style={{
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      animation: `fadeInUp 0.5s ease-out ${0.8 + index * 0.1}s both`
                    }}
                  >
                    <span 
                      style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        marginRight: '10px',
                        fontSize: '12px'
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ color: '#34495e', fontWeight: '500' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="col-12 text-center mt-3">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={handleNext}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '50px',
                height: '60px',
                fontSize: '18px',
                fontWeight: '600',
                padding: '0 40px',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                animation: "fadeIn 1s ease-out 1.2s both"
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #5a6fd8, #6a4190)';
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
}

export default InitialLanding;