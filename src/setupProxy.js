const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // Proxy both /api and /digiblock-frontend/api to backend
    app.use(
        ['/api', '/digiblock-frontend/api'],
        createProxyMiddleware({
            target: 'http://localhost:5000',
            changeOrigin: true,
            pathRewrite: {
                '^/digiblock-frontend/api': '/api', // Remove /digiblock-frontend prefix
            },
        })
    );
};
