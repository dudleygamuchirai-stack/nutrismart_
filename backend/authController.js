const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Signup Handler (Replaces legacy PHP $_POST['action'] === 'signup')
exports.signup = async (req, res) => {
  try {
    const { username, email, password, display_name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ ok: false, msg: 'Please complete all required fields.' });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        username, 
        email, 
        password: hashedPassword, 
        display_name: display_name || username 
      }])
      .select();

    if (error) {
      return res.status(400).json({ ok: false, msg: 'Signup failed. Username or email may be taken.' });
    }

    return res.status(201).json({ ok: true, msg: 'Signed up successfully', user: data[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: 'Server error during signup.' });
  }
};