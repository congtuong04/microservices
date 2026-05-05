import { useEffect, useState } from "react";
import SystemMonitoring from "./SystemMonitoring";
import AuditLogs from './AuditLogs';

export default function AdminDashboard({
  user,
  token,
  users,
  loadingProfile,
  loadingUsers,
  creatingUser,
  createForm,
  setCreateForm,
  handleCreateUser,
  handleDeleteUser,
  fetchUsers,
  userCount,
  adminCount,
  normalUserCount,
  editingUser,
  editForm,
  setEditForm,
  updatingUser,
  handleStartEdit,
  handleCancelEdit,
  handleUpdateUser,
}) {
  const safeUsers = Array.isArray(users) ? users : [];
  const activeToken = !!token;
  const maskedToken = token ? `${token.slice(0, 90)}...` : "Không có token";

  const [adminNotice, setAdminNotice] = useState({
    type: "",
    message: "",
  });

  const [showFullToken, setShowFullToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const displayToken = showFullToken ? token : maskedToken;

  useEffect(() => {
    if (!adminNotice.message) return;
    const timer = setTimeout(() => {
      setAdminNotice({ type: "", message: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [adminNotice]);

  const latestUsers = [...safeUsers]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const createdToday = safeUsers.filter((item) => {
    if (!item?.created_at) return false;
    const created = new Date(item.created_at);
    const now = new Date();
    return (
      created.getDate() === now.getDate() &&
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  async function handleCopyToken() {
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token);
      setTokenCopied(true);

      setTimeout(() => {
        setTokenCopied(false);
      }, 2200);
    } catch {
      setTokenCopied(false);
    }
  }

  async function onCreateUser(e) {
    const result = await handleCreateUser(e);
    if (!result) return;

    setAdminNotice({
      type: result.success ? "success" : "error",
      message: result.message,
    });
  }

  async function onUpdateUser(e) {
    const result = await handleUpdateUser(e);
    if (!result) return;

    setAdminNotice({
      type: result.success ? "success" : "error",
      message: result.message,
    });
  }

  return (
    <>
      {adminNotice.message && (
        <div
          className={`admin-toast ${
            adminNotice.type === "success" ? "success" : "error"
          }`}
        >
          {adminNotice.message}
        </div>
      )}

      <section className="hero-panel admin-hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="panel-tag glow-tag">Admin Control Center</span>
            <h1>Cloud Security Administration Dashboard</h1>
            <p className="hero-desc">
              Khu vực quản trị trung tâm dành cho admin, hỗ trợ giám sát người
              dùng, kiểm soát truy cập, theo dõi trạng thái xác thực JWT và vận
              hành hệ thống microservices trên cloud.
            </p>

            <div className="hero-badges">
              <span className="hero-badge">JWT Authentication</span>
              <span className="hero-badge">RBAC Authorization</span>
              <span className="hero-badge">API Gateway</span>
              <span className="hero-badge">Aiven MySQL</span>
              <span className="hero-badge">Render Deploy</span>
            </div>
          </div>

          <div className="hero-side">
            <div className="mini-status-card">
              <span className="mini-status-label">Current Role</span>
              <strong>{loadingProfile ? "Loading..." : user?.role || "admin"}</strong>
            </div>
            <div className="mini-status-card">
              <span className="mini-status-label">Session Status</span>
              <strong>{activeToken ? "Authenticated" : "No Token"}</strong>
            </div>
            <div className="mini-status-card">
              <span className="mini-status-label">Managed Users</span>
              <strong>{userCount}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid premium-stats">
        <div className="stat-card highlight-card">
          <span>Total Users</span>
          <strong>{userCount}</strong>
          <small>Tổng số tài khoản hiện có trong hệ thống</small>
        </div>

        <div className="stat-card">
          <span>Admin Accounts</span>
          <strong>{adminCount}</strong>
          <small>Nhóm người dùng có quyền quản trị</small>
        </div>

        <div className="stat-card">
          <span>Standard Users</span>
          <strong>{normalUserCount}</strong>
          <small>Tài khoản truy cập nội dung hệ thống</small>
        </div>

        <div className="stat-card">
          <span>Created Today</span>
          <strong>{createdToday}</strong>
          <small>Số tài khoản được tạo trong ngày</small>
        </div>
      </section>

      <section className="profile-grid">
        <div className="panel glass-panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Admin Profile</span>
              <h2>Thông tin tài khoản quản trị</h2>
            </div>
            <span className="badge admin">{user?.role}</span>
          </div>

          <div className="profile-list">
            <div className="profile-item">
              <span>ID</span>
              <strong>{loadingProfile ? "Loading..." : user?.id}</strong>
            </div>
            <div className="profile-item">
              <span>Username</span>
              <strong>{loadingProfile ? "Loading..." : user?.username}</strong>
            </div>
            <div className="profile-item">
              <span>Role</span>
              <strong>{loadingProfile ? "Loading..." : user?.role}</strong>
            </div>
            <div className="profile-item">
              <span>Permission Level</span>
              <strong>Full User Management</strong>
            </div>
            <SystemMonitoring />
          </div>
        </div>

        <div className="panel glass-panel">
          <span className="panel-tag">JWT Session</span>
          <h2>Trạng thái xác thực hiện tại</h2>
          <p className="muted">
            Token JWT đang được dùng để xác thực các request quản trị, bảo vệ
            route và áp dụng RBAC tại backend.
          </p>

          <div className="status-list">
            <div className="status-row">
              <span>Authentication</span>
              <strong className={activeToken ? "status-ok" : "status-bad"}>
                {activeToken ? "Active" : "Inactive"}
              </strong>
            </div>
            <div className="status-row">
              <span>Access Control</span>
              <strong className="status-ok">RBAC Enabled</strong>
            </div>
            <div className="status-row">
              <span>Gateway Routing</span>
              <strong className="status-ok">Operational</strong>
            </div>
          </div>

          <div className="security-notice admin-security-notice">
            <strong>Lưu ý bảo mật:</strong>
            <span>
              Đây là JWT token của phiên quản trị hiện tại. Token này có quyền
              admin nên cần được bảo vệ nghiêm ngặt, không chia sẻ hoặc đưa vào
              báo cáo công khai.
            </span>
          </div>

          <div className="token-actions">
            <button
              type="button"
              className="secondary-btn token-toggle-btn"
              onClick={() => setShowFullToken((prev) => !prev)}
            >
              {showFullToken ? "Ẩn token" : "Xem full token"}
            </button>

            <button
              type="button"
              className="secondary-btn token-toggle-btn"
              onClick={handleCopyToken}
              disabled={!token}
            >
              {tokenCopied ? "Đã copy" : "Copy token"}
            </button>
          </div>

          <div className={`token-box ${showFullToken ? "full-token" : ""}`}>
            {displayToken}
          </div>
          <div className="audit-section">
            <AuditLogs token={token} />
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel gradient-panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Create User</span>
              <h2>Tạo tài khoản mới</h2>
            </div>
          </div>

          <p className="muted section-intro">
            Tạo nhanh tài khoản mới cho hệ thống học tập và quản trị cloud
            security. Tài khoản sau khi tạo sẽ được quản lý tập trung bởi admin.
          </p>

          <form onSubmit={onCreateUser} className="form">
            <label>
              Username
              <input
                type="text"
                placeholder="Nhập username"
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    username: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Nhập password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    password: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Role
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    role: e.target.value,
                  })
                }
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>

            <button
              type="submit"
              className="primary-btn glow-btn"
              disabled={creatingUser}
            >
              {creatingUser ? "Đang tạo..." : "Tạo user"}
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">System Overview</span>
              <h2>Tổng quan hệ thống quản trị</h2>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h3>Auth Service</h3>
              <p>Xử lý đăng nhập, xác minh bcrypt và cấp JWT token.</p>
            </div>
            <div className="info-card">
              <h3>User Service</h3>
              <p>Quản lý profile, danh sách user và áp dụng phân quyền RBAC.</p>
            </div>
            <div className="info-card">
              <h3>Gateway Service</h3>
              <p>Entry point cho frontend, proxy route và xử lý CORS.</p>
            </div>
            <div className="info-card">
              <h3>Cloud Database</h3>
              <p>Aiven MySQL lưu trữ dữ liệu người dùng và hỗ trợ vận hành online.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Security Notes</span>
              <h2>Bảo mật và kiểm soát truy cập</h2>
            </div>
          </div>

          <ul className="feature-list rich-list">
            <li>JWT được dùng để xác thực request giữa frontend và backend.</li>
            <li>RBAC phân tách quyền giữa admin và user thường.</li>
            <li>Password người dùng được băm bằng bcrypt trước khi lưu DB.</li>
            <li>Gateway là lớp trung gian giúp quản lý route và đồng nhất entry point.</li>
            <li>Admin không nên xóa nhầm tài khoản đang đăng nhập để tránh gián đoạn phiên làm việc.</li>
          </ul>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Deployment Notes</span>
              <h2>Thông tin triển khai cloud</h2>
            </div>
          </div>

          <div className="timeline-list">
            <div className="timeline-item">
              <strong>Frontend</strong>
              <span>React + Vite interface deployed on Render</span>
            </div>
            <div className="timeline-item">
              <strong>Gateway</strong>
              <span>Định tuyến các request /auth và /users đến service phù hợp</span>
            </div>
            <div className="timeline-item">
              <strong>Database</strong>
              <span>Dữ liệu người dùng được kết nối từ Aiven MySQL Cloud</span>
            </div>
            <div className="timeline-item">
              <strong>Production Flow</strong>
              <span>Frontend → Gateway → Service → Database</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Recent Accounts</span>
              <h2>Tài khoản mới gần đây</h2>
            </div>
          </div>

          <div className="recent-user-list">
            {latestUsers.length === 0 ? (
              <div className="empty-box">Chưa có dữ liệu người dùng gần đây</div>
            ) : (
              latestUsers.map((item) => (
                <div key={item.id} className="recent-user-item">
                  <div>
                    <strong>{item.username}</strong>
                    <p>
                      Role:{" "}
                      <span
                        className={`inline-role ${
                          item.role === "admin" ? "admin" : "user"
                        }`}
                      >
                        {item.role}
                      </span>
                    </p>
                  </div>
                  <span className="recent-date">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Admin Notice</span>
              <h2>Khuyến nghị vận hành</h2>
            </div>
          </div>

          <ul className="feature-list rich-list">
            <li>Kiểm tra kỹ role trước khi cấp quyền admin cho tài khoản mới.</li>
            <li>Định kỳ rà soát các tài khoản không còn sử dụng để tối ưu hệ thống.</li>
            <li>Giữ cấu hình JWT_SECRET đồng nhất giữa auth-service và user-service.</li>
            <li>Theo dõi các lỗi proxy, CORS và cold start khi deploy trên Render.</li>
            <li>Ưu tiên quản trị qua gateway để đảm bảo flow thống nhất toàn hệ thống.</li>
          </ul>
        </div>
      </section>

      <section className="panel table-panel">
        <div className="panel-head">
          <div>
            <span className="panel-tag">User Management</span>
            <h2>Quản lý và chỉnh sửa người dùng</h2>
          </div>

          <button className="secondary-btn" onClick={() => fetchUsers()}>
            {loadingUsers ? "Đang tải..." : "Refresh"}
          </button>
        </div>

        <p className="muted section-intro">
          Toàn bộ chức năng xem danh sách, chọn chỉnh sửa và cập nhật tài khoản
          được gom vào cùng một khu quản trị để thao tác thuận tiện hơn.
        </p>

        {editingUser && (
          <div className="embedded-edit-box">
            <div className="panel-head embedded-edit-head">
              <div>
                <span className="panel-tag">Edit User</span>
                <h3>Chỉnh sửa tài khoản: {editingUser.username}</h3>
              </div>
            </div>

            <form onSubmit={onUpdateUser} className="form embedded-edit-form">
              <label>
                Username
                <input
                  type="text"
                  placeholder="Nhập username mới"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      username: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Password mới
                <input
                  type="password"
                  placeholder="Để trống nếu không đổi password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      password: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Role
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </label>

              <div className="action-row">
                <button
                  type="submit"
                  className="primary-btn glow-btn"
                  disabled={updatingUser}
                >
                  {updatingUser ? "Đang cập nhật..." : "Lưu thay đổi"}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCancelEdit}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {safeUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                safeUsers.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.username}</td>
                    <td>
                      <span
                        className={`table-role ${
                          item.role === "admin" ? "admin" : "user"
                        }`}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="secondary-btn table-btn"
                          onClick={() => handleStartEdit(item)}
                        >
                          Sửa
                        </button>

                        {item.id !== user?.id ? (
                          <button
                            className="danger-btn table-btn"
                            onClick={() =>
                              handleDeleteUser(item.id, item.username)
                            }
                          >
                            Xóa
                          </button>
                        ) : (
                          <span className="self-label">Tài khoản hiện tại</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}