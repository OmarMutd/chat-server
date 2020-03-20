const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Server online!');
});

module.exports = router;