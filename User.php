<?php

/* ======= CONFIG ======= */
$db_host = "127.0.0.1";
$db_user = "root";
$db_pass = "";
$db_name = "minisocial_db";

$base_url = ""; 
$max_upload_size = 20 * 1024 * 1024; 

session_start();

/* ======= DB CONNECT & INITIAL SETUP  ======= */
$mysqli = new mysqli($db_host, $db_user, $db_pass);
if ($mysqli->connect_errno) {
    die("DB connect error: " . $mysqli->connect_error);
}
$mysqli->query("CREATE DATABASE IF NOT EXISTS `{$db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$mysqli->select_db($db_name);

$schema_queries = [
"CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
/* ... other tables unchanged ... */
];

foreach ($schema_queries as $q) {
    $mysqli->query($q);
}

function h($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function is_logged() { return !empty($_SESSION['user_id']); }
function current_user_id() { return $_SESSION['user_id'] ?? null; }

if (is_logged()) {
    $stmt = $mysqli->prepare("UPDATE users SET last_active = NOW() WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $stmt->close();
}

function json_resp($arr) {
    header('Content-Type: application/json');
    echo json_encode($arr);
    exit;
}

$action = $_REQUEST['action'] ?? '';

if ($action === 'signup') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $display = trim($_POST['display_name'] ?? $username);

    if (!$username || !$email || !$password) {
        json_resp(['ok'=>false,'msg'=>'Please complete all fields.']);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_resp(['ok'=>false,'msg'=>'Invalid email.']);
    
    $hash = password_hash($password, PASSWORD_DEFAULT);

    // Handle avatar upload
    $avatar_path = null;
    if (!empty($_FILES['avatar']['name'])) {
        $f = $_FILES['avatar'];
        if ($f['size'] > $max_upload_size) json_resp(['ok'=>false,'msg'=>'Avatar too large.']);
        $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
        $allowed_img = ['jpg','jpeg','png','gif','webp'];
        if (!in_array($ext, $allowed_img)) json_resp(['ok'=>false,'msg'=>'Invalid avatar type.']);
        $target_dir = __DIR__ . '/uploads/';
        if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
        $name = uniqid('avatar_') . '.' . $ext;
        $dest = $target_dir . $name;
        if (move_uploaded_file($f['tmp_name'], $dest)) {
            $avatar_path = 'uploads/' . $name;
        }
    }

    $stmt = $mysqli->prepare("INSERT INTO users (username,email,password,display_name,avatar) VALUES (?,?,?,?,?)");
    $stmt->bind_param("sssss",$username,$email,$hash,$display,$avatar_path);
    if ($stmt->execute()) {
        $_SESSION['user_id'] = $mysqli->insert_id;
        json_resp(['ok'=>true,'msg'=>'Signed up','user_id'=>$_SESSION['user_id']]);
    } else {
        json_resp(['ok'=>false,'msg'=>'Signup failed. Username or email may be taken.']);
    }
}

/* ====== LOGIN, LOGOUT, PASSWORD RESET, POSTS, LIKES, COMMENTS, FOLLOW, MESSAGES, FEED ETC. ====== */
/* ... rest of your previous code unchanged ... */

?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MiniSocial — Home</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
<style>
/* ... your existing CSS unchanged ... */
</style>
</head>
<body>
<header>
<!-- ... header unchanged ... -->
</header>

<main class="container">
<!-- ... main content unchanged ... -->
</main>

<div id="auth-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);align-items:center;justify-content:center">
  <div class="card" style="width:420px;padding:18px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3 id="auth-title">Login</h3>
      <button onclick="closeAuth()" class="ghost">X</button>
    </div>
    <div id="auth-body"></div>
  </div>
</div>

<script>
function openAuth(mode){
  const body = document.getElementById('auth-body');
  const title = document.getElementById('auth-title');
  if(mode==='login'){
    title.textContent='Login';
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        <input id="login-login" placeholder="username or email" style="padding:10px;border-radius:8px;border:1px solid #eef2ff">
        <input id="login-password" type="password" placeholder="password" style="padding:10px;border-radius:8px;border:1px solid #eef2ff">
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="ghost" onclick="forgot()">Forgot?</button>
          <button class="btn" onclick="login()">Login</button>
        </div>
      </div>
    `;
  } else {
    title.textContent='Sign up';
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        <input id="signup-username" placeholder="username" style="padding:10px;border-radius:8px;border:1px solid #eef2ff">
        <input id="signup-email" placeholder="email" style="padding:10px;border-radius:8px;border:1px solid #eef2ff">
        <input id="signup-password" type="password" placeholder="password" style="padding:10px;border-radius:8px;border:1px solid #eef2ff">
        <input id="signup-display" placeholder="display name (optional)" style="padding:10px;border-radius:8px;border:1px solid #eef2ff">
        <input id="signup-avatar" type="file" accept="image/*">
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="ghost" onclick="closeAuth()">Cancel</button>
          <button class="btn" onclick="signup()">Sign up</button>
        </div>
      </div>
    `;
  }
  document.getElementById('auth-modal').style.display='flex';
}
function closeAuth(){ document.getElementById('auth-modal').style.display='none'; }

function ajaxForm(url, data, cb) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "<?php echo $_SERVER['SCRIPT_NAME']; ?>");
  if (data instanceof FormData) {
    data.append('action', url);
    xhr.onload = function(){ cb(JSON.parse(xhr.responseText)); };
    xhr.send(data);
  } else {
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    let body = 'action=' + encodeURIComponent(url) + '&' + Object.keys(data).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(data[k])).join('&');
    xhr.onload = function(){ cb(JSON.parse(xhr.responseText)); };
    xhr.send(body);
  }
}

function signup(){
  let username = document.getElementById('signup-username').value;
  let email = document.getElementById('signup-email').value;
  let password = document.getElementById('signup-password').value;
  let display = document.getElementById('signup-display').value;
  let avatarFile = document.getElementById('signup-avatar').files[0];

  let fd = new FormData();
  fd.append('username', username);
  fd.append('email', email);
  fd.append('password', password);
  fd.append('display_name', display);
  if (avatarFile) fd.append('avatar', avatarFile);

  ajaxForm('signup', fd, (res)=>{
    alert(res.msg);
    if(res.ok) location.reload();
  });
}

/* ... rest of JS unchanged: login(), logout(), posts, feed etc. ... */
</script>
</body>
</html>

