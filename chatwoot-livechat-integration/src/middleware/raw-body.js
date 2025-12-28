export function rawBodyMiddleware(req, res, next) {
  if (req.path.startsWith('/slack/')) {
    let data = '';
    
    req.on('data', chunk => {
      data += chunk.toString('utf8');
    });
    
    req.on('end', () => {
      req.rawBody = data;
      
      if (req.path === '/slack/interactions') {
        try {
          const params = new URLSearchParams(data);
          req.body = { payload: params.get('payload') };
        } catch (err) {
          req.body = {};
        }
      } else {
        try {
          req.body = JSON.parse(data);
        } catch (err) {
          req.body = {};
        }
      }
      
      next();
    });
  } else {
    next();
  }
}

