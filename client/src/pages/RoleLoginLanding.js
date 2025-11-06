import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function RoleLoginLanding() {
  const navigate = useNavigate();

  const roleCards = [
    {
      id: "admin",
      title: "Admin Login",
      description: "Manage users, doctors and approvals",
      icon: "ri-shield-user-line",
      color: "#667eea",
      onClick: () => navigate("/login/admin"),
    },
    {
      id: "user",
      title: "User Login",
      description: "Book appointments and manage profile",
      icon: "ri-user-line",
      color: "#27ae60",
      onClick: () => navigate("/login/user"),
    },
    {
      id: "doctor",
      title: "Doctor Login",
      description: "View appointments and update availability",
      icon: "ri-stethoscope-line",
      color: "#e74c3c",
      onClick: () => navigate("/login/doctor"),
    },
  ];

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
        <div className="row justify-content-center">
          <div className="col-12 text-center mb-5">
            <h1 
              className="page-title mb-3"
              style={{
                animation: "fadeInDown 1s ease-out"
              }}
            >
              Select Your Portal
            </h1>
            <p 
              className="text-muted mb-5" 
              style={{ 
                fontSize: '1.2rem',
                maxWidth: '600px',
                margin: '0 auto',
                animation: "fadeInUp 1s ease-out 0.3s both"
              }}
            >
              Choose the appropriate portal based on your role to access the system
            </p>
          </div>

          {roleCards.map((role, index) => (
            <div 
              key={role.id}
              className="col-12 col-md-4 mb-4"
              style={{
                animation: `fadeInUp 0.5s ease-out ${0.5 + index * 0.2}s both`
              }}
            >
              <div 
                className="card p-4 h-100"
                style={{ 
                  cursor: "pointer",
                  borderRadius: "20px",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
                  border: "none",
                  transition: "all 0.3s ease",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden"
                }} 
                onClick={role.onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.15)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.1)";
                }}
              >
                <div 
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "5px",
                    background: `linear-gradient(90deg, ${role.color}, #764ba2)`
                  }}
                />
                <div className="text-center mb-4" style={{ fontSize: 60, color: role.color }}>
                  <i className={role.icon}></i>
                </div>
                <h3 
                  className="text-center mb-3" 
                  style={{ 
                    fontWeight: "700", 
                    color: "#2c3e50",
                    fontSize: "1.5rem"
                  }}
                >
                  {role.title}
                </h3>
                <p 
                  className="text-center text-muted mb-4"
                  style={{
                    fontSize: "1rem",
                    minHeight: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {role.description}
                </p>
                <div 
                  className="text-center" 
                  style={{ 
                    marginTop: 8,
                    opacity: 0.8,
                    transition: "opacity 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                  }}
                >
                  <span 
                    style={{
                      color: role.color,
                      fontWeight: "600",
                      fontSize: "0.9rem"
                    }}
                  >
                    Click to proceed →
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="col-12 text-center mt-4">
            <div 
              className="card p-4"
              style={{
                borderRadius: "15px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
                border: "none",
                background: "rgba(255, 255, 255, 0.8)",
                maxWidth: "500px",
                margin: "0 auto"
              }}
            >
              <h4 className="text-center mb-3" style={{ color: "#2c3e50", fontWeight: "600" }}>
                New to our platform?
              </h4>
              <p className="text-center text-muted mb-3">
                Join as a healthcare professional to provide services
              </p>
              <div className="text-center">
                <button
                  className="btn btn-primary"
                  style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    border: "none",
                    borderRadius: "50px",
                    padding: "10px 25px",
                    fontWeight: "600",
                    transition: "all 0.3s ease"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/register");
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 5px 15px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  Apply as Doctor
                </button>
              </div>
            </div>
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
        `}
      </style>
    </div>
  );
}

export default RoleLoginLanding;


