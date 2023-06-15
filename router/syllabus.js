const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /syllabus/{subjectID}/{semesterID}/create:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *  get:
 *    summary: 강의계획서 생성시 초기 정보
 *    description: 강의계획서 생성시 초기 정보
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '201':
 *        description: 강의계획서 생성시 초기 정보 전송
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                credit:
 *                  type: integer
 *                  description: 학점
 *                classification:
 *                  type: integer
 *                  description: 이수구분
 *                phone_number:
 *                  type: string
 *                  description: 교수 핸드폰 번호
 *                email:
 *                  type: string
 *                  description: 교수 이메일
 *                professor_name:
 *                  type: string
 *                  description: 교수명
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/create', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } 
        else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const [subject_professor_info] = await db.promise().query(`select s.credit, s.classification, p.phone_number, p.email, p.name professor_name
                from subject s join professortable p on s.professor_id = p.id
                where s.sub_code = ? and s.semester = ?`, [sub_code, semester]
            );
            return res.status(201).send(subject_professor_info[0]);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /syllabus/{subjectID}/{semesterID}/list:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *  get:
 *    summary: 강의계획서 목록
 *    description: 강의계획서 목록
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '201':
 *        description: 강의계획서 목록
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                sub_name:
 *                  type: string
 *                  description: 과목명
 *                time:
 *                  type: string
 *                  description: 수업 시간
 *                class:
 *                  type: string
 *                  description: 교실
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/list', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const [syllabusList] = await db.promise().query(`select s.sub_code, s.name sub_name, s.time, s.class
                from syllabus sy left join subject s on sy.sub_code = s.sub_code and sy.semester = s.semester
                where s.sub_code = ? and s.semester = ?`, [sub_code, semester]
            );
            const result = {
                ...syllabusList[0]
            }
            return res.status(201).send(result);
        }
    } catch(err){
        throw err;
    }
})


/**
 * @openapi
 * /syllabus/{subjectID}/{semesterID}:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *  get:
 *    summary: 해당 강의계획서 조회
 *    description: 해당 강의계획서 조회
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 강의계획서 조회
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                assistant_name:
 *                  type: string
 *                  description: 담당 조교명
 *                course_sumary:
 *                  type: string
 *                  description: 교과목 개요
 *                course_performance:
 *                  type: string
 *                  description: 교과목 학습성과
 *                operation_type:
 *                  type: string
 *                  description: 강의운영방식
 *                evaluation_method_ratio:
 *                  type: string
 *                  description: 평가방법비율
 *                credit:
 *                  type: integer
 *                  description: 학점
 *                phone_number:
 *                  type: string
 *                  description: 교수 핸드폰 번호
 *                email:
 *                  type: string
 *                  description: 교수 이메일
 *                classification:
 *                  type: string
 *                  description: 이수구분
 *                professor_name:
 *                  type: string
 *                  description: 교수명
 *                textbook:
 *                  type: string
 *                  description: 교재 정보
 *                lec_schedule:
 *                  type: string
 *                  description: 강의 내용
 *      '201':
 *        description: 교수일 때 해당 강의계획서 조회
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                assistant_name:
 *                  type: string
 *                  description: 담당 조교명
 *                course_sumary:
 *                  type: string
 *                  description: 교과목 개요
 *                course_performance:
 *                  type: string
 *                  description: 교과목 학습성과
 *                operation_type:
 *                  type: string
 *                  description: 강의운영방식
 *                evaluation_method_ratio:
 *                  type: string
 *                  description: 평가방법비율
 *                credit:
 *                  type: integer
 *                  description: 학점
 *                phone_number:
 *                  type: string
 *                  description: 교수 핸드폰 번호
 *                email:
 *                  type: string
 *                  description: 교수 이메일
 *                classification:
 *                  type: string
 *                  description: 이수구분
 *                professor_name:
 *                  type: string
 *                  description: 교수명
 *                textbook:
 *                  type: string
 *                  description: 교재 정보
 *                lec_schedule:
 *                  type: string
 *                  description: 강의 내용
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const [syllabus] = await db.promise().query(`select s.id , s.assistant_name, s.course_sumary, s.course_performance, s.operation_type, s.evaluation_method_ratio,
                sub.credit, p.phone_number, p.email, sub.classification, p.name professor_name, s.textbook, s.lec_schedule
                from syllabus s join subject sub on s.semester = sub.semester and s.sub_code = sub.sub_code
                join professortable p on sub.professor_id = p.id
                where sub.sub_code = ? and sub.semester = ?`, [sub_code, semester]
            );
            const total_result = {
                ...syllabus[0]
            };
            const {id, ...result} = total_result;
            if(token.author == 1){
                return res.status(200).send(result);
            } else{
                console.log(result);
                return res.status(201).send(result);
            }
        }
    } catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /syllabus/{subjectID}/{semesterID}/create:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *  post:
 *    summary: 강의계획서 생성
 *    description: 강의계획서 생성
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              ta_name:
 *                type: string
 *                description: 담당 조교명
 *              intro:
 *                type: string
 *                description: 교과목 개요
 *              achiev:
 *                type: string
 *                description: 교과목 학습성과
 *              rule:
 *                type: string
 *                description: 강의운영방식
 *              ratio:
 *                type: string
 *                description: 평가방법비율
 *              book:
 *                type: string
 *                description: 교재 정보
 *              schedule:
 *                type: string
 *                description: 강의 일정 정보
 *    responses:
 *      '201':
 *        description: 강의계획서 생성 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID/create', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } 
        else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const assistant_name = req.body.ta_name;
            const course_sumary = req.body.intro;
            const course_performance = req.body.achiev;
            const operation_type = req.body.rule;
            const evaluation_method_ratio = req.body.ratio;
            const textbook = req.body.book;
            const lecture_schedule = req.body.schedule;

            db.promise().query(`insert into syllabus(sub_code, semester, assistant_name, course_sumary, course_performance, operation_type, evaluation_method_ratio, textbook, lec_schedule)
                values(?,?,?,?,?,?,?,?,?)`, [sub_code, semester, assistant_name, course_sumary, course_performance, operation_type, evaluation_method_ratio, textbook, lecture_schedule]
            );
            return res.sendStatus(201);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /syllabus/{subjectID}/{semesterID}/update:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *  put:
 *    summary: 강의계획서 수정
 *    description: 강의계획서 수정
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              ta_name:
 *                type: string
 *                description: 담당 조교명
 *              intro:
 *                type: string
 *                description: 교과목 개요
 *              achiev:
 *                type: string
 *                description: 교과목 학습성과
 *              rule:
 *                type: string
 *                description: 강의운영방식
 *              ratio:
 *                type: string
 *                description: 평가방법비율
 *              book:
 *                type: string
 *                description: 교재 정보
 *              schedule:
 *                type: string
 *                description: 강의 일정 정보
 *    responses:
 *      '201':
 *        description: 강의계획서 수정 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.put('/:subjectID/:semesterID/update', async(req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const assistant_name = req.body.ta_name;
            const course_sumary = req.body.intro;
            const course_performance = req.body.achiev;
            const operation_type = req.body.rule;
            const evaluation_method_ratio = req.body.ratio;
            const textbook = req.body.book;
            const lecture_schedule = req.body.schedule;

            db.promise().query(`update syllabus set assistant_name=?, course_sumary=?, course_performance=?, operation_type=?, evaluation_method_ratio=?, textbook=?, lec_schedule=?
                where sub_code=? and semester=?`, [assistant_name, course_sumary, course_performance, operation_type, evaluation_method_ratio, textbook, lecture_schedule, sub_code, semester]
            );
            return res.sendStatus(201);
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
 *                syllabus:
 *                  type: array
 *                  description: 과목 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      sub_code:
 *                        type: string
 *                        description: 과목코드
 *                      sub_name:
 *                        type: string
 *                        description: 과목이름
 *                      credit:
 *                        type: string
 *                        description: 학점
 *                      professor_name:
 *                        type: string
 *                        description: 교수이름
 *                      phone_number:
 *                        type: string
 *                        description: 교수 폰번호
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/', async (req, res) =>{
    const token = jwt.verify(req.cookies['accesstoken']);
    if (Number.isInteger(token)){
        return res.sendStatus(token);
    } else{
        const enrollment = req.body.enrollment;
        const professor_name = req.body.professor_name;
        const semester = req.body.semester;
        const sub_name = req.body.sub_name;
        const major_area = req.body.major_area;
        const userid = token.id;
        const result = {};
        if(token.author == 1){
            if(enrollment == '전체'){
                if(sub_name.length == 0){
                    if(major_area.length == 0){
                        const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from subject s join professortable p on s.professor_id = p.id
                            where s.semester = ? and p.name = ?`,[semester, professor_name]
                        );
                        result.syllabus = syllabus;
                        return res.status(200).send(result);
                    } else{
                        const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from subject s join professortable p on s.professor_id = p.id
                            where s.semester = ? and p.name = ? and s.major_area = ?`,
                            [semester, professor_name, major_area]
                        );
                        result.syllabus = syllabus;
                        return res.status(200).send(result);
                    }
                } else if(professor_name.length == 0) {
                    if(major_area.length == 0){
                        const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from subject s join professortable p on s.professor_id = p.id
                            where s.semester = ? and s.name like ?`,[semester, `%${sub_name}%`]
                        );
                        result.syllabus = syllabus;
                        return res.status(200).send(result);
                    } else{
                        const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from subject s join professortable p on s.professor_id = p.id
                            where s.semester = ? and s.name = ? and s.major_area = ?`,
                            [semester, `%${sub_name}%`, major_area]
                        );
                        result.syllabus = syllabus;
                        return res.status(200).send(result);
                    }
                } else{
                    if(major_area.length == 0){
                        const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from subject s join professortable p on s.professor_id = p.id
                            where s.semester = ? and p.name = ? and s.name like ?`,[semester, professor_name, `%${sub_name}%`]
                        );
                        result.syllabus = syllabus;
                        return res.status(200).send(result);
                    } else{
                        const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from subject s join professortable p on s.professor_id = p.id
                            where s.semester = ? and p.name = ? and s.name = ? and s.major_area = ?`,
                            [semester, professor_name, `%${sub_name}%`, major_area]
                        );
                        result.syllabus = syllabus;
                        return res.status(200).send(result);
                    }
                }
            } else{
                if(sub_name.length == 0){
                    if(professor_name.length == 0){
                        if(major_area.length == 0){
                            const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                                from professortable p join subject s on p.id = s.professor_id
                                join enrollment e on s.sub_code = e.sub_code
                                where e.student_id = ? and s.semester = ?`,[userid, semester]
                            );
                            result.syllabus = syllabus;
                            return res.status(200).send(result);
                        } else{
                            const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                                from professortable p join subject s on p.id = s.professor_id
                                join enrollment e on s.sub_code = e.sub_code
                                where e.student_id = ? and s.semester = ? and s.major_area = ?`,
                                [userid, semester, major_area]
                            );
                            result.syllabus = syllabus;
                            return res.status(200).send(result);
                        }
                    } else{
                        if(major_area.length == 0){
                            const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                                from professortable p join subject s on p.id = s.professor_id
                                join enrollment e on s.sub_code = e.sub_code
                                where e.student_id = ? and s.semester = ? and p.name = ?`,
                                [userid, semester, professor_name]
                            );
                            result.syllabus = syllabus;
                            return res.status(200).send(result);
                        } else{
                            const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                                from professortable p join subject s on p.id = s.professor_id
                                join enrollment e on s.sub_code = e.sub_code
                                where e.student_id = ? and s.semester = ? and s.major_area = ? and p.name = ?`,
                                [userid, semester, major_area, professor_name]
                            );
                            result.syllabus = syllabus;
                            return res.status(200).send(result);
                        }
                    }
                } else{
                    if(professor_name.length == 0){
                        if(major_area.length == 0){
                            const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                                from professortable p join subject s on p.id = s.professor_id
                                join enrollment e on s.sub_code = e.sub_code
                                where e.student_id = ? and s.semester = ? and s.name = ?`,
                                [userid, semester, `%${sub_name}%`]
                            );
                            result.syllabus = syllabus;
                            return res.status(200).send(result);
                        } else{
                            const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                                from professortable p join subject s on p.id = s.professor_id
                                join enrollment e on s.sub_code = e.sub_code
                                where e.student_id = ? and s.semester = ? and s.name = ? and s.major_area = ?`,
                                [userid, semester, `%${sub_name}%`, major_area]
                            );
                            result.syllabus = syllabus;
                            return res.status(200).send(result);
                        }
                    } else{
                        if(major_area.length == 0){
                            const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                                from professortable p join subject s on p.id = s.professor_id
                                join enrollment e on s.sub_code = e.sub_code
                                where e.student_id = ? and s.semester = ? and s.name = ? and p.name = ?`,
                                [userid, semester, `%${sub_name}%`, professor_name]
                            );
                            result.syllabus = syllabus;
                            return res.status(200).send(result);
                        } else{
                            const [syllabus] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                                from professortable p join subject s on p.id = s.professor_id
                                join enrollment e on s.sub_code = e.sub_code
                                where e.student_id = ? and s.semester = ? and s.name = ? and s.major_area = ? and p.name = ?`,
                                [userid, semester, `%${sub_name}%`, major_area, professor_name]
                            );
                            result.syllabus = syllabus;
                            return res.status(200).send(result);
                        }
                    }
                }
            }
        }
    }
})

module.exports = router;