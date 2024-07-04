const express = require("express");
const app = express();
const router = require("./routes/routes");
require("dotenv").config();
// 跨域处理
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Content-Length, X-Requested-With"
    );
    // 允许跨域携带cookie
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.use(express.json());

app.use(router);

module.exports = app;
