<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | Book Journal</title>
  <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4f46e5;
      --secondary: #3b82f6;
      --bg: #f9fafb;
      --light-text: #6b7280;
      --dark-text: #111827;
      --card-bg: #ffffff;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; font-family: "Poppins", sans-serif; }

    body {
      background: linear-gradient(135deg, #4f46e5, #3b82f6, #06b6d4);
      min-height: 100vh;
      display: flex;
      overflow-x: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: 250px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(15px);
      padding: 20px;
      display: flex;
      flex-direction: column;
      color: white;
      position: fixed;
      height: 100%;
      transition: transform 0.3s ease;
    }
    .sidebar h2 { text-align: center; margin-bottom: 40px; }
    .sidebar a {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; color: white;
      padding: 12px; border-radius: 10px;
      transition: 0.3s; font-weight: 500;
    }
    .sidebar a:hover { background: rgba(255, 255, 255, 0.2); }

    /* Main */
    .main { margin-left: 260px; padding: 30px; width: 100%; }
    .dashboard-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 25px; background: var(--card-bg);
      padding: 15px 20px; border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .dashboard-header h1 { color: var(--dark-text); font-size: 1.4rem; }

    /* Profile */
    .profile { position: relative; display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .profile img { width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--primary); }
    .dropdown {
      position: absolute; top: 55px; right: 0;
      background: white; border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      display: none; flex-direction: column; min-width: 150px;
    }
    .dropdown a {
      padding: 12px 20px; text-decoration: none;
      color: var(--dark-text); font-weight: 500;
    }
    .dropdown a:hover { background: #f3f4f6; }
    .profile.active .dropdown { display: flex; }

    /* Stats */
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px; margin: 30px 0;
    }
    .stat-card {
      background: var(--card-bg); padding: 25px;
      border-radius: 15px; text-align: center;
      color: var(--dark-text); box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: 0.3s;
    }
    .stat-card:hover { transform: translateY(-5px); }
    .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 8px; color: var(--primary); }
    .stat-label { font-size: 0.95rem; color: var(--light-text); }

    /* Links */
    .link-group { display: flex; gap: 15px; flex-wrap: wrap; }
    .link-group a {
      flex: 1; text-align: center; padding: 14px;
      border-radius: 12px; background: white;
      font-weight: 600; color: var(--primary);
      text-decoration: none; transition: 0.3s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .link-group a:hover { background: var(--secondary); color: white; }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); position: absolute; }
      .sidebar.active { transform: translateX(0); }
      .main { margin-left: 0; padding: 20px; }
      .dashboard-header { flex-direction: column; gap: 10px; text-align: center; }
      .link-group a { flex: 100%; }
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <div class="sidebar">
    <h2>📖 Book Journal</h2>
    <a href="/dashboard"><i class='bx bxs-dashboard'></i> Dashboard</a>
    <a href="/profile"><i class='bx bxs-user'></i> Profile</a>
    <a href="/my-books"><i class='bx bxs-book'></i> My Books</a>
    <a href="/logout"><i class='bx bx-log-out'></i> Logout</a>
  </div>

  <!-- Main -->
  <div class="main">
    <div class="dashboard-header">
      <h1>Welcome, <%= user.username %> 👋</h1>
      <div class="profile" onclick="toggleDropdown()">
        <% if (user.photo) { %>
          <img src="<%= user.photo %>" alt="Profile">
        <% } else { %>
          <img src="https://via.placeholder.com/150" alt="Profile">
        <% } %>
        <div class="dropdown">
          <a href="/my-books">My Books</a>
          <a href="/settings">Settings</a>
          <a href="/logout">Logout</a>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-number"><%= bookCount %></div>
        <div class="stat-label">Books Added</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">5</div>
        <div class="stat-label">Books Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">3</div>
        <div class="stat-label">Favorites</div>
      </div>
    </div>

    <!-- Links -->
    <div class="link-group">
      <a href="/add-book">➕ Add a New Book</a>
      <a href="/my-books">📚 View My Books</a>
    </div>

    <br>
    <a href="/" style="display:inline-block; margin-top:20px; background:#fff; color:var(--primary); padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600;">⬅ Go Back</a>
  </div>

  <script>
    function toggleDropdown() {
      document.querySelector('.profile').classList.toggle('active');
    }
  </script>
</body>
</html>
