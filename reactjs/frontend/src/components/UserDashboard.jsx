import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function UserDashboard({
  user,
  token,
  loadingProfile,
  setToken,
  setUser,
}) {
  const activeToken = !!token;
  const maskedToken = token ? `${token.slice(0, 90)}...` : "Không có token";

  const [profileData, setProfileData] = useState(user || null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    password: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [showFullToken, setShowFullToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const displayToken = showFullToken ? token : maskedToken;

  const techSectionRef = useRef(null);

  useEffect(() => {
    setProfileData(user || null);
    setProfileForm({
      username: user?.username || "",
      password: "",
    });
  }, [user]);

  const technologyData = useMemo(
    () => ({
      "React + Vite": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
        title: "React + Vite",
        description:
          "React được dùng để xây dựng giao diện theo component, giúp chia nhỏ từng phần như Login, User Dashboard và Admin Dashboard. Vite hỗ trợ môi trường phát triển nhanh, build nhẹ và phù hợp cho frontend hiện đại.",
        role: "Đây là nền tảng chính để xây dựng giao diện người dùng cho toàn bộ portal.",
      },
      "Node.js + Express": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png",
        title: "Node.js + Express",
        description:
          "Node.js là môi trường chạy JavaScript phía server, còn Express hỗ trợ xây dựng API nhanh gọn và rõ ràng. Các service như auth-service, user-service và gateway-service đều được xây dựng trên stack này.",
        role: "Dùng để triển khai backend microservices và xử lý các API của hệ thống.",
      },
      JWT: {
        image: "https://jwt.io/img/pic_logo.svg",
        title: "JWT",
        description:
          "JWT là token xác thực được cấp sau khi người dùng đăng nhập thành công. Token này được frontend lưu lại và gửi kèm trong các request để backend xác minh danh tính và quyền truy cập.",
        role: "Đây là cơ chế xác thực chính giữa frontend và backend.",
      },
      RBAC: {
        image: "https://cdn-icons-png.flaticon.com/512/3064/3064155.png",
        title: "RBAC",
        description:
          "RBAC là mô hình phân quyền theo vai trò. Trong hệ thống này, admin có thể CRUD user, còn user thường chỉ được xem hoặc chỉnh sửa thông tin của chính mình theo phạm vi cho phép.",
        role: "Dùng để kiểm soát quyền truy cập giữa admin và user trong hệ thống.",
      },
      bcrypt: {
        image: "https://cdn-icons-png.flaticon.com/512/2885/2885417.png",
        title: "bcrypt",
        description:
          "bcrypt dùng để băm mật khẩu trước khi lưu vào cơ sở dữ liệu. Điều này giúp tránh việc lưu mật khẩu thô, tăng mức độ an toàn nếu dữ liệu bị lộ.",
        role: "Dùng trong luồng đăng nhập và cập nhật mật khẩu của user.",
      },
      Render: {
        image:
          "https://images.seeklogo.com/logo-png/43/2/render-logo-png_seeklogo-435257.png",
        title: "Render",
        description:
          "Render là nền tảng cloud được dùng để deploy frontend và backend services online. Nó giúp hệ thống có môi trường production thật để demo và kiểm thử.",
        role: "Dùng để triển khai gateway-service, auth-service, user-service và frontend.",
      },
      "Aiven MySQL": {
        image:
          "https://images.seeklogo.com/logo-png/43/1/mysql-logo-png_seeklogo-435295.png",
        title: "Aiven MySQL",
        description:
          "Aiven cung cấp dịch vụ MySQL Cloud, giúp ứng dụng có database online thay vì chỉ chạy local. Dữ liệu user và thông tin xác thực được lưu trữ tại đây.",
        role: "Đây là nơi lưu dữ liệu người dùng trong môi trường cloud.",
      },
      "API Gateway": {
        image: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png",
        title: "API Gateway",
        description:
          "API Gateway là điểm vào tập trung của frontend. Thay vì gọi trực tiếp từng service, frontend chỉ gọi gateway, còn gateway sẽ điều hướng request đến auth-service hoặc user-service phù hợp.",
        role: "Dùng để định tuyến request và giúp hệ thống có entry point thống nhất.",
      },
    }),
    []
  );

  const technologyKeys = Object.keys(technologyData);
  const [selectedTech, setSelectedTech] = useState("React + Vite");
  const selectedTechnology = technologyData[selectedTech];

  const learningTopics = [
    {
      title: "Microservices Architecture",
      desc: "Hệ thống được chia thành nhiều service nhỏ, giúp dễ mở rộng, dễ bảo trì và sát với mô hình cloud thực tế.",
    },
    {
      title: "Cloud Security",
      desc: "Portal kết hợp xác thực JWT, phân quyền RBAC và gateway để tạo ra luồng truy cập bảo mật rõ ràng.",
    },
    {
      title: "Deployment Practice",
      desc: "Đồ án không chỉ dừng ở local mà còn được deploy online, giúp thể hiện tính thực tiễn cao hơn.",
    },
    {
      title: "Interactive Learning Portal",
      desc: "Frontend được mở rộng thành không gian học tập, giới thiệu công nghệ và kiến trúc hệ thống thay vì chỉ có login.",
    },
  ];

  const architectureSteps = [
    "Người dùng đăng nhập từ giao diện React",
    "Frontend gửi request đến API Gateway",
    "Gateway định tuyến request đến Auth Service hoặc User Service",
    "Backend xác thực JWT và kiểm tra quyền truy cập bằng RBAC",
    "Dữ liệu được lấy từ Aiven MySQL Cloud và trả về frontend",
  ];

  function handleSelectTech(tech) {
    setSelectedTech(tech);

    setTimeout(() => {
      if (techSectionRef.current) {
        techSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 80);
  }

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

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!profileData?.id) return;

    setProfileError("");
    setProfileMessage("");
    setUpdatingProfile(true);

    try {
      const payload = {
        username: profileForm.username,
        role: profileData.role,
      };

      if (profileForm.password.trim()) {
        payload.password = profileForm.password;
      }

      const updateRes = await fetch(`${API_BASE}/users/${profileData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.message || "Cập nhật thông tin thất bại");
      }

      alert("Cập nhật thông tin thành công. Vui lòng đăng nhập lại.");
      localStorage.removeItem("token");
      setToken("");
      setUser(null);
    } catch (err) {
      setProfileError(err?.message || "Cập nhật thông tin thất bại");
    } finally {
      setUpdatingProfile(false);
    }
  }

  return (
    <>
      <section className="hero-panel user-hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="panel-tag glow-tag">User Learning Portal</span>
            <h1>Secure Cloud Learning Dashboard</h1>
            <p className="hero-desc">
              Đây là khu vực dành cho người dùng đã đăng nhập, nơi bạn có thể
              theo dõi hồ sơ cá nhân, khám phá công nghệ đang được sử dụng trong
              hệ thống và hiểu rõ cách đồ án microservices cloud này vận hành.
            </p>

            <div className="hero-badges">
              <span className="hero-badge">Cloud Computing</span>
              <span className="hero-badge">Microservices</span>
              <span className="hero-badge">JWT Security</span>
              <span className="hero-badge">RBAC Access</span>
              <span className="hero-badge">Interactive Portal</span>
            </div>
          </div>

          <div className="hero-side">
            <div className="mini-status-card">
              <span className="mini-status-label">Current User</span>
              <strong>
                {loadingProfile ? "Loading..." : profileData?.username}
              </strong>
            </div>
            <div className="mini-status-card">
              <span className="mini-status-label">Role</span>
              <strong>{loadingProfile ? "Loading..." : profileData?.role}</strong>
            </div>
            <div className="mini-status-card">
              <span className="mini-status-label">Session</span>
              <strong>{activeToken ? "Authenticated" : "No Token"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid premium-stats">
        <div className="stat-card highlight-card">
          <span>Current Role</span>
          <strong>{loadingProfile ? "..." : profileData?.role}</strong>
          <small>Quyền truy cập hiện tại của tài khoản đang đăng nhập</small>
        </div>

        <div className="stat-card">
          <span>Access Endpoint</span>
          <strong>/users/me</strong>
          <small>API lấy thông tin user hiện tại từ backend</small>
        </div>

        <div className="stat-card">
          <span>Security Status</span>
          <strong>{activeToken ? "Protected" : "Unknown"}</strong>
          <small>Phiên hiện tại đang được bảo vệ bằng JWT token</small>
        </div>

        <div className="stat-card">
          <span>Portal Mode</span>
          <strong>Learning</strong>
          <small>Không gian học tập và tìm hiểu hệ thống cloud security</small>
        </div>
      </section>

      <section className="profile-grid">
        <div className="panel glass-panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Profile</span>
              <h2>Thông tin tài khoản</h2>
            </div>
            <span className="badge user">{profileData?.role}</span>
          </div>

          <div className="profile-list">
            <div className="profile-item">
              <span>ID</span>
              <strong>{loadingProfile ? "Loading..." : profileData?.id}</strong>
            </div>
            <div className="profile-item">
              <span>Username</span>
              <strong>
                {loadingProfile ? "Loading..." : profileData?.username}
              </strong>
            </div>
            <div className="profile-item">
              <span>Role</span>
              <strong>{loadingProfile ? "Loading..." : profileData?.role}</strong>
            </div>
            <div className="profile-item">
              <span>Access Scope</span>
              <strong>Own Profile / Learning Content</strong>
            </div>
          </div>

          <div className="profile-action-row">
            <button
              className="secondary-btn"
              type="button"
              onClick={() => {
                setProfileError("");
                setProfileMessage("");
                setProfileForm({
                  username: profileData?.username || "",
                  password: "",
                });
                setShowEditProfile((prev) => !prev);
              }}
            >
              {showEditProfile ? "Đóng chỉnh sửa" : "Sửa thông tin"}
            </button>
          </div>

          {showEditProfile && (
            <form onSubmit={handleUpdateProfile} className="form top-gap">
              <label>
                Username mới
                <input
                  type="text"
                  placeholder="Nhập username mới"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
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
                  value={profileForm.password}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      password: e.target.value,
                    })
                  }
                />
              </label>

              <div className="action-row">
                <button
                  type="submit"
                  className="primary-btn glow-btn"
                  disabled={updatingProfile}
                >
                  {updatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>

              {profileMessage && (
                <p className="success-note">{profileMessage}</p>
              )}
              {profileError && <p className="error-note">{profileError}</p>}
            </form>
          )}
        </div>

        <div className="panel glass-panel">
          <span className="panel-tag">Session</span>
          <h2>Token trạng thái</h2>
          <p className="muted">
            Token đang được lưu trên trình duyệt để gọi API qua Gateway và xác
            thực quyền truy cập của bạn trong hệ thống.
          </p>

          <div className="status-list">
            <div className="status-row">
              <span>Authentication</span>
              <strong className={activeToken ? "status-ok" : "status-bad"}>
                {activeToken ? "Active" : "Inactive"}
              </strong>
            </div>
            <div className="status-row">
              <span>Gateway Access</span>
              <strong className="status-ok">Enabled</strong>
            </div>
            <div className="status-row">
              <span>Role Scope</span>
              <strong className="status-ok">User-Level Access</strong>
            </div>
          </div>

          <div className="security-notice">
            <strong>Lưu ý bảo mật:</strong>
            <span>
              JWT token là khóa xác thực phiên đăng nhập hiện tại. Không chia sẻ
              token này cho người khác vì token có thể được dùng để gọi API với
              quyền của bạn.
            </span>
          </div>

          <div className="token-actions">
            <button
              type="button"
              style={{
                background: "#4f46e5",
                color: "white",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => setShowFullToken((prev) => !prev)}
            >
              {showFullToken ? "Ẩn token" : "Xem full token"}
            </button>

            <button
              type="button"
              style={{
                background: "#0ea5e9",
                color: "white",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer"
              }}
              onClick={handleCopyToken}
              disabled={!token}
            >
              {tokenCopied ? "Đã copy" : "Copy token"}
            </button>
          </div>

          <div className={`token-box ${showFullToken ? "full-token" : ""}`}>
            {displayToken}
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel gradient-panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Welcome</span>
              <h2>Xin chào {profileData?.username}</h2>
            </div>
          </div>

          <p className="muted section-intro">
            Khu vực này giúp bạn vừa xem thông tin cá nhân, vừa khám phá kiến
            trúc hệ thống và các công nghệ đang tạo nên đồ án microservices
            cloud.
          </p>

          <div className="mini-grid">
            <div className="mini-card">
              <span className="label">Quyền hiện tại</span>
              <strong>User</strong>
            </div>
            <div className="mini-card">
              <span className="label">Self-service API</span>
              <strong>/users/me</strong>
            </div>
            <div className="mini-card">
              <span className="label">Authentication</span>
              <strong>JWT Token</strong>
            </div>
            <div className="mini-card">
              <span className="label">Access Model</span>
              <strong>RBAC</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Portal Purpose</span>
              <h2>Mục đích của cổng người dùng</h2>
            </div>
          </div>

          <ul className="feature-list rich-list">
            <li>Cho phép người dùng truy cập an toàn bằng JWT qua gateway.</li>
            <li>Hiển thị thông tin cá nhân sau khi xác thực thành công.</li>
            <li>Cho phép user cập nhật thông tin hồ sơ của chính mình.</li>
            <li>Cung cấp nội dung học tập về cloud, gateway, JWT và RBAC.</li>
            <li>Biến frontend thành một portal có mục đích rõ ràng hơn.</li>
          </ul>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="panel-tag">Cloud Learning</span>
            <h2>Kiến thức nền tảng trong hệ thống</h2>
          </div>
        </div>

        <div className="info-cards">
          {learningTopics.map((item) => (
            <div className="info-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Architecture</span>
              <h2>Luồng hoạt động của hệ thống</h2>
            </div>
          </div>

          <div className="timeline-list">
            {architectureSteps.map((step, index) => (
              <div className="timeline-item" key={index}>
                <strong>Step {index + 1}</strong>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Technologies</span>
              <h2>Khám phá công nghệ</h2>
            </div>
          </div>

          <div className="tech-badge-grid interactive-tech-grid">
            {technologyKeys.map((tech) => (
              <button
                key={tech}
                type="button"
                className={`tech-badge tech-button ${
                  selectedTech === tech ? "active" : ""
                }`}
                onClick={() => handleSelectTech(tech)}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel tech-showcase-panel" ref={techSectionRef}>
        <div className="panel-head">
          <div>
            <span className="panel-tag">Technology Explorer</span>
            <h2>{selectedTechnology.title}</h2>
          </div>
        </div>

        <div className="tech-showcase">
          <div className="tech-image-wrap">
            <img
              src={selectedTechnology.image}
              alt={selectedTechnology.title}
              className="tech-image"
            />
          </div>

          <div className="tech-detail">
            <p className="tech-description">{selectedTechnology.description}</p>

            <div className="tech-role-box">
              <span className="label">Vai trò trong đồ án</span>
              <strong>{selectedTechnology.role}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">User Access Scope</span>
              <h2>Giới hạn quyền truy cập</h2>
            </div>
          </div>

          <div className="status-list">
            <div className="status-row">
              <span>View own profile</span>
              <strong className="status-ok">Allowed</strong>
            </div>
            <div className="status-row">
              <span>Update own profile</span>
              <strong className="status-ok">Allowed</strong>
            </div>
            <div className="status-row">
              <span>View all users</span>
              <strong className="status-bad">Restricted</strong>
            </div>
            <div className="status-row">
              <span>Delete accounts</span>
              <strong className="status-bad">Restricted</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">Learning Summary</span>
              <h2>Tổng kết trải nghiệm người dùng</h2>
            </div>
          </div>

          <ul className="feature-list rich-list">
            <li>User có thể xem và cập nhật profile của chính mình.</li>
            <li>User có thể bấm từng công nghệ để xem ảnh và mô tả chi tiết.</li>
            <li>Portal giúp làm rõ ý nghĩa học tập của đồ án cloud security.</li>
            <li>Giao diện có chiều sâu hơn và giống web thật hơn nhiều.</li>
          </ul>
        </div>
      </section>
    </>
  );
}