const router = require("express").Router();
const { uploadFile, merge, verity, test } = require("../controller");
const { upload } = require("../plugins/multer");
router.post("/upload", upload, uploadFile);

router.post("/merge", merge);

router.post("/verity", verity);

router.post("/test", test);
module.exports = router;
