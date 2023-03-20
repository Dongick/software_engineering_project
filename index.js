const express = require('express');
const router = express.Router();
const db = require('./config/db');

var template = require('./template');

router.get('/', function(req, res) {
    var html = template.HTML(
        `<form action="/signup_student/id_check" method="post">
        <p><input type="text" name="id"></p>
        <p><input type="submit"></p>
        </form>`,
        `<form action="/signup_student" method="post">
        <p><input type="text" name="name"></p>
        <p><input type="text" name="shool"></p>
        <p><input type="text" name="professor"></p>
        <p><input type="text" name="email"></p>
        <p><input type="password" name="password"></p>
        <p><input type="submit"></p>
        </form>`
    );
    res.writeHead(200);
    res.end(html);
})

module.exports = router;