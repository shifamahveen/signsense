const userModel = require('../models/userModel');

exports.getProfile = (req, res) => {
  const userId = req.session.user.id;

  // Check if userId is present in the session
  if (!userId) {
    return res.redirect('/login');
  }

  userModel.findUserById(userId, (err, results) => {
    if (err || results.length === 0) {
      return res.redirect('/login');
    }

    const user = results[0];
    res.render('profile', { user });
  });
};