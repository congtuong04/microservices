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
  return (
    <>
      <section className="profile-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Profile</span>
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
          </div>
        </div>

        <div className="panel">
          <span className="panel-tag">Session</span>
          <h2>Token trạng thái</h2>
          <p className="muted">
            Token JWT đang được sử dụng để xác thực yêu cầu quản trị.
          </p>
          <div className="token-box">
            {token ? `${token.slice(0, 70)}...` : "Không có token"}
          </div>
        </div>
      </section>

      <section className="panel">
        <span className="panel-tag">Admin Dashboard</span>
        <h2>Xin chào {user?.username}</h2>
        <p className="muted">
          Bạn có quyền quản lý người dùng trong hệ thống.
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Tổng user</span>
            <strong>{userCount}</strong>
          </div>
          <div className="stat-card">
            <span>Admin</span>
            <strong>{adminCount}</strong>
          </div>
          <div className="stat-card">
            <span>User thường</span>
            <strong>{normalUserCount}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Create User</span>
              <h2>Tạo tài khoản mới</h2>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="form">
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
              className="primary-btn"
              disabled={creatingUser}
            >
              {creatingUser ? "Đang tạo..." : "Tạo user"}
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">System Notes</span>
              <h2>Phân quyền quản trị</h2>
            </div>
          </div>

          <ul className="feature-list">
            <li>Admin có thể xem toàn bộ danh sách người dùng.</li>
            <li>Admin có thể tạo tài khoản mới.</li>
            <li>Admin có thể sửa tài khoản.</li>
            <li>Admin có thể xóa tài khoản khác.</li>
            <li>Backend là lớp bảo mật chính bằng JWT + RBAC.</li>
          </ul>
        </div>
      </section>

      {editingUser && (
        <section className="panel edit-panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Edit User</span>
              <h2>Chỉnh sửa tài khoản: {editingUser.username}</h2>
            </div>
          </div>

          <form onSubmit={handleUpdateUser} className="form">
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
                className="primary-btn"
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
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="panel-tag">User Management</span>
            <h2>Danh sách người dùng</h2>
          </div>

          <button className="secondary-btn" onClick={() => fetchUsers()}>
            {loadingUsers ? "Đang tải..." : "Refresh"}
          </button>
        </div>

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
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                users.map((item) => (
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