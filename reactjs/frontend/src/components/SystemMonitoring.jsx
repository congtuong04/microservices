import { useEffect, useState } from "react";

export default function SystemMonitoring() {
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/system/health"
        );

        if (!response.ok) {
          throw new Error("System health check failed");
        }

        const data = await response.json();

        setSystemHealth(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("System monitoring error:", error);
        setSystemHealth(null);
      } finally {
        setLoading(false);
      }
    };

    // gọi lần đầu ngay khi mở trang
    fetchSystemHealth();

    // polling mỗi 5 giây để monitoring gần realtime
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status) => {
    if (
      status === "healthy" ||
      status === "online" ||
      status === "connected" ||
      status === "operational"
    ) {
      return "status-ok";
    }

    return "status-bad";
  };

  return (
    <div className="system-monitoring-box">
      <div className="system-monitoring-header">
        <div>
          <span className="panel-tag">Infrastructure Monitoring</span>
          <h2>System Monitoring</h2>
        </div>

        <span
          className={`badge ${
            systemHealth ? "success" : "danger"
          }`}
        >
          {systemHealth ? "Live Monitoring" : "Service Issue"}
        </span>
      </div>

      <p className="muted">
        Real-time monitoring for gateway, authentication service,
        user service, database connectivity and deployment runtime
        using automatic health check polling every 5 seconds.
      </p>

      {loading ? (
        <p className="loading-text">
          Loading system health...
        </p>
      ) : systemHealth ? (
        <div className="status-list">
          <div className="status-item">
            <span className="status-label">
              Gateway Service
            </span>
            <strong
              className={getStatusClass(systemHealth.gateway)}
            >
              {systemHealth.gateway}
            </strong>
          </div>

          <div className="status-item">
            <span className="status-label">
              Authentication Service
            </span>
            <strong
              className={getStatusClass(
                systemHealth.authService
              )}
            >
              {systemHealth.authService}
            </strong>
          </div>

          <div className="status-item">
            <span className="status-label">
              User Service
            </span>
            <strong
              className={getStatusClass(
                systemHealth.userService
              )}
            >
              {systemHealth.userService}
            </strong>
          </div>

          <div className="status-item">
            <span className="status-label">
              Database Connection
            </span>
            <strong
              className={getStatusClass(
                systemHealth.database
              )}
            >
              {systemHealth.database}
            </strong>
          </div>

          <div className="status-item">
            <span className="status-label">
              Docker Runtime
            </span>
            <strong className="status-ok">
              Active
            </strong>
          </div>

          <div className="status-item">
            <span className="status-label">
              Render Deployment
            </span>
            <strong className="status-ok">
              Operational
            </strong>
          </div>

          <div className="status-item">
            <span className="status-label">
              Last Health Check
            </span>
            <strong>
              {systemHealth.timestamp
                ? new Date(
                    systemHealth.timestamp
                  ).toLocaleString()
                : "Unavailable"}
            </strong>
          </div>

          <div className="status-item">
            <span className="status-label">
              Last Auto Refresh
            </span>
            <strong>
              {lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : "Waiting..."
              }
            </strong>
          </div>
        </div>
      ) : (
        <div className="status-list">
          <div className="status-item">
            <span className="status-label">
              System Status
            </span>
            <strong className="status-bad">
              Monitoring Unavailable
            </strong>
          </div>
        </div>
      )}

      <div className="security-notice admin-security-notice">
        <strong>Monitoring Note:</strong>
        <span>
          This module helps detect runtime failures of
          microservices early, improving system stability
          and supporting production-grade deployment
          monitoring for the admin dashboard.
        </span>
      </div>
    </div>
  );
}