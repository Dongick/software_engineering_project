const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const loginRouter = require('./router/login');
const signup_studentRouter = require('./router/signup_student');
const signup_professorRouter = require('./router/signup_professor');
//const index = require('./index');

const app = express();
const port = 3001;


app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use('/login', loginRouter);
app.use('/signup_student', signup_studentRouter);
app.use('/signup_professor', signup_professorRouter);
//app.use('/', index);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})