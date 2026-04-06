import { useEffect, useMemo, useState } from "react";
import "./index.css";
import LoginForm from "./components/LoginForm";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

// const API_BASE = "http://localhost:3000";
const API_BASE = import.meta.env.VITE_API_BASE;
console.log("API_BASE =", import.meta.env.VITE_API_BASE);

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

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setStatus("Đang đăng nhập...");
    setLoadingLogin(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        setStatus("Đăng nhập thất bại");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setLoginForm({
        username: "",
        password: "",
      });
      setStatus("Đăng nhập thành công");
    } catch (err) {
      setError(err?.message || "Không thể kết nối server");
      setStatus("Lỗi kết nối");
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

      const data = await res.json();

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Không lấy được danh sách user");
      }

      setUsers(data);
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

      const data = await res.json();

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
    } catch (err) {
      setError(err?.message || "Tạo user thất bại");
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
    if (!editingUser) return;

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Cập nhật user thất bại");
      }

      setStatus("Cập nhật user thành công");
      handleCancelEdit();
      await fetchUsers();
    } catch (err) {
      setError(err?.message || "Cập nhật user thất bại");
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

      const data = await res.json();

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
      if (!token) return;

      const profile = await fetchProfile(token);

      if (!profile) {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
        setUsers([]);
        return;
      }

      if (profile.role === "admin") {
        await fetchUsers(token);
      }
    }

    init();
  }, [token]);

  return (
    <div className="app">
      <div className="background-glow glow-1"></div>
      <div className="background-glow glow-2"></div>
      <div className="background-glow glow-3"></div>

      <div className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">MICROSERVICES • JWT • RBAC • GATEWAY</p>
            <h1>Security Dashboard</h1>
            <p className="hero-text">
              Hệ thống quản trị người dùng với API Gateway, xác thực JWT và phân
              quyền theo vai trò.
            </p>
          </div>

          {isLoggedIn && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </header>

        <div className="status-grid">
          <div className="info-card">
            <span className="label">Trạng thái</span>
            <strong>{status}</strong>
          </div>

          <div className="info-card">
            <span className="label">API Base</span>
            <strong>{API_BASE}</strong>
          </div>

          <div className="info-card">
            <span className="label">Phiên đăng nhập</span>
            <strong>{isLoggedIn ? "Đã đăng nhập" : "Chưa đăng nhập"}</strong>
          </div>
        </div>

        {error && (
          <div className="alert error-alert">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {!isLoggedIn && (
          <LoginForm
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            handleLogin={handleLogin}
            loadingLogin={loadingLogin}
          />
        )}

        {isLoggedIn && isUser && (
          <UserDashboard
            user={user}
            token={token}
            loadingProfile={loadingProfile}
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