const db = require('../config/db');

module.exports = {
    select_assignmentfile: async (assignment_id) => {
        try{
            const [result] = await db.promise().query(`select JSON_ARRAYAGG(file_name) as file_name
                from assignment_file where assignment_id = ?`, [assignment_id]
            );
            return result[0];
        }
        catch(err){
            throw err;
        }
    },
    select_assignment: async (assignment_id) =>{
        try{
            const [result] = await db.promise().query(`select content from assignment where id = ?`, [assignment_id]);
            return result[0];
        }
        catch(err){
            throw err;
        }
    },
    select_assignmentid: async (semester, sub_code, assignmentid) =>{
        try{
            const [assignment_id] = await db.promise().query(`select id from assignment where sub_code = ? and semester = ? order by id limit ?,1`,
                [sub_code, semester, assignmentid]
            );
            const result = assignment_id[0].id;
            return result;
        }
        catch(err){
            throw err;
        }
    },
    insert_assignmentfile: async (assignment_id, file_info) =>{
        try{
            const values = file_info.map(([name, data]) => [assignment_id, name, data]);
            await db.promise().query(`insert into assignment_file(assignment_id, file_name, file_data) values ?;`,[values])
        }
        catch(err){
            throw err;
        }
    },
    select_assignment_submitid: async (assignment_id, userid) =>{
        try{
            const [submit_id] = await db.promise().query(`select id from assignment_submit where assignment_id = ? and student_id = ?`, [assignment_id, userid]);
            const result = submit_id[0].id;
            return result;
        }
        catch(err){
            throw err;
        }
    },
}