const db = require('../config/db');

module.exports = {
    select_textbook_ids: async (textbook) => {
        try{
            const textbook_info = Object.values(textbook).map(text => [text.title, text.author, text.publisher, text.publish_year]);
            db.promise().query(`insert ignore into textbook(title, author, publisher, publish_year) values ?`, [textbook_info]);
            const textbook_ids = [];
            for(let i = 0; i < textbook_info.length; i++){
                const [rows] = await db.promise().query(`select id from textbook where title =? and author =?`, [textbook_info[i][0], textbook_info[i][1]]);
                textbook_ids.push(rows[0].id)
            }
            return textbook_ids;
        }
        catch(err){
            throw err;
        }
    },
    select_syllabus_id: async (sub_code, semester) =>{
        try{
            const [syllabus_id] = await db.promise().query(`select id from syllabus where sub_code = ? and semester = ?`, [sub_code, semester]);
            
            return syllabus_id;
        }
        catch(err){
            throw err;
        }
    },
    insert_schedule_and_syllabus_textbook: async (lecture_schedule, textbook_ids, syllabus_id) =>{
        try{
            const syllabus_textbook_info = textbook_ids.map(text => [syllabus_id[0].id, text]);
            db.promise().query(`insert into syllabus_textbook(syllabus_id, textbook_id) values ?`, [syllabus_textbook_info]);
            const lecture_schedule_info = Object.values(lecture_schedule).map(lec => [syllabus_id[0].id, lec.week, lec.content]);
            db.promise().query(`insert into lecture_schedule(syllabus_id, week, content) values ?`, [lecture_schedule_info]);
        }
        catch(err){
            throw err;
        }
    }
}