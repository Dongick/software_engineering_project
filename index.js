const express = require('express');
const router = express.Router();
const db = require('./config/db');

var template = require('./template');

router.get('/', function(req, res) {
    var html = template.HTML(
        `<form action="/signup_professor" method="post">
            <p><input type="text" name="id"></p>
            <p><input type="text" name="name"></p>
            <p><input type="text" name="school_name"></p>
            <p><input type="text" name="major"></p>
            <p><input type="text" name="email"></p>
            <p><input type="password" name="password"></p>
            <p><input type="submit"></p>
        </form>`
    );
    
    res.writeHead(200);
    res.end(html);
})

module.exports = router;