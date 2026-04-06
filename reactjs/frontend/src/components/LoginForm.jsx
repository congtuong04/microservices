export default function LoginForm({
  loginForm,
  setLoginForm,
  handleLogin,
  loadingLogin,
}) {
  return (
    <section className="panel auth-panel">
      <div className="panel-left">
        <span className="panel-tag">Login</span>
        <h2>Đăng nhập vào hệ thống</h2>
        <p>
          Dùng tài khoản đã có trong MySQL để xác thực qua Auth Service và truy
          cập User Service thông qua Gateway.
        </p>

        <div className="hint-box">
          <p>
            <strong>Demo account</strong>
          </p>
          <p>admin / 123456</p>
          <p>user1 / 123456</p>
        </div>
      </div>

      <div className="panel-right">
        <form onSubmit={handleLogin} className="form">
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

          <button type="submit" className="primary-btn" disabled={loadingLogin}>
            {loadingLogin ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </section>
  );
}