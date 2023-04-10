const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const lecture_material_function = require('../modules/lecture_material_function')
const multer = require('multer');
const upload = multer();

/**
 * @openapi
 * /lecture_material/{subjectID}/{semesterID}/{lecture_materialID}:
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
 *    - name: lecture_materialID
 *      in: path
 *      required: true
 *      description: 강의자료실 번호
 *      schema:
 *        type: integer
 *  get:
 *    summary: 강의자료실 번호 선택
 *    description: 해당하는 번호의 강의자료실 선택
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 강의자료실 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                title:
 *                  type: string
 *                  description: 제목
 *                content:
 *                  type: string
 *                  description: 본문
 *                file_name:
 *                  type: string
 *                  description: 파일이름
 *                file_data:
 *                  type: string
 *                  format: binary
 *                  description: 파일데이터
 *                writer:
 *                  type: string
 *                  description: 작성자
 *                updated_time:
 *                  type: string
 *                  format: date-time
 *                  description: 업데이트 날짜
 *                view:
 *                  type: integer
 *                  description: 조회수
 *                semester:
 *                  type: string
 *                  description: 년도-학기
 *      '201':
 *        description: 교수일 때 해당 강의자료실 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                title:
 *                  type: string
 *                  description: 제목
 *                content:
 *                  type: string
 *                  description: 본문
 *                file_name:
 *                  type: string
 *                  description: 파일이름
 *                file_data:
 *                  type: byte
 *                  format: binary
 *                  description: 파일데이터
 *                writer:
 *                  type: string
 *                  description: 작성자
 *                updated_time:
 *                  type: string
 *                  format: date-time
 *                  description: 업데이트 날짜
 *                view:
 *                  type: integer
 *                  description: 조회수
 *                semester:
 *                  type: string
 *                  description: 년도-학기
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/:lecture_materialID', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const lecture_materialid = req.params.lecture_materialID - 1;
            const userid = token.id;
            if(token.author == 1){
                const [result] = await db.promise().query(`select n.id as id
                from enrollment e join lecture_material n
                on e.sub_code = n.sub_code and e.semester = n.semester
                where e.student_id = ? and e.semester = ? and e.sub_code = ?
                order by n.id limit ?,1`,[userid, semester,sub_code,lecture_materialid])
                const lecture_material_uniqueid = result[0].id;
                const result2 = await db.promise().query(`select * from lecture_material_view where lecture_material_id = ? and user_id = ?`,
                [lecture_material_uniqueid, userid])
                if(result2[0].length > 0){
                    const result3 = await lecture_material_function.select_lecture_materialfile(lecture_material_uniqueid);
                    if(result3.length > 0){
                        const file_info = result3.map(file => [file.file_name, file.file_data]);
                        const result4 = await lecture_material_function.select_lecture_material(lecture_material_uniqueid);
                        const resultwithFile = {
                        ...result4,
                        file_name: file_info.map(file => file[0]),
                        file_data: file_info.map(file => file[1])
                        };
                        res.status(200).send(resultwithFile);
                    } else{
                        const result4 = await lecture_material_function.select_lecture_material(lecture_material_uniqueid);
                        res.status(200).send(result4);
                    }
                } else{
                    db.promise().query(`update lecture_material set view = view + 1 where id = ?`,[lecture_material_uniqueid])
                    db.promise().query(`insert into lecture_material_view(lecture_material_id, user_id) values(?,?)`,[lecture_material_uniqueid,userid])
                    const result3 = await lecture_material_function.select_lecture_materialfile(lecture_material_uniqueid);
                    if(result3.length > 0){
                        const file_info = result3.map(file => [file.file_name, file.file_data]);
                        const result4 = await lecture_material_function.select_lecture_material(lecture_material_uniqueid);
                        const resultwithFile = {
                        ...result4,
                        file_name: file_info.map(file => file[0]),
                        file_data: file_info.map(file => file[1])
                        };
                        res.status(200).send(resultwithFile);
                    } else{
                        const result4 = await lecture_material_function.select_lecture_material(lecture_material_uniqueid);
                        res.status(200).send(result4);
                    }
                }
            } else{
                const lecture_material_uniqueid = await lecture_material_function.select_lecture_materialid(token.name, semester,sub_code,lecture_materialid);
                const result3 = await lecture_material_function.select_lecture_materialfile(lecture_material_uniqueid);
                if(result3.length > 0){
                    const file_info = result3.map(file => [file.file_name, file.file_data]);
                    const result4 = await lecture_material_function.select_lecture_material(lecture_material_uniqueid);
                    const resultwithFile = {
                    ...result4,
                    file_name: file_info.map(file => file[0]),
                    file_data: file_info.map(file => file[1])
                    };
                    res.status(201).send(resultwithFile);
                } else{
                    const result4 = await lecture_material_function.select_lecture_material(lecture_material_uniqueid);
                    res.status(201).send(result4);
                }
            }
        }
    } catch(err){
        throw err;
    }
});

/**
 * @openapi
 * /lecture_material/{subjectID}/{semesterID}:
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
 *    summary: 해당 과목의 강의자료실 버튼 클릭
 *    description: 강의자료실 버튼 클릭
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 과목의 강의자료실 버튼 클릭 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                title:
 *                  type: string
 *                  description: 제목
 *                content:
 *                  type: string
 *                  description: 본문
 *                file_name:
 *                  type: string
 *                  description: 파일이름
 *                file_data:
 *                  type: byte
 *                  format: binary
 *                  description: 파일데이터
 *                writer:
 *                  type: string
 *                  description: 작성자
 *                updated_time:
 *                  type: string
 *                  format: date-time
 *                  description: 업데이트 날짜
 *                view:
 *                  type: integer
 *                  description: 조회수
 *                semester:
 *                  type: string
 *                  description: 년도-학기
 *      '201':
 *        description: 교수일 때 해당 강의자료실 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: int
 *                  description: 강의자료실 번호
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                title:
 *                  type: string
 *                  description: 제목
 *                file_name:
 *                  type: string
 *                  description: 파일이름
 *                file_data:
 *                  type: byte
 *                  format: binary
 *                  description: 파일데이터
 *                writer:
 *                  type: string
 *                  description: 작성자
 *                created_time:
 *                  type: string
 *                  format: date-time
 *                  description: 생성날짜
 *                view:
 *                  type: integer
 *                  description: 조회수
 *                semester:
 *                  type: string
 *                  description: 년도-학기
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID', async (req, res) => {
    const token = jwt.verify(req.cookies['accesstoken']);
    if (Number.isInteger(token)){
        res.sendStatus(token);
    } else{
        let sub_code = req.params.subjectID;
        let semester = req.params.semesterID;
        if(token.author == 1){
            const [result] = await db.promise().query(`select n.id, n.sub_code, n.professor_name, n.title, n.writer, n.created_time, n.view, n.semester
            from enrollment e join lecture_material n
            on e.sub_code = n.sub_code and e.semester = n.semester
            where e.student_id = ? and e.semester = ? and e.sub_code = ? order by n.id`,
            [token.id, semester,sub_code])
            res.status(200).send(result);
        } else{
            const [result] = await db.promise().query(`select id, sub_code, professor_name, title, writer, created_time, view, semester
            from lecture_material where professor_name = ? and semester = ? and sub_code = ? order by id`,
            [token.name, semester,sub_code])
            res.status(201).send(result);
        }
    }
});

/**
 * @openapi
 * /lecture_material/{subjectID}/{semesterID}/create:
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
 *    summary: 강의자료실 생성
 *    description: 강의자료실 생성
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: 제목
 *              content:
 *                type: string
 *                description: 본문
 *              files:
 *                type: array
 *                items:
 *                  type: string
 *                  format: binay
 *                  description: 파일데이터
 *            required:
 *              - title
 *              - content
 *          encoding:
 *            files:
 *              contentType: multipart/form-data
 *    responses:
 *      '200':
 *        description: 강의자료실 생성 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID/create', upload.array('files'), async (req, res) =>{
    const token = jwt.verify(req.cookies['accesstoken']);
    if (Number.isInteger(token)){
        res.sendStatus(token);
    } else{
        let sub_code = req.params.subjectID;
        let semester = req.params.semesterID;
        let title = req.body.title;
        let content = req.body.content;
        let files = req.files;
        await db.promise().query(`insert into 
        lecture_material(sub_code,professor_name,title,content,writer,semester)
        values (?,?,?,?,?,?);`,
        [sub_code,token.name,title,content,token.name,semester])
        if(files){
            const file_info = files.map(file => [file.originalname, file.buffer]);
            const [result] = await db.promise().query(`select id from lecture_material order by id desc limit 1;`,);
            const lecture_material_id = result[0].id
            lecture_material_function.insert_lecture_materialfile(lecture_material_id, file_info);
        }
        res.sendStatus(200);
    }
})

/**
 * @openapi
 * /lecture_material/{subjectID}/{semesterID}/{lecture_materialID}/update:
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
 *    - name: lecture_materialID
 *      in: path
 *      required: true
 *      description: 강의자료실 번호
 *      schema:
 *        type: integer
 *  post:
 *    summary: 강의자료실 수정
 *    description: 강의자료실 수정
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: 제목
 *              content:
 *                type: string
 *                description: 본문
 *              files:
 *                type: string
 *                format: binary
 *                description: 파일
 *    responses:
 *      '200':
 *        description: 강의자료실 수정 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID/:lecture_materialID/update', async (req, res) =>{
    const token = jwt.verify(req.cookies['accesstoken']);
    if (Number.isInteger(token)){
        res.sendStatus(token);
    } else{
        let sub_code = req.params.subjectID;
        let semester = req.params.semesterID;
        let lecture_materialid = req.params.lecture_materialID - 1;
        let title = req.body.title;
        let content = req.body.content;
        let files = req.files;
        const lecture_material_id = await lecture_material_function.select_lecture_materialid(token.name, semester,sub_code,lecture_materialid)
        db.promise().query(`update lecture_material set title=?, content=? where id=?`, [title, content, lecture_material_id]);
        const [result2] = await lecture_material_function.select_lecture_materialfile(lecture_material_id);
        if(result2.length > 0){
            await db.promise().query(`delete from lecture_material_file where lecture_material_id=?;`, [lecture_material_id]);
        }
        if(files){
            const file_info = files.map(file => [file.originalname, file.buffer]);
            lecture_material_function.insert_lecture_materialfile(lecture_material_id, file_info);
        }
        res.sendStatus(200);
    }
})

/**
 * @openapi 
 * /lecture_material/{subjectID}/{semesterID}/{lecture_materialID}/delete:
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
 *    - name: lecture_materialID
 *      in: path
 *      required: true
 *      description: 강의자료실 번호
 *      schema:
 *        type: integer
 *  get:
 *    summary: 강의자료실 삭제
 *    description: 강의자료실 삭제
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 강의자료실 삭제 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/:lecture_materialID/delete', async (req, res) =>{
    const token = jwt.verify(req.cookies['accesstoken']);
    if (Number.isInteger(token)){
        res.sendStatus(token);
    } else{
        let sub_code = req.params.subjectID;
        let semester = req.params.semesterID;
        let lecture_materialid = req.params.lecture_materialID - 1;
        db.promise().query(`delete from lecture_material where id = (select id from
        (select id from lecture_material 
        where professor_name=? and semester=? and sub_code = ?
        order by id limit ?,1) tmp);`,
        [token.name, semester, sub_code, lecture_materialid])
        res.sendStatus(200);
    }
})

module.exports = router;