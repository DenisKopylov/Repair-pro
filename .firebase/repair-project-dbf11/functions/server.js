const { onRequest } = require('firebase-functions/v2/https');
  const server = import('firebase-frameworks');
  exports.ssrrepairprojectdbf11 = onRequest({"region":"europe-west4"}, (req, res) => server.then(it => it.handle(req, res)));
  