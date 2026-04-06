export default function UserDashboard({ user, token, loadingProfile }) {
  return (
    <>
      <section className="profile-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Profile</span>
              <h2>Thông tin tài khoản</h2>
            </div>
            <span className="badge user">{user?.role}</span>
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
            Token đã được lưu trên trình duyệt để gọi API qua Gateway.
          </p>
          <div className="token-box">
            {token ? `${token.slice(0, 70)}...` : "Không có token"}
          </div>
        </div>
      </section>

      <section className="panel">
        <span className="panel-tag">User Dashboard</span>
        <h2>Xin chào {user?.username}</h2>
        <p className="muted">
          Bạn đang đăng nhập với quyền user. Bạn chỉ có thể xem thông tin cá
          nhân của chính mình.
        </p>

        <div className="mini-grid">
          <div className="mini-card">
            <span className="label">Quyền hiện tại</span>
            <strong>User</strong>
          </div>
          <div className="mini-card">
            <span className="label">Self-service</span>
            <strong>/users/me</strong>
          </div>
        </div>
      </section>
    </>
  );
}