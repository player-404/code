const { statSync, rmSync } = require("node:fs");
const path = require("node:path");

const getFileType = (filename) => {
    const index = filename.lastIndexOf(".");
    if (index === -1) return;
    const type = filename.split(".")[1];
    const name = filename.split(".")[0];
    return {
        type: `.${type}`,
        name,
    };
};

// 过滤上传失败的文件
const filterChunks = (chunks, chunkSize, tempPath) => {
    const f = chunks.filter((chunk) => {
        const paths = path.join(tempPath, chunk);
        const chunkInfo = statSync(paths);
        const status = chunkInfo.size === chunkSize;
        if (!status) {
            rmSync(paths);
        }
        return status;
    });
    return f;
};
module.exports = {
    getFileType,
    filterChunks,
};
