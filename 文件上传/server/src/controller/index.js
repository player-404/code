const { upload, UPLOAD_DIR } = require("../plugins/multer");
const { getFileType, filterChunks } = require("../utils/utils");
const multer = require("multer");
const { readdir } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const fs = require("node:fs");
const path = require("node:path");
const uploadFile = (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(401).json({
                msg: "文件上传失败",
            });
        }
        if (err) {
            return res.status(200).json({
                msg: "文件已存在，无需上传",
                repeat: true,
            });
        }
        res.status(200).json({
            msg: "success",
            data: req.body,
        });
    });
};

const merge = async (req, res) => {
    // 1.读取上传的文件
    const { filename, chunkSize, fileHash } = req.body;
    const infoObj = getFileType(filename);

    // chunk 保存的文件夹目录
    const CHUNK_DIR = path.resolve(UPLOAD_DIR, fileHash);
    // 合并文件保存目录
    const MERGE_DIR = path.resolve(UPLOAD_DIR, fileHash + infoObj.type);
    console.log("合并文件保存目录:", MERGE_DIR);
    // 合并文件存在直接返回合并成功 （秒传功能）
    if (existsSync(MERGE_DIR)) {
        return res.status(200).json({
            msg: "文件合并成功",
        });
    }

    // 不存在 chunk 目录，说明文件不存在
    if (!existsSync(CHUNK_DIR)) {
        return res.status(401).json({
            msg: "文件合并失败！",
        });
    }
    const chunks = await readdir(CHUNK_DIR);
    console.log("读取到的文件:", chunks);
    const sortChunks = chunks.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
    console.log("排序后的文件:", sortChunks);
    const f = sortChunks.map(
        (chunk, index) =>
            new Promise(async (res) => {
                const chunkPath = path.resolve(CHUNK_DIR, chunk);
                const readStream = fs.createReadStream(chunkPath);
                const writeStream = fs.createWriteStream(MERGE_DIR, {
                    start: index * chunkSize,
                    end: (index + 1) * chunkSize,
                });

                readStream.on("end", async () => {
                    console.log("开始删除文件");
                    // 删除文件
                    fs.unlink(chunkPath, (err) => {
                        if (err) {
                            console.log("文件删除失败");
                        }
                        readStream.close();
                        res();
                    });
                });
                readStream.pipe(writeStream);
            })
    );

    // 上传完成删除文件夹
    await Promise.all(f);
    fs.rmdir(CHUNK_DIR, (err) => {
        if (err) {
            console.log("临时文件夹删除失败");
        }
    });
    res.status(200).json({
        msg: "文件合并成功",
    });
};

const verity = async (req, res) => {
    // 获取文件名和文件 hash
    const { filename, fileHash, chunkSize } = req.body;
    const infoObj = getFileType(filename);
    const FILE_DIR = path.resolve(UPLOAD_DIR, fileHash + infoObj.type);
    // 文件存在无需上传， 返回状态
    if (existsSync(FILE_DIR)) {
        return res.status(200).json({
            upload: false,
        });
    }
    // 切片上传文件夹不存在，则需要重新上传
    const TEMP_DIR = path.resolve(UPLOAD_DIR, fileHash);
    if (!existsSync(TEMP_DIR)) {
        return res.status(200).json({
            upload: true,
        });
    }
    // 断点续传
    let uploadedChunks = await readdir(TEMP_DIR);
    uploadedChunks = filterChunks(uploadedChunks, chunkSize, TEMP_DIR);
    console.log("断点续传过滤文件", uploadedChunks);
    res.status(200).json({
        uploadedChunks,
    });
};

const test = (req, res) => {
    res.status(200).json({
        msg: "test ok",
    });
};
module.exports = {
    uploadFile,
    merge,
    verity,
    test,
};
