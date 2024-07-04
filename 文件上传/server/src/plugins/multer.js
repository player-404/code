const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.resolve(__dirname, "../../upload");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR);
        }
        const FILE_DIR = path.resolve(UPLOAD_DIR, req.body.fileHash);
        if (!fs.existsSync(FILE_DIR)) {
            fs.mkdirSync(FILE_DIR);
        }

        cb(null, FILE_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, req.body.chunkHash);
    },
});

// 文件过滤
const fileFilter = async (req, file, cb) => {
    const hash = req.body.fileHash;
    const FILE_DIR = path.resolve(UPLOAD_DIR, hash, req.body.chunkHash);
    const dir = fs.existsSync(FILE_DIR);
    if (dir) {
        console.log("上传文件已经存在，拒绝接收！");
        cb(null, false);
    } else {
        console.log("上传文件不存在，接收文件！");
        cb(null, true);
    }
};
const upload = multer({ storage, fileFilter }).any();
module.exports = {
    UPLOAD_DIR,
    upload,
};
