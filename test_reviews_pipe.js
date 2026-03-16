const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function check() {
  const uri = "mongodb+srv://karmansingharora03_db_user:8813917626%24Karman@cluster0.yyjs2ln.mongodb.net/ai-interview?retryWrites=true&w=majority&appName=Cluster0";
  const secret = "mBocwPzdc1d05KpjxqDV97jQ860F1OmjUBw-madaTPxjOv9vc5BGwsZztIQ5u9iJwo9qt2fbMcxubFi40JkxiQ";

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const user = await db.collection('users').findOne({});
    if (!user) throw new Error('No user found to link review');

    // 1. Create a signed JWT token
    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: 'user' }, secret, { expiresIn: '1h' });
    console.log('Generated mock JWT token for user:', user._id);

    // 2. Submit feedback with AXIOS
    const payload = {
      rating: 5,
      comment: "This is a direct test review from Axios",
      sessionId: new mongoose.Types.ObjectId().toString(),
    };

    try {
      const res = await axios.post('http://localhost:3000/reviews', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response Success:', res.data);
    } catch (axiosErr) {
      console.error('Response Fail:', axiosErr.response ? axiosErr.response.data : axiosErr.message);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
