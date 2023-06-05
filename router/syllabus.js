const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const syllabus_function = require('../modules/syllabus_function');

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
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                semester:
 *                  type: string
 *                  description: 학기
 *                subject_name:
 *                  type: string
 *                  description: 과목명
 *                credit:
 *                  type: integer
 *                  description: 학점
 *                time:
 *                  type: string
 *                  description: 강의시간
 *                class:
 *                  type: string
 *                  description: 강의실
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
            const [subject_professor_info] = await db.promise().query(`select s.sub_code, s.semester, s.name subject_name, s.credit, s.time, s.class, p.phone_number, p.email, p.name professor_name
                from subject s join professortable p on s.professor_id = p.id
                where s.sub_code = ? and s.semester = ?`, [sub_code, semester]
            );
            return res.status(201).send(subject_professor_info);
        }
    }
    catch(err){
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
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                semester:
 *                  type: string
 *                  description: 학기
 *                subject_name:
 *                  type: string
 *                  description: 과목명
 *                credit:
 *                  type: integer
 *                  description: 학점
 *                time:
 *                  type: string
 *                  description: 강의시간
 *                class:
 *                  type: string
 *                  description: 강의실
 *                phone_number:
 *                  type: string
 *                  description: 교수 핸드폰 번호
 *                email:
 *                  type: string
 *                  description: 교수 이메일
 *                professor_name:
 *                  type: string
 *                  description: 교수명
 *                교재:
 *                  type: array
 *                  description: 교재 목록
 *                  items:
 *                    type: object
 *                    properties:
 *                      title:
 *                        type: string
 *                        description: 제목
 *                      author:
 *                        type: string
 *                        description: 저자
 *                      publisher:
 *                        type: string
 *                        description: 출판사
 *                      publish_year:
 *                        type: string
 *                        description: 출판일
 *                강의 일정 및 내용:
 *                  type: array
 *                  description: 강의 일정 및 내용
 *                  items:
 *                    type: object
 *                    properties:
 *                      week:
 *                        type: string
 *                        description: 주차
 *                      content:
 *                        type: string
 *                        description: 주차별 설명
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
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                semester:
 *                  type: string
 *                  description: 학기
 *                subject_name:
 *                  type: string
 *                  description: 과목명
 *                credit:
 *                  type: integer
 *                  description: 학점
 *                time:
 *                  type: string
 *                  description: 강의시간
 *                class:
 *                  type: string
 *                  description: 강의실
 *                phone_number:
 *                  type: string
 *                  description: 교수 핸드폰 번호
 *                email:
 *                  type: string
 *                  description: 교수 이메일
 *                professor_name:
 *                  type: string
 *                  description: 교수명
 *                교재:
 *                  type: array
 *                  description: 교재 목록
 *                  items:
 *                    type: object
 *                    properties:
 *                      title:
 *                        type: string
 *                        description: 제목
 *                      author:
 *                        type: string
 *                        description: 저자
 *                      publisher:
 *                        type: string
 *                        description: 출판사
 *                      publish_year:
 *                        type: string
 *                        description: 출판일
 *                강의 일정 및 내용:
 *                  type: array
 *                  description: 강의 일정 및 내용
 *                  items:
 *                    type: object
 *                    properties:
 *                      week:
 *                        type: string
 *                        description: 주차
 *                      content:
 *                        type: string
 *                        description: 주차별 설명
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
                sub.sub_code, sub.semester, sub.name subject_name, sub.credit, sub.time, sub.class, p.phone_number, p.email, p.name professor_name
                from syllabus s join subject sub on s.semester = sub.semester and s.sub_code = sub.sub_code
                join professortable p on sub.professor_id = p.id
                where sub.sub_code = ? and sub.semester = ?`, [sub_code, semester]
            );
            const [textbook] = await db.promise().query(`select text.title, text.author, text.publisher, text.publish_year
                from syllabus_textbook syltext join textbook text on syltext.textbook_id = text.id
                where syltext.syllabus_id = ?`, [syllabus[0].id]
            );
            const [lec_schedule] = await db.promise().query(`select lec.week, lec.content
                from syllabus syl join lecture_schedule lec on syl.id = lec.syllabus_id
                where syl.id = ?`, [syllabus[0].id]
            );
            const total_result = {
                ...syllabus[0],
                '교재': textbook,
                '강의 일정 및 내용':lec_schedule
            };
            const {id, ...result} = total_result;
            if(token.author == 1){
                return res.status(200).send(result);
            } else{
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
 *              assistant_name:
 *                type: string
 *                description: 담당 조교명
 *              course_sumary:
 *                type: string
 *                description: 교과목 개요
 *              course_performance:
 *                type: string
 *                description: 교과목 학습성과
 *              operation_type:
 *                type: string
 *                description: 강의운영방식
 *              evaluation_method_ratio:
 *                type: string
 *                description: 평가방법비율
 *              textbook:
 *                type: array
 *                description: 교재
 *                items:
 *                  type: object
 *                  properties:
 *                    title:
 *                      type: string
 *                      description: 제목
 *                    author:
 *                      type: string
 *                      description: 저자
 *                    publisher:
 *                      type: string
 *                      description: 출판사
 *                    publish_year:
 *                      type: string
 *                      description: 출판일
 *              lec_schedule:
 *                type: array
 *                description: 강의일정
 *                items:
 *                  type: object
 *                  properties:
 *                    week:
 *                      type: string
 *                      description: 주차
 *                    content:
 *                      type: string
 *                      description: 주차별 설명
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
            const assistant_name = req.body.assistant_name;
            const course_sumary = req.body.course_sumary;
            const course_performance = req.body.course_performance;
            const operation_type = req.body.operation_type;
            const evaluation_method_ratio = req.body.evaluation_method_ratio;
            const textbook = req.body.textbook;
            const lecture_schedule = req.body.lecture_schedule;

            db.promise().query(`insert into syllabus(sub_code, semester, assistant_name, course_sumary, course_performance, operation_type, evaluation_method_ratio)
                values(?,?,?,?,?,?,?)`, [sub_code, semester, assistant_name, course_sumary, course_performance, operation_type, evaluation_method_ratio]
            );
            const textbook_ids = await syllabus_function.select_textbook_ids(textbook);
            const syllabus_id = await syllabus_function.select_syllabus_id(sub_code, semester);
            syllabus_function.insert_schedule_and_syllabus_textbook(lecture_schedule, textbook_ids, syllabus_id);
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
 *  post:
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
 *              assistant_name:
 *                type: string
 *                description: 담당 조교명
 *              course_sumary:
 *                type: string
 *                description: 교과목 개요
 *              course_performance:
 *                type: string
 *                description: 교과목 학습성과
 *              operation_type:
 *                type: string
 *                description: 강의운영방식
 *              evaluation_method_ratio:
 *                type: string
 *                description: 평가방법비율
 *              textbook:
 *                type: array
 *                description: 교재
 *                items:
 *                  type: object
 *                  properties:
 *                    title:
 *                      type: string
 *                      description: 제목
 *                    author:
 *                      type: string
 *                      description: 저자
 *                    publisher:
 *                      type: string
 *                      description: 출판사
 *                    publish_year:
 *                      type: string
 *                      description: 출판일
 *              lec_schedule:
 *                type: array
 *                description: 강의일정
 *                items:
 *                  type: object
 *                  properties:
 *                    week:
 *                      type: string
 *                      description: 주차
 *                    content:
 *                      type: string
 *                      description: 주차별 설명
 *    responses:
 *      '201':
 *        description: 강의계획서 수정 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID/update', async(req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const assistant_name = req.body.assistant_name;
            const course_sumary = req.body.course_sumary;
            const course_performance = req.body.course_performance;
            const operation_type = req.body.operation_type;
            const evaluation_method_ratio = req.body.evaluation_method_ratio;
            const textbook = req.body.textbook;
            const lecture_schedule = req.body.lecture_schedule;

            db.promise().query(`update syllabus set assistant_name=?, course_sumary=?, course_performance=?, operation_type=?, evaluation_method_ratio=?
                where sub_code=? and semester=?`, [assistant_name, course_sumary, course_performance, operation_type, evaluation_method_ratio, sub_code, semester]
            );
            const textbook_ids = await syllabus_function.select_textbook_ids(textbook);
            const syllabus_id = await syllabus_function.select_syllabus_id(sub_code, semester);
            
            db.promise().query(`delete from syllabus_textbook where syllabus_id = ?`, [syllabus_id[0].id]);
            db.promise().query(`delete from lecture_schedule where syllabus_id = ?`, [syllabus_id[0].id]);

            syllabus_function.insert_schedule_and_syllabus_textbook(lecture_schedule, textbook_ids, syllabus_id);
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
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  sub_code:
 *                    type: string
 *                    description: 과목코드
 *                  sub_name:
 *                    type: string
 *                    description: 과목이름
 *                  credit:
 *                    type: string
 *                    description: 학점
 *                  professor_name:
 *                    type: string
 *                    description: 교수이름
 *                  phone_number:
 *                    type: string
 *                    description: 교수 폰번호
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
        if(enrollment == '전체'){
            if(sub_name.length == 0){
                if(major_area.length == 0){
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from subject s join professortable p on s.professor_id = p.id
                        where s.semester = ? and p.name = ?;`,[semester, professor_name]
                    );
                    return res.status(200).send(result);
                } else{
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from subject s join professortable p on s.professor_id = p.id
                        where s.semester = ? and p.name = ? and s.major_area = ?;`,
                        [semester, professor_name, major_area]
                    );
                    return res.status(200).send(result);
                }
            } else if(professor_name.length == 0) {
                if(major_area.length == 0){
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from subject s join professortable p on s.professor_id = p.id
                        where s.semester = ? and s.name like ?;`,[semester, `%${sub_name}%`]
                    );
                    return res.status(200).send(result);
                } else{
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from subject s join professortable p on s.professor_id = p.id
                        where s.semester = ? and s.name = ? and s.major_area = ?;`,
                        [semester, `%${sub_name}%`, major_area]
                    );
                    return res.status(200).send(result);
                }
            } else{
                if(major_area.length == 0){
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from subject s join professortable p on s.professor_id = p.id
                        where s.semester = ? and p.name = ? and s.name like ?;`,[semester, professor_name, `%${sub_name}%`]
                    );
                    return res.status(200).send(result);
                } else{
                    const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                        from subject s join professortable p on s.professor_id = p.id
                        where s.semester = ? and p.name = ? and s.name = ? and s.major_area = ?;`,
                        [semester, professor_name, `%${sub_name}%`, major_area]
                    );
                    return res.status(200).send(result);
                }
            }
        } else{
            if(sub_name.length == 0){
                if(professor_name.length == 0){
                    if(major_area.length == 0){
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from professortable p join subject s on p.id = s.professor_id
                            join enrollment e on s.sub_code = e.sub_code
                            where e.student_id = ? and s.semester = ?;`,[userid, semester]
                        );
                        return res.status(200).send(result);
                    } else{
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from professortable p join subject s on p.id = s.professor_id
                            join enrollment e on s.sub_code = e.sub_code
                            where e.student_id = ? and s.semester = ? and s.major_area = ?;`,
                            [userid, semester, major_area]
                        );
                        return res.status(200).send(result);
                    }
                } else{
                    if(major_area.length == 0){
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from professortable p join subject s on p.id = s.professor_id
                            join enrollment e on s.sub_code = e.sub_code
                            where e.student_id = ? and s.semester = ? and p.name = ?;`,
                            [userid, semester, professor_name]
                        );
                        return res.status(200).send(result);
                    } else{
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from professortable p join subject s on p.id = s.professor_id
                            join enrollment e on s.sub_code = e.sub_code
                            where e.student_id = ? and s.semester = ? and s.major_area = ? and p.name = ?;`,
                            [userid, semester, major_area, professor_name]
                        );
                        return res.status(200).send(result);
                    }
                }
            } else{
                if(professor_name.length == 0){
                    if(major_area.length == 0){
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from professortable p join subject s on p.id = s.professor_id
                            join enrollment e on s.sub_code = e.sub_code
                            where e.student_id = ? and s.semester = ? and s.name = ?;`,
                            [userid, semester, `%${sub_name}%`]
                        );
                        return res.status(200).send(result);
                    } else{
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from professortable p join subject s on p.id = s.professor_id
                            join enrollment e on s.sub_code = e.sub_code
                            where e.student_id = ? and s.semester = ? and s.name = ? and s.major_area = ?;`,
                            [userid, semester, `%${sub_name}%`, major_area]
                        );
                        return res.status(200).send(result);
                    }
                } else{
                    if(major_area.length == 0){
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from professortable p join subject s on p.id = s.professor_id
                            join enrollment e on s.sub_code = e.sub_code
                            where e.student_id = ? and s.semester = ? and s.name = ? and p.name = ?;`,
                            [userid, semester, `%${sub_name}%`, professor_name]
                        );
                        return res.status(200).send(result);
                    } else{
                        const [result] = await db.promise().query(`select s.sub_code,s.name sub_name,s.classification,s.credit,p.name professor_name,p.phone_number
                            from professortable p join subject s on p.id = s.professor_id
                            join enrollment e on s.sub_code = e.sub_code
                            where e.student_id = ? and s.semester = ? and s.name = ? and s.major_area = ? and p.name = ?;`,
                            [userid, semester, `%${sub_name}%`, major_area, professor_name]
                        );
                        return res.status(200).send(result);
                    }
                }
            }
        }
    }
})

module.exports = router;