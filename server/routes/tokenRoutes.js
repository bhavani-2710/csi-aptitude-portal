const express = require('express');
const router = express.Router();
const {tokenMiddleware}= require("../middlewares/jwtAuthMiddleware")

router.post("/",tokenMiddleware);

const {limiter} = require("../utils/rateLimitUtils");
router.use(limiter);


module.exports = router;