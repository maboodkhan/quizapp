'use strict';

module.exports = function(Quizsetschools) {
    Quizsetschools.assignSchoolQuizSet = function(set_id, data, cb){        
        let msg = {};
        if(set_id === undefined || set_id === '' || set_id === null){
            msg.status = false;
            msg.message = "Please provide set id.";
            return cb(null, msg);
        }

        if(data === undefined || data === '' || data === null){
            msg.status = false;
            msg.message = "Please provide data parameter.";
            return cb(null, msg);
        }

        data.map((mapVal)=>{
            if(mapVal.publishDate === undefined || mapVal.publishDate === '' || mapVal.publishDate === null){
                mapVal.publishDate = new Date();
            }

            if(mapVal.school_id === undefined || mapVal.school_id === '' || mapVal.school_id === null){
                msg.status = false;
                msg.message = "Please provide school id.";
                return cb(null, msg);
            }

            if(mapVal.quiz_set_id === undefined || mapVal.quiz_set_id === '' || mapVal.quiz_set_id === null){
                msg.status = false;
                msg.message = "Please provide quiz set id.";
                return cb(null, msg);
            }
        });

        Quizsetschools.destroyAll({quiz_set_id: set_id}, function(err, rVal){
            if(err){
                console.log(err);
                return cb(null, err);
            }
            
            Quizsetschools.create(data, function(err, asgnData){
                if(err){
                    console.log(err);
                    return cb(null, err);
                }
                msg.status = true;
                msg.message = "Schools assigned successfully.";
                return cb(null, msg);
            });                        
        });
    }

    Quizsetschools.remoteMethod(
        'assignSchoolQuizSet',
        {
            http: {path: '/assignSchoolQuizSet', verb: 'post'},
            description: 'Assign quiz set to schools',
            accepts: [
                {arg: 'set_id', type: 'number', required: true},
                {arg: 'data', type: 'array', required: true}],
            returns: {root: true, type: 'json'}
        }
    );

    Quizsetschools.getSchoolQuizSets = function(data, cb){
        let msg = {};        
        let school_id = (data.school_id==undefined || data.school_id==null || data.school_id==''?undefined:data.school_id);
       

        Quizsetschools.find({
            where:{
                and:
                [
                    {school_id:school_id},
                    {status:1}
                ]
            },            
            include:[
                {
                    relation:"school_quiz_set",
                    scope:{
                        where:{
                            and:[                                                    
                                {status:1}
                            ]
                        }
                    }
                }
            ]
        },function(err,result){
            if(err){
                return cb(null, err);
                msg = {status:false,data:"Error! Please try again."};
                return cb(null,msg);
            }
            msg = {status:true,data:result};
            return cb(null, msg);
        });
    }

    Quizsetschools.remoteMethod(
        'getSchoolQuizSets',
        {
            http: {path: '/getschoolquizsets', verb: 'post'},
            description: 'Get school active quiz sets',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );


    Quizsetschools.getQuizSets = function(data, cb){
        let msg = {};        
        let school_id = (data.school_id==undefined || data.school_id==null || data.school_id==''?0:data.school_id);
        let email = (data.email==undefined || data.email==null || data.email==''?'':data.email);
        let set_name = (data.setName==undefined || data.setName==null || data.setName==''?undefined:data.setName);
        let set_id = (data.set_id==undefined || data.set_id==null || data.set_id==''?undefined:data.set_id);
        let board_id = (data.board_id==undefined || data.board_id==null || data.board_id==''?undefined:data.board_id);
        let class_id = (data.class_id==undefined || data.class_id==null || data.class_id==''?undefined:data.class_id);
        let section_id = (data.section_id==undefined || data.section_id==null || data.section_id==''?undefined:data.section_id);
        let subject_id = (data.subject_id==undefined || data.subject_id==null || data.subject_id==''?undefined:data.subject_id);
        let lesson_id = (data.lesson_id==undefined || data.lesson_id==null || data.lesson_id==''?undefined:data.lesson_id);
        let topic_id = (data.topic_id==undefined || data.topic_id==null || data.topic_id==''?undefined:data.topic_id);
        var ds = Quizsetschools.dataSource;
        let params;
        let cond = '';
        let limit;
        let offset;

        if(data.school_id === undefined || data.school_id === '' || data.school_id === null){
            msg.status = false;
            msg.message = "Please provide school id.";
            return cb(null, msg);
        }

        if(data.email === undefined || data.email === '' || data.email === null){
            msg.status = false;
            msg.message = "Please provide email.";
            return cb(null, msg);
        }

        if(set_name !== undefined) {
            cond = cond + " and ( u.set_name like '%"+ set_name +"%')";
        }

        if(set_id !== undefined) {
            cond = cond + " and qs.id = '"+ set_id +"'";
        }

        if(board_id !== undefined) {
            cond = cond + " and c.board_id = '"+ board_id +"'";
        }

        if(class_id !== undefined) {
            cond = cond + " and qsyb.class_id = '"+ class_id +"'";
        }

        if(section_id !== undefined) {
            cond = cond + " and qsyb.section_id = '"+ section_id +"'";
        }

        if(subject_id !== undefined) {
            cond = cond + " and qsyb.subject_id = '"+ subject_id +"'";
        }

        if(lesson_id !== undefined) {
            cond = cond + " and qsyb.lesson_id = '"+ lesson_id +"'";
        }

        if(topic_id !== undefined) {
            cond = cond + " and qsyb.topic_id = '"+ topic_id +"'";
        }

        if(data.limit==undefined){
            limit = 10;
        } else {
            limit = data.limit;
        }

        if(data.offset==undefined){
            offset = 0;
        } else {
            offset = data.offset;
        }
        
        var countSql = `SELECT count(*) as totalCount FROM post_quiz_set qs 
            left JOIN post_quiz_set_schools qss on qs.id = qss.quiz_set_id
            LEFT JOIN post_quiz_syllabus_details qsyb on qs.id = qsyb.quiz_set_id
            LEFT JOIN schools sch on sch.id = qss.school_id
            LEFT JOIN classes c on c.id = qsyb.class_id
            LEFT JOIN class_sections cs on cs.id = qsyb.section_id
            LEFT JOIN subjects s on s.id = qsyb.subject_id
            LEFT JOIN lessons l on l.id = qsyb.lesson_id
            LEFT JOIN topics t on t.id = qsyb.topic_id
            JOIN user_data ud on  ud.school_id = qss.school_id and ud.class_id = qsyb.class_id and ud.section_id = qsyb.section_id
            WHERE qs.status = 1 and qss.status = 1 and qsyb.status = 1 and sch.status = 1 
            and c.status = 1 and cs.status = 1 and s.status = 1 and l.status = 1 and t.status = 1 
            and qss.school_id = ${school_id} and ud.email = '${email}'
            ${cond}
            GROUP by qs.id, qss.school_id;`;

        var sql = `SELECT qs.id as quiz_set_id, qs.set_name, qs.quiz_syllabus_path, qs.num_ques, 
            qs.duration, qss.publishDate, sch.school_name, sch.school_code, qsyb.class_id, c.class_name, 
            qsyb.subject_id, s.subject_name, qsyb.lesson_id, l.lesson_name, qsyb.topic_id, t.topic_name 
            FROM post_quiz_set qs 
            LEFT JOIN post_quiz_set_schools qss on qs.id = qss.quiz_set_id
            LEFT JOIN post_quiz_syllabus_details qsyb on qs.id = qsyb.quiz_set_id
            LEFT JOIN schools sch on sch.id = qss.school_id
            LEFT JOIN classes c on c.id = qsyb.class_id
            LEFT JOIN class_sections cs on cs.id = qsyb.section_id
            LEFT JOIN subjects s on s.id = qsyb.subject_id
            LEFT JOIN lessons l on l.id = qsyb.lesson_id
            LEFT JOIN topics t on t.id = qsyb.topic_id
            JOIN user_data ud on  ud.school_id = qss.school_id and ud.class_id = qsyb.class_id and ud.section_id = qsyb.section_id
            WHERE qs.status = 1 and qss.status = 1 and qsyb.status = 1 and sch.status = 1 
            and c.status = 1 and cs.status = 1 and s.status = 1 and l.status = 1 and t.status = 1 
            and qss.school_id = ${school_id} and ud.email = '${email}'
            ${cond}
            GROUP by qs.id, qss.school_id
            ORDER BY qs.created_on DESC LIMIT ${offset},${limit};`;
                    //    console.log(sql);
        ds.connector.query(countSql, params, function (err, countData) {
            if(err){
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null,msg);
            }
            ds.connector.query(sql, params, function (err, quizData) {
                if(err){
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null,msg);
                }   
                let countVal = 0;                
                if(countData.length>0){
                    countVal = countData[0].totalCount;
                }
                let contentData = {};
                contentData.status = true;
                contentData.total_count = countVal;
                contentData.data = quizData;          
                //console.log(contentData);
                cb(null,contentData);
            });
        });
    }

    Quizsetschools.remoteMethod(
        'getQuizSets',
        {
            http: {path: '/getquizsets', verb: 'post'},
            description: 'Get school active quiz sets',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );

    
};
