const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const loginRouter = require('./router/login');
const signup_studentRouter = require('./router/signup_student');
const signup_professorRouter = require('./router/signup_professor');
const logoutRouter = require('./router/logout');
const noticeRouter = require('./router/notice');
const syllabusRouter = require('./router/syllabus');
const mainRouter = require('./router/main');
const enrollmentRouter = require('./router/enrollment');
const grade_entryRouter = require('./router/grade_entry');
const gradeRouter = require('./router/grade');
const rankRouter = require('./router/rank');
const information_checkRouter = require('./router/information_check');
const lecture_materialRouter = require('./router/lecture_material');
const lectureRouter = require('./router/lecture');
const assignmentRouter = require('./router/assignment');
const studentInfoRouter = require('./router/studentInfoCheck');

const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');

const app = express();
const port = 3001;

app.use(helmet());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/login', loginRouter);
app.use('/signup_student', signup_studentRouter);
app.use('/signup_professor', signup_professorRouter);
app.use('/logout', logoutRouter);
app.use('/notice', noticeRouter);
app.use('/syllabus', syllabusRouter);
app.use('/enrollment', enrollmentRouter);
app.use('/grade_entry', grade_entryRouter);
app.use('/grade', gradeRouter);
app.use('/rank', rankRouter);
app.use('/information_check', information_checkRouter);
app.use('/lecture_material', lecture_materialRouter);
app.use('/lecture', lectureRouter);
app.use('/assignment', assignmentRouter);
app.use('/studentInfoCheck', studentInfoRouter);
app.use('/main', mainRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})