import { useEffect, useMemo, useState } from "react";
import "./index.css";
import LoginForm from "./components/LoginForm";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

const API_BASE = import.meta.env.VITE_API_BASE;
console.log("API_BASE =", import.meta.env.VITE_API_BASE);

async function safeParseJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Server trả về dữ liệu không hợp lệ hoặc HTML thay vì JSON");
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    role: "user",
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    role: "user",
  });

  const [status, setStatus] = useState("Sẵn sàng");
  const [error, setError] = useState("");

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);

  const [authFlowVisible, setAuthFlowVisible] = useState(false);
  const [authStepIndex, setAuthStepIndex] = useState(0);

  const authSteps = [
    "Auth Service",
    "JWT Token",
    "RBAC Verify",
    "Gateway Access",
  ];

  const isLoggedIn = !!token && !!user;
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const userCount = useMemo(() => users.length, [users]);

  const adminCount = useMemo(
    () => users.filter((item) => item.role === "admin").length,
    [users]
  );

  const normalUserCount = useMemo(
    () => users.filter((item) => item.role === "user").length,
    [users]
  );

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 3200);

    return () => clearTimeout(timer);
  }, [error]);

  async function playLoginFlow() {
    setAuthFlowVisible(true);
    setAuthStepIndex(0);
    await wait(350);

    setAuthStepIndex(1);
    await wait(450);

    setAuthStepIndex(2);
    await wait(500);

    setAuthStepIndex(3);
    await wait(550);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setStatus("Đang đăng nhập...");
    setLoadingLogin(true);

    try {
      await playLoginFlow();

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        let message = "Đăng nhập thất bại";

        if (data.message === "Invalid credentials") {
          message = "Sai tài khoản hoặc mật khẩu";
        }

        setError(message);
        setStatus(message);
        setAuthFlowVisible(false);
        return;
      }

      await wait(350);

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setLoginForm({
        username: "",
        password: "",
      });
      setStatus("Đăng nhập thành công");
    } catch (err) {
      const message =
        err?.message === "Failed to fetch"
          ? "Không thể kết nối máy chủ"
          : err?.message || "Không thể kết nối máy chủ";

      setError(message);
      setStatus(message);
      setAuthFlowVisible(false);
    } finally {
      setLoadingLogin(false);
    }
  }

  async function fetchProfile(currentToken = token) {
    if (!currentToken) return null;

    setLoadingProfile(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Không lấy được profile");
      }

      setUser(data);
      return data;
    } catch (err) {
      setError(err?.message || "Không lấy được profile");
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }

  async function fetchUsers(currentToken = token) {
    if (!currentToken) return;

    setLoadingUsers(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Không lấy được danh sách user");
      }

      setUsers(Array.isArray(data) ? data : []);
      setStatus("Đã tải danh sách user");
    } catch (err) {
      setError(err?.message || "Không lấy được danh sách user");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setError("");
    setCreatingUser(true);

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Tạo user thất bại");
      }

      setStatus("Tạo user thành công");
      setCreateForm({
        username: "",
        password: "",
        role: "user",
      });

      await fetchUsers();
      return { success: true, message: "Tạo tài khoản thành công." };
    } catch (err) {
      const message = err?.message || "Tạo user thất bại";
      setError(message);
      return { success: false, message };
    } finally {
      setCreatingUser(false);
    }
  }

  function handleStartEdit(userItem) {
    setEditingUser(userItem);
    setEditForm({
      username: userItem.username || "",
      password: "",
      role: userItem.role || "user",
    });
    setStatus(`Đang chỉnh sửa user: ${userItem.username}`);
    setError("");
  }

  function handleCancelEdit() {
    setEditingUser(null);
    setEditForm({
      username: "",
      password: "",
      role: "user",
    });
    setStatus("Đã hủy chỉnh sửa");
  }

  async function handleUpdateUser(e) {
    e.preventDefault();
    if (!editingUser) return { success: false, message: "Không có user để cập nhật" };

    setError("");
    setUpdatingUser(true);

    try {
      const payload = {
        username: editForm.username,
        role: editForm.role,
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Cập nhật user thất bại");
      }

      setStatus("Cập nhật user thành công");
      handleCancelEdit();
      await fetchUsers();
      return { success: true, message: "Cập nhật tài khoản thành công." };
    } catch (err) {
      const message = err?.message || "Cập nhật user thất bại";
      setError(message);
      return { success: false, message };
    } finally {
      setUpdatingUser(false);
    }
  }

  async function handleDeleteUser(id, username) {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa user "${username}" không?`
    );

    if (!confirmDelete) return;

    setError("");

    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Xóa user thất bại");
      }

      if (editingUser?.id === id) {
        handleCancelEdit();
      }

      setStatus("Xóa user thành công");
      await fetchUsers();
    } catch (err) {
      setError(err?.message || "Xóa user thất bại");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setUsers([]);
    setEditingUser(null);
    setEditForm({
      username: "",
      password: "",
      role: "user",
    });
    setError("");
    setStatus("Đã đăng xuất");
  }

  useEffect(() => {
    async function init() {
      if (!token) {
        setAuthFlowVisible(false);
        return;
      }

      const profile = await fetchProfile(token);

      if (!profile) {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
        setUsers([]);
        setAuthFlowVisible(false);
        return;
      }

      if (profile.role === "admin") {
        await fetchUsers(token);
      }

      await wait(350);
      setAuthFlowVisible(false);
    }

    init();
  }, [token]);

  return (
    <div className="app">
      <div className="background-glow glow-1"></div>
      <div className="background-glow glow-2"></div>
      <div className="background-glow glow-3"></div>

      {authFlowVisible && (
        <div className="auth-flow-overlay">
          <div className="auth-flow-card">
            <div className="auth-spinner"></div>
            <span className="auth-flow-tag">Secure Authentication</span>
            <h3>Đang khởi tạo phiên truy cập</h3>
            <p>Hệ thống đang xác thực và khởi tạo quyền truy cập bảo mật.</p>

            <div className="auth-flow-steps">
              {authSteps.map((step, index) => (
                <div
                  key={step}
                  className={`auth-step ${
                    index < authStepIndex
                      ? "done"
                      : index === authStepIndex
                      ? "active"
                      : ""
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && !isLoggedIn && (
        <div className="alert error-alert floating-alert">{error}</div>
      )}

      <div className="container">
        <header className="main-header">
          <div className="brand-block">
            <span className="brand-tag">MICROSERVICES • CLOUD • SECURITY</span>
            <h1>Cloud Security Learning Portal</h1>
            <p className="brand-text">
              Hệ thống mô phỏng triển khai microservices trên cloud với JWT
              Authentication, RBAC Authorization, API Gateway và giao diện
              role-based dashboard cho admin và user.
            </p>
          </div>

          <div className="header-right">
            <div className="header-chip">
              <span>API Base</span>
              <strong>{API_BASE || "Chưa cấu hình"}</strong>
            </div>

            <div className="header-chip">
              <span>Session</span>
              <strong>{isLoggedIn ? "Authenticated" : "Guest"}</strong>
            </div>

            {isLoggedIn && (
              <button className="logout-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            )}
          </div>
        </header>

        {!isLoggedIn && (
          <LoginForm
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            handleLogin={handleLogin}
            loadingLogin={loadingLogin}
          />
        )}

        <section className="top-overview">
          <div className="overview-card accent">
            <span className="label">System Status</span>
            <strong>{status}</strong>
            <small>Trạng thái xử lý hiện tại của ứng dụng</small>
          </div>

          <div className="overview-card">
            <span className="label">Authentication</span>
            <strong>{token ? "JWT Active" : "No Session"}</strong>
            <small>Xác thực người dùng thông qua token</small>
          </div>

          <div className="overview-card">
            <span className="label">Access Level</span>
            <strong>
              {isAdmin ? "Administrator" : isUser ? "Standard User" : "Guest"}
            </strong>
            <small>Vai trò hiện tại trong hệ thống</small>
          </div>

          <div className="overview-card">
            <span className="label">Architecture</span>
            <strong>Gateway-Based</strong>
            <small>Frontend → Gateway → Services → Database</small>
          </div>
        </section>

        {!isLoggedIn && (
          <section className="portal-intro">
            <div className="panel intro-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-tag">Project Overview</span>
                  <h2>Hệ thống có mục đích gì?</h2>
                </div>
              </div>

              <p className="muted section-intro">
                Đây không chỉ là trang đăng nhập đơn giản. Sau khi xác thực,
                người dùng sẽ truy cập vào portal học tập và quản trị liên quan
                đến cloud computing, microservices, API gateway, JWT và RBAC.
              </p>

              <div className="info-cards">
                <div className="info-card">
                  <h3>Learning Portal</h3>
                  <p>
                    Cung cấp nội dung về kiến trúc hệ thống, công nghệ sử dụng
                    và ghi chú triển khai thực tế.
                  </p>
                </div>

                <div className="info-card">
                  <h3>Role-Based Access</h3>
                  <p>
                    Admin có thể quản lý user, còn user thường xem profile và
                    nội dung học tập trong hệ thống.
                  </p>
                </div>

                <div className="info-card">
                  <h3>Cloud Deployment</h3>
                  <p>
                    Ứng dụng được triển khai online với frontend trên Render và
                    dữ liệu trên Aiven MySQL Cloud.
                  </p>
                </div>

                <div className="info-card">
                  <h3>Security Focus</h3>
                  <p>
                    Hệ thống tập trung vào xác thực JWT, phân quyền RBAC và flow
                    gọi API thông qua gateway.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {isLoggedIn && isUser && (
          <UserDashboard
            user={user}
            token={token}
            loadingProfile={loadingProfile}
            setToken={setToken}
            setUser={setUser}
          />
        )}

        {isLoggedIn && isAdmin && (
          <AdminDashboard
            user={user}
            token={token}
            users={users}
            loadingProfile={loadingProfile}
            loadingUsers={loadingUsers}
            creatingUser={creatingUser}
            createForm={createForm}
            setCreateForm={setCreateForm}
            handleCreateUser={handleCreateUser}
            handleDeleteUser={handleDeleteUser}
            fetchUsers={fetchUsers}
            userCount={userCount}
            adminCount={adminCount}
            normalUserCount={normalUserCount}
            editingUser={editingUser}
            editForm={editForm}
            setEditForm={setEditForm}
            updatingUser={updatingUser}
            handleStartEdit={handleStartEdit}
            handleCancelEdit={handleCancelEdit}
            handleUpdateUser={handleUpdateUser}
          />
        )}
      </div>
    </div>
  );
}