export default function LoginForm({
  loginForm,
  setLoginForm,
  handleLogin,
  loadingLogin,
}) {
  return (
    <section className="login-hero">
      <div className="login-overlay" />

      <div className="login-shell">
        <div className="login-left">
          <span className="panel-tag glow-tag">Secure Access Portal</span>

          <h1>Cloud Security Learning Platform</h1>

          <p className="login-lead">
            Đăng nhập để truy cập hệ thống microservices cloud, xem nội dung học
            tập, theo dõi kiến trúc triển khai và sử dụng các chức năng được bảo
            vệ bằng JWT Authentication và RBAC Authorization.
          </p>

          <div className="login-feature-grid">
            <div className="login-feature-card">
              <strong>JWT Authentication</strong>
              <span>Xác thực an toàn sau khi đăng nhập</span>
            </div>

            <div className="login-feature-card">
              <strong>RBAC Control</strong>
              <span>Phân quyền rõ giữa admin và user</span>
            </div>

            <div className="login-feature-card">
              <strong>API Gateway</strong>
              <span>Điểm vào tập trung cho toàn hệ thống</span>
            </div>

            <div className="login-feature-card">
              <strong>Aiven + Render</strong>
              <span>Cloud database và deploy online thực tế</span>
            </div>
          </div>

          <div className="login-info-row">
            <div className="login-info-box">
              <span className="login-info-label">System Flow</span>
              <strong>Frontend → Gateway → Services → Database</strong>
            </div>

            <div className="login-info-box">
              <span className="login-info-label">Portal Purpose</span>
              <strong>Learning • Security • Administration</strong>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-card-head">
              <span className="panel-tag">Login</span>
              <h2>Đăng nhập vào hệ thống</h2>
              <p className="muted">
                Dùng tài khoản đã có trong MySQL để xác thực qua Auth Service và
                truy cập User Service thông qua Gateway.
              </p>
            </div>

            <div className="demo-box">
              <div className="demo-head">
                <strong>Demo account</strong>
                <span>Use for testing</span>
              </div>

              <div className="demo-account-list">
                <div className="demo-account-item">
                  <span className="demo-role admin">admin</span>
                  <strong>admin / 123456</strong>
                </div>

                <div className="demo-account-item">
                  <span className="demo-role user">user</span>
                  <strong>user1 / 123456</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="form login-form">
              <label>
                Username
                <input
                  type="text"
                  placeholder="Nhập username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
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
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      password: e.target.value,
                    })
                  }
                />
              </label>

              <button
                type="submit"
                className="primary-btn glow-btn login-btn"
                disabled={loadingLogin}
              >
                {loadingLogin ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="login-footer-note">
              <span>Protected by JWT • Routed through Gateway • Role-based access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}