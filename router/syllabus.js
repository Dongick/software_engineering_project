const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

router.get('/:subjectID/:semesterID/create', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } 
        else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const [subject_professor_info] = await db.promise().query(`select s.name subject_name, s.credit, s.time, s.class, p.phone_number, p.email, p.name professor_name
            from subject s join professortable p on s.professor_id = p.id
            where s.sub_code = ? and s.semester = ?`, [sub_code, semester]);
            res.status(200).send(subject_professor_info);
        }
    }
    catch(err){
        throw err;
    }
})

router.get('/:subjectID/:semesterID', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;

            const [syllabus] = await db.promise().query(`select s.id , s.assistant_name, s.course_sumary, s.course_performance, s.operation_type, s.evaluation_method_ratio,
            sub.name subject_name, sub.credit, sub.time, sub.class, p.phone_number, p.email, p.name professor_name
            from syllabus s join subject sub on s.semester = sub.semester and s.sub_code = sub.sub_code
            join professortable p on sub.professor_id = p.id
            where sub.sub_code = ? and sub.semester = ?`, [sub_code, semester]);
            
            const [textbook] = await db.promise().query(`select text.title, text.author, text.publisher, text.publish_year
            from syllabus_textbook syltext join textbook text on syltext.textbook_id = text.id
            where syltext.syllabus_id = ?`, [syllabus[0].id]);

            const [lec_schedule] = await db.promise().query(`select lec.week, lec.content
            from syllabus syl join lecture_schedule lec on syl.id = lec.syllabus_id
            where syl.id = ?`, [syllabus[0].id]);

            const total_result = {
                ...syllabus[0],
                '교재': {...textbook},
                '강의 일정 및 내용':{...lec_schedule}
            };
            console.log(total_result);
            const {id, ...result} = total_result;
            if(token.author == 1){
                res.status(200).send(result);
            } else{
                res.status(201).send(result);
            }
        }
    } catch(err){
        throw err;
    }
})

router.post('/:subjectID/:semesterID/create', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } 
        else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const assistant_name = req.body.assistant_name;
            const course_sumary = req.body.course_sumary;
            const course_performance = req.body.course_performance;
            const operation_type = req.body.operation_type;
            const evaluation_method_ratio = req.body.evaluation_method_ratio;
            const textbook = req.body.textbook;
            const lecture_schedule = req.body.lecture_schedule;

            db.promise().query(`insert into syllabus(sub_code, semester, assistant_name, course_sumary, course_performance, operation_type, evaluation_method_ratio)
            values(?,?,?,?,?,?,?)`, [sub_code, semester, assistant_name, course_sumary, course_performance, operation_type, evaluation_method_ratio]);
            
            const textbook_info = Object.values(textbook).map(text => [text.title, text.author, text.publisher, text.publish_year]);

            db.promise().query(`insert ignore into textbook(title, author, publisher, publish_year)
            values ?`, [textbook_info]);

            const [syllabus_id] = await db.promise().query(`select id from syllabus where sub_code = ? and semester = ?`, [sub_code, semester]);

            const textbook_ids = [];
            for(let i = 0; i < textbook_info.length; i++){
                const [rows] = await db.promise().query(`select id from textbook where title =? and author =?`, [textbook_info[i][0], textbook_info[i][1]]);
                textbook_ids.push(rows[0].id)
            }

            const syllabus_textbook_info = textbook_ids.map(text => [syllabus_id[0].id, text]);

            db.promise().query(`insert into syllabus_textbook(syllabus_id, textbook_id) values ?`, [syllabus_textbook_info]);

            const lecture_schedule_info = Object.values(lecture_schedule).map(lec => [syllabus_id[0].id, lec.week, lec.content]);
            db.promise().query(`insert into lecture_schedule(syllabus_id, week, content) values ?`, [lecture_schedule_info]);
            res.sendStatus(200);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /syllabus:
 *  post:
 *    summary: 강의계획서 조회
 *    description: 해당하는 강의 조회
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              enrollment:
 *                type: string
 *                description: 수강여부
 *              professor_name:
 *                type: string
 *                description: 교수이름
 *              semester:
 *                type: string
 *                description: 년도-학기
 *              sub_name:
 *                type: string
 *                description: 과목명
 *              major_area:
 *                type: string
 *                description: 과목영역
 *    responses:
 *      '200':
 *        description: 강의계획서 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                s.sub_code:
 *                  type: string
 *                  description: 과목코드
 *                s.name:
 *                  type: string
 *                  description: 과목이름
 *                s.credit:
 *                  type: string
 *                  description: 학점
 *                p.name:
 *                  type: string
 *                  description: 교수이름
 *                p.phone_number:
 *                  type: string
 *                  description: 교수 폰번호
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/', async (req, res) =>{
    const token = jwt.verify(req.cookies['accesstoken']);
    if (Number.isInteger(token)){
        res.sendStatus(token);
    } else{
        let enrollment = req.body.enrollment;
        let professor_name = req.body.professor_name;
        let semester = req.body.semester;
        let sub_name = req.body.sub_name;
        let major_area = req.body.major_area;
        if(enrollment == '전체'){
            if(sub_name.length == 0){
                if(major_area.length == 0){
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                    from subject s join professortable p on s.professor_id = p.id
                    where s.semester = ? and p.name = ?;`,[semester, professor_name])
                    res.status(200).send(result);
                } else{
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                    from subject s join professortable p on s.professor_id = p.id
                    where s.semester = ? and p.name = ? and s.major_area = ?;`,
                    [semester, professor_name, major_area])
                    res.status(200).send(result);
                }
            } else if(professor_name.length == 0) {
                if(major_area.length == 0){
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                    from subject s join professortable p on s.professor_id = p.id
                    where s.semester = ? and s.name like ?;`,[semester, `%${sub_name}%`])
                    res.status(200).send(result);
                } else{
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                    from subject s join professortable p on s.professor_id = p.id
                    where s.semester = ? and s.name = ? and s.major_area = ?;`,
                    [semester, `%${sub_name}%`, major_area])
                    res.status(200).send(result);
                }
            } else{
                if(major_area.length == 0){
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                    from subject s join professortable p on s.professor_id = p.id
                    where s.semester = ? and p.name = ? and s.name like ?;`,[semester, professor_name, `%${sub_name}%`])
                    res.status(200).send(result);
                } else{
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                    from subject s join professortable p on s.professor_id = p.id
                    where s.semester = ? and p.name = ? and s.name = ? and s.major_area = ?;`,
                    [semester, professor_name, `%${sub_name}%`, major_area])
                    res.status(200).send(result);
                }
            }
        } else{
            if(sub_name.length == 0){
                if(professor_name.length == 0){
                    if(major_area.length == 0){
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from professortable p join subject s on p.id = s.professor_id
                        join enrollment e on s.sub_code = e.sub_code
                        where e.student_id = ? and s.semester = ?;`,[token.id, semester])
                        res.status(200).send(result);
                    } else{
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from professortable p join subject s on p.id = s.professor_id
                        join enrollment e on s.sub_code = e.sub_code
                        where e.student_id = ? and s.semester = ? and s.major_area = ?;`,
                        [token.id, semester, major_area])
                        res.status(200).send(result);
                    }
                } else{
                    if(major_area.length == 0){
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from professortable p join subject s on p.id = s.professor_id
                        join enrollment e on s.sub_code = e.sub_code
                        where e.student_id = ? and s.semester = ? and p.name = ?;`,
                        [token.id, semester, professor_name])
                        res.status(200).send(result);
                    } else{
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from professortable p join subject s on p.id = s.professor_id
                        join enrollment e on s.sub_code = e.sub_code
                        where e.student_id = ? and s.semester = ? and s.major_area = ? and p.name = ?;`,
                        [token.id, semester, major_area, professor_name])
                        res.status(200).send(result);
                    }
                }
            } else{
                if(professor_name.length == 0){
                    if(major_area.length == 0){
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from professortable p join subject s on p.id = s.professor_id
                        join enrollment e on s.sub_code = e.sub_code
                        where e.student_id = ? and s.semester = ? and s.name = ?;`,
                        [token.id, semester, `%${sub_name}%`])
                        res.status(200).send(result);
                    } else{
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from professortable p join subject s on p.id = s.professor_id
                        join enrollment e on s.sub_code = e.sub_code
                        where e.student_id = ? and s.semester = ? and s.name = ? and s.major_area = ?;`,
                        [token.id, semester, `%${sub_name}%`, major_area])
                        res.status(200).send(result);
                    }
                } else{
                    if(major_area.length == 0){
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from professortable p join subject s on p.id = s.professor_id
                        join enrollment e on s.sub_code = e.sub_code
                        where e.student_id = ? and s.semester = ? and s.name = ? and p.name = ?;`,
                        [token.id, semester, `%${sub_name}%`, professor_name])
                        res.status(200).send(result);
                    } else{
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from professortable p join subject s on p.id = s.professor_id
                        join enrollment e on s.sub_code = e.sub_code
                        where e.student_id = ? and s.semester = ? and s.name = ? and s.major_area = ? and p.name = ?;`,
                        [token.id, semester, `%${sub_name}%`, major_area, professor_name])
                        res.status(200).send(result);
                    }
                }
            }
        }
    }
})

module.exports = router;