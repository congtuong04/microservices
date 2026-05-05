import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function AuditLogs({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================== FIX: Wrap fetchLogs bằng useCallback ======================
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        "http://localhost:3000/auth/audit-logs",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setLogs(res.data);
    } catch (err) {
      console.error("Fetch audit logs error:", err);
      setError(err.response?.data?.message || "Không thể tải logs");
    } finally {
      setLoading(false);
    }
  }, [token]);   // ← Chỉ phụ thuộc vào token

  // Gọi khi component mount và khi token thay đổi
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="panel table-panel">
      <div className="panel-head">
        <div>
          <span className="panel-tag">Security Audit</span>
          <h2>Audit Logs - Hoạt động hệ thống</h2>
        </div>
        <button 
          className="secondary-btn" 
          onClick={fetchLogs}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "↻ Refresh"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Hành động</th>
              <th>Người dùng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="loading-cell">Đang tải dữ liệu...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-cell">Chưa có log nào được ghi nhận</td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr key={log.id || index}>
                  <td>
                    <span className="badge">{log.action}</span>
                  </td>
                  <td>
                    <strong>{log.username || "Unknown"}</strong>
                    {log.role && <span> ({log.role})</span>}
                  </td>
                  <td>
                    <span
                      className={
                        log.status >= 200 && log.status < 300 
                          ? "status-ok" 
                          : "status-fail"
                      }
                    >
                      {log.status} 
                      {log.status === 200 && " ✓"}
                      {log.status >= 400 && " ✗"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}