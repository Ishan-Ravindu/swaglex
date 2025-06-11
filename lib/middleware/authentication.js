const authenticate = (req, res, next) => {
  if (!req.session || !req.session.user) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.redirect('/login');
  }
  
  req.user = req.session.user;
  next();
};

module.exports = authenticate;