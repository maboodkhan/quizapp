'use strict';

module.exports = function (Syllabusquestions) {
    Syllabusquestions.getQuestions = function (data, cb) {
        let msg = {};
        let syllabus_id = (data.syllabus_id == undefined || data.syllabus_id == null || data.syllabus_id == '' || data.syllabus_id.length < 1) ? undefined : data.syllabus_id;
        let syllabus_type = (data.syllabus_type == undefined || data.syllabus_type == null || data.syllabus_type == '') ? 'topic' : data.syllabus_type;
        let qc_done = (data.qc_done == undefined || data.qc_done == null || data.qc_done == '' || data.qc_done.length < 1) ? undefined : data.qc_done;
        let issue_status = (data.issue_status == undefined || data.issue_status == null || data.issue_status == '') ? undefined : data.issue_status;
        let syllabusCond = {};
        let qcDoneCond = {};
        if (qc_done !== undefined) {
            qcDoneCond = { qc_done: { inq: qc_done } };
        }
        if (syllabus_id == undefined) {
            msg = { status: false, message: "Please provide syllabus id" };
            return cb(null, msg);
        }

        Syllabusquestions.find(
            {
                where: {
                    syllabus_id: { inq: syllabus_id },
                    syllabus_type: syllabus_type
                },
                fields: { id: true, question_id: true, syllabus_id: true },
                include: [
                    {
                        relation: "question_topic",
                        scope: {
                            where: { status: 1 },
                            include: [
                                {
                                    relation: "lesson_topics",
                                    scope: {
                                        fields: { id: true, lesson_name: true, lesson_id: true },
                                        where: { status: 1 },
                                    }
                                }
                            ]
                        }
                    },
                    {
                        relation: "syllabus_questions",
                        scope: {
                            where:
                            {
                                and:
                                    [
                                        qcDoneCond,
                                        { status: 1 }
                                    ]
                            },
                            order: "id",
                            include: [
                                {
                                    relation: "ansoptions",
                                    scope: {
                                        fields: ["id", "answer"],
                                        where: { status: 1 }
                                    }
                                },
                                {
                                    relation: "que_assigned_to",
                                    scope: {
                                        fields: ["id", "firstName", "lastName"],
                                        where: { status: 1 }
                                    }
                                },
                                {
                                    relation: "que_assigned_by",
                                    scope: {
                                        fields: ["id", "firstName", "lastName"],
                                        where: { status: 1 }
                                    }
                                },
                                {
                                    relation: "question_level",
                                    scope: {
                                        fields: ["id", "level_name"],
                                        where: { status: 1 }
                                    }
                                },
                                {
                                    relation: "question_issue",
                                    scope: {
                                        fields: ["id", "issue_status"],
                                    }
                                },
                                {
                                    relation: "rightansoption",
                                    scope: {
                                        fields: ["id", "answer_id"],
                                        where: { status: 1 },
                                        include: [
                                            {
                                                relation: "right_ans",
                                                scope: {
                                                    fields: ["id", "answer"],
                                                    where: { status: 1 }
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    return cb(null, err);
                    msg = { status: false, data: "Error! Please try again." };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Syllabusquestions.remoteMethod(
        'getQuestions',
        {
            http: { path: '/getquestions', verb: 'post' },
            description: 'Get active questions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Syllabusquestions.getAllQuestions = function (data, cb) {
        let msg = {};
        // console.log(data);
        let syllabus_id = (data.syllabus_id == undefined || data.syllabus_id == null || data.syllabus_id == '' || data.syllabus_id.length < 1) ? undefined : data.syllabus_id;
        let syllabus_type = (data.syllabus_type == undefined || data.syllabus_type == null || data.syllabus_type == '') ? 'topic' : data.syllabus_type;
        let qc_done = (data.qc_done == undefined || data.qc_done == null || data.qc_done == '' || data.qc_done.length < 1) ? undefined : data.qc_done;
        let issue_status = (data.issue_status == undefined || data.issue_status == null || data.issue_status == '') ? undefined : data.issue_status;
        let syllabusCond = {};
        let qcDoneCond = {};
        if (qc_done !== undefined) {
            qcDoneCond = { qc_done: { inq: qc_done } };
        }
        if (syllabus_id == undefined) {
            msg = { status: false, message: "Please provide syllabus id" };
            return cb(null, msg);
        }

        Syllabusquestions.find(
            {
                where: {
                    syllabus_id: { inq: syllabus_id },
                    syllabus_type: syllabus_type
                },
                fields: { id: true, question_id: true, syllabus_id: true },
                include: [
                    {
                        relation: "question_topic",
                        scope: {
                            where: { status: 1 },
                            include: [
                                {
                                    relation: "lesson_topics",
                                    scope: {
                                        fields: ["id", "lesson_name", "subject_id"],
                                        where: { status: 1 },
                                        include: [
                                            {
                                                relation: "subject_lessons",
                                                scope: {
                                                    fields: ["id", "subject_name", "class_id"],
                                                    where: { status: 1 },
                                                    include: [
                                                        {
                                                            relation: "class_subjects",
                                                            scope: {
                                                                fields: ["id", "class_name"],
                                                                where: { status: 1 }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        relation: "syllabus_questions",
                        scope: {
                            where:
                            {
                                and:
                                    [
                                        qcDoneCond,
                                        {
                                            or: [{ status: 1 },{ status: 2 }]
                                        }

                                    ]
                            },
                            order: "id",
                            include: [
                                {
                                    relation: "ansoptions",
                                    scope: {
                                        fields: ["id", "answer"],
                                        where: { status: 1 }
                                    }
                                },
                                {
                                    relation: "que_assigned_to",
                                    scope: {
                                        fields: ["id", "firstName", "lastName"],
                                        where: { status: 1 }
                                    }
                                },
                                {
                                    relation: "que_assigned_by",
                                    scope: {
                                        fields: ["id", "firstName", "lastName"],
                                        where: { status: 1 }
                                    }
                                },
                                {
                                    relation: "question_level",
                                    scope: {
                                        fields: ["id", "level_name"],
                                        where: { status: 1 }
                                    }
                                },
                                {
                                    relation: "question_issue",
                                    scope: {
                                        fields: ["id", "issue_status"],
                                    }
                                },
                                {
                                    relation: "rightansoption",
                                    scope: {
                                        fields: ["id", "answer_id"],
                                        where: { status: 1 },
                                        include: [
                                            {
                                                relation: "right_ans",
                                                scope: {
                                                    fields: ["id", "answer"],
                                                    where: { status: 1 }
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    return cb(null, err);
                    msg = { status: false, data: "Error! Please try again." };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Syllabusquestions.remoteMethod(
        'getAllQuestions',
        {
            http: { path: '/getAllQuestions', verb: 'post' },
            description: 'Get active questions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Syllabusquestions.changeSyllabus = function (data, cb) {
        let msg = {};
        // console.log(data);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;
        let syllabus_id = (data.syllabus_id == undefined || data.syllabus_id == null || data.syllabus_id == '') ? undefined : data.syllabus_id;

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }

        if (question_id == undefined) {
            msg = { status: false, message: "Please provide question id" };
            return cb(null, msg);
        }

        if (syllabus_id == undefined) {
            msg = { status: false, message: "Please provide syllabus id" };
            return cb(null, msg);
        }

        let Questionqclogs = Syllabusquestions.app.models.question_qc_logs;
        Syllabusquestions.upsertWithWhere({question_id: question_id}, {syllabus_id: syllabus_id}, function(err, res){
            if(err) { return cb(null, err) }

            let logObj = {
                question_id: question_id,
                user_id: user_id,
                action: 'Move Question',
                description: 'Question move to another topic'
            }
            Questionqclogs.upsert(logObj, function(error, result){
                if(err) { return cb(null, error) }
            })
            msg = { status: true, data: res };
            return cb(null, msg);
        });
    }

    Syllabusquestions.remoteMethod(
        'changeSyllabus',
        {
            http: { path: '/changeSyllabus', verb: 'post' },
            description: 'Get active questions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Syllabusquestions.getQuesPostTest = async function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ) ? undefined : data.user_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ) ? undefined : data.subject_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ) ? undefined : data.lesson_id;
        
        let syllabusCond = {};

        try {
            if (user_id == undefined) {
                msg = { status: false, message: "Please provide user id" };
                return msg;
            }

            // if (subject_id == undefined) {
            //     msg = { status: false, message: "Please provide subject id" };
            //     return msg;
            // }

            if (lesson_id == undefined) {
                msg = { status: false, message: "Please provide lesson id" };
                return msg;
            }

            let subData = await getSubject(subject_id);
            let subject_name = subData.subject_name;
            let getTopicIds = await getTopics(lesson_id);
            let getAttemptedQuesIds = await getAttemptedQues(getTopicIds, user_id);
            if(getAttemptedQuesIds.length<1 && subject_name != 'Science'){
                let chkAvailabity = await chkSybLevelWiseCount(getTopicIds);
                if(!chkAvailabity){
                    msg.status = false;
                    msg.message = "This functionality will be coming soon for this Chapter";
                    return msg;
                }
            }
            if(getAttemptedQuesIds.length>0 && subject_name != 'Science'){
                let chkAvailabity = await chkSybLevelWiseCount(getTopicIds, getAttemptedQuesIds);
                if(!chkAvailabity){
                    getAttemptedQuesIds = [];
                }
            }
            let quesIdArr = [];
            let getQuesData = [];
            if(subject_name == 'Science'){                
                let quesTopicLevel1Ques = await getTopicLevelQues(getTopicIds, 1, getAttemptedQuesIds);
                let quesTopicLevel2Ques = await getTopicLevelQues(getTopicIds, 2, getAttemptedQuesIds);
                let quesTopicLevel3Ques = await getTopicLevelQues(getTopicIds, 3, getAttemptedQuesIds);
                quesIdArr = quesIdArr.concat(quesTopicLevel1Ques);
                quesIdArr = quesIdArr.concat(quesTopicLevel2Ques);

                quesIdArr = quesIdArr.concat(quesTopicLevel3Ques);
                let getQuesData_1 = await getPostTestQuesScience(getTopicIds, quesIdArr, getAttemptedQuesIds);

                // quesTopicLevel1Ques = quesTopicLevel1Ques.concat(getAttemptedQuesIds);
                // quesTopicLevel2Ques = quesTopicLevel2Ques.concat(getAttemptedQuesIds);
                // quesTopicLevel3Ques = quesTopicLevel3Ques.concat(getAttemptedQuesIds);

                let quesTopicLevel4Ques = await getTopicLevelQues(getTopicIds, 1, getAttemptedQuesIds, quesTopicLevel1Ques);
                let quesTopicLevel5Ques = await getTopicLevelQues(getTopicIds, 2, getAttemptedQuesIds, quesTopicLevel2Ques);
                let quesTopicLevel6Ques = await getTopicLevelQues(getTopicIds, 3, getAttemptedQuesIds, quesTopicLevel3Ques);

                let quesIdArrAttempt = [];
                // quesIdArrAttempt = quesIdArrAttempt.concat(getAttemptedQuesIds);
                quesIdArrAttempt = quesIdArrAttempt.concat(quesIdArr);
                
                let quesIdArrNotAttempt = [];
                quesIdArrNotAttempt = quesIdArrNotAttempt.concat(quesTopicLevel4Ques);
                quesIdArrNotAttempt = quesIdArrNotAttempt.concat(quesTopicLevel5Ques);
                quesIdArrNotAttempt = quesIdArrNotAttempt.concat(quesTopicLevel6Ques);          
                
                
                quesIdArr = quesIdArr.concat(quesIdArrNotAttempt);
                if(quesIdArr.length<18){
                    msg.status = false;
                    msg.message = "This functionality will be coming soon for this Chapter";
                    return msg;
                }
                let getQuesData_2= await getPostTestQuesScience(getTopicIds, quesIdArrNotAttempt, getAttemptedQuesIds, quesIdArrAttempt);
                getQuesData = getQuesData.concat(getQuesData_1);
                getQuesData = getQuesData.concat(getQuesData_2);
            } else {
                // let quesLevel_1 = await getQuestLevel1(getTopicIds, getAttemptedQuesIds);
                // quesLevel_1 = quesLevel_1.join(',');
                // let quesLevel_2 = await getQuestLevel2(getTopicIds, getAttemptedQuesIds);
                // quesLevel_2 = quesLevel_2.join(',');
                // let quesLevel_3 = await getQuestLevel3(getTopicIds, getAttemptedQuesIds); 
                // quesLevel_3 = quesLevel_3.join(',');   
                
                let delTempQues = await deleteUserTempQues(user_id);
                let quesLevel_1 = await getQuestLevel(getTopicIds, 1, getAttemptedQuesIds);
                quesLevel_1 = quesLevel_1.join(',');
                let quesLevel_2 = await getQuestLevel(getTopicIds, 2, getAttemptedQuesIds);
                quesLevel_2 = quesLevel_2.join(',');
                let quesLevel_3 = await getQuestLevel(getTopicIds, 3, getAttemptedQuesIds); 
                quesLevel_3 = quesLevel_3.join(',');   
                // quesIdArr = quesIdArr.join(',');
                quesIdArr = [quesLevel_1, quesLevel_2, quesLevel_3];
                let getQuesData = await getPostTestQuestions(user_id, getTopicIds, quesIdArr, getAttemptedQuesIds);
                // getQuesData = await getUserTestQuestions(user_id, getTopicIds);
            }
            
            msg.status = true;
            msg.message = '';
            msg.subject_name = subject_name;
            msg.data = getQuesData;
            return msg;
        } catch(error) {
            console.log(error)
            msg.status = false;
            msg.message = error;
            return msg;
        }
    }

    Syllabusquestions.remoteMethod(
        'getQuesPostTest',
        {
            http: { path: '/getposttestques', verb: 'post' },
            description: 'Get post test active questions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Syllabusquestions.getUserQuesPostTest = async function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ) ? undefined : data.user_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ) ? undefined : data.subject_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ) ? undefined : data.lesson_id;
        
        let syllabusCond = {};

        try {
            if (user_id == undefined) {
                msg = { status: false, message: "Please provide user id" };
                return msg;
            }

            // if (subject_id == undefined) {
            //     msg = { status: false, message: "Please provide subject id" };
            //     return msg;
            // }

            if (lesson_id == undefined) {
                msg = { status: false, message: "Please provide lesson id" };
                return msg;
            }

            let subData = await getSubject(subject_id);
            let subject_name = subData.subject_name;
            // let getTopicIds = await getTopics(lesson_id);            
            // let getQuesData = await getPostTestQuestions(user_id, getTopicIds, quesIdArr, getAttemptedQuesIds);
            let getQuesData = await getUserTestQuestions(user_id);
           
            msg.status = true;
            msg.message = '';
            msg.subject_name = subject_name;
            msg.data = getQuesData;
            return msg;
        } catch(error) {
            console.log(error)
            msg.status = false;
            msg.message = error;
            return msg;
        }
    }

    Syllabusquestions.remoteMethod(
        'getUserQuesPostTest',
        {
            http: { path: '/getuserposttestques', verb: 'post' },
            description: 'Get post test active questions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getTopics = (lesson_id) => {
        return new Promise((resolve, reject) => {
            let Topics = Syllabusquestions.app.models.topics;
            Topics.find({
                where: { lesson_id: lesson_id},
                fields: ['id']
            }, function(err, result) {
                if(err){
                    reject(err.messasge);
                }
                let topicIds = [];
                if(result.length>0){
                    result.forEach((topicVal) => {
                        topicIds.push(topicVal.id);
                    });
                    resolve(topicIds);
                } else {
                    reject("No topic found.");
                }                
            });
        });        
    }

    let chkSybLevelWiseCount = (topicIds, questionIds=[]) => {
        return new Promise((resolve, reject)=>{
            let topicIdsVal = topicIds.join(',');
            let params;
            let ds = Syllabusquestions.dataSource;
            let levelArr = [1,2,3];
            let disbVal;
            let incValArr = [];
            let topicArr = [];
            let cond = '';
            if(questionIds.length>0){
                questionIds = questionIds.join(',');
                cond = ` and q.id NOT IN(${questionIds})`;
            }

            levelArr.forEach((levelVal) => {
                let sql = `SELECT sq.syllabus_id, q.level_id, count(*) countVal 
                        FROM syllabus_questions sq 
                        join questions q on sq.question_id = q.id
                        where sq.syllabus_id IN(${topicIdsVal}) and q.question_type='Post-Test'
                        and q.level_id = ${levelVal} and q.status=1 and sq.status=1
                        ${cond}
                        group by sq.syllabus_id, q.level_id`;
                        // console.log(sql);
                ds.connector.query(sql, params, function(err, quesData) {
                    if(err){
                        reject(err.message);
                    }
                    if(quesData){
                        quesData.forEach(quesVal => {                        
                            if(quesVal.countVal>=3) {  
                                if(!incValArr.includes(levelVal)){
                                    incValArr.push(levelVal);
                                }                             
                                if(!topicArr.includes(quesVal.syllabus_id)){
                                    topicArr.push(quesVal.syllabus_id);
                                }
                            } else {
                                disbVal = true;
                            }
                        });
                        if(disbVal  || (topicArr.length !== topicIds.length)){
                            // reject("This functionality will be coming soon for this Chapter");
                            resolve(false);
                        } 
                        if(incValArr.length == levelArr.length){
                            resolve(true);
                        }
                    } else {
                        resolve(false);
                        // reject("This functionality will be coming soon for this Chapter");
                    }
                    
                });
            });
            
        });
    }

    let getAttemptedQues = (topicIds, user_id) => {
        return new Promise((resolve, reject)=>{
            topicIds = topicIds.join(',');
            let params;
            let ds = Syllabusquestions.dataSource;
            let sql = `SELECT paqq.question_id
                    FROM post_attempted_quiz_set paqs
                    join post_attempted_quiz_questions paqq on paqs.id = paqq.attempted_set_id
                    join post_quiz_set pqs on paqs.quiz_set_id = pqs.id 
                    join post_quiz_syllabus_details pqsd on pqs.id = pqsd.quiz_set_id
                    where pqsd.topic_id IN(${topicIds}) and paqs.user_id=${user_id}`;
            ds.connector.query(sql, params, function(err, atmptQuesData) {
                if(err){
                    reject(err.message);
                }
                let quesIds = [];
                if(atmptQuesData){
                    atmptQuesData.forEach(quesVal => {                        
                        quesIds.push(quesVal.question_id);
                    });    
                    let questionIds = quesIds.join(',');
                    let quesSql = `SELECT count(*) as quesCount FROM syllabus_questions sq 
                        join questions q on sq.question_id = q.id
                        where sq.syllabus_id IN(${topicIds}) and q.question_type='Post-Test'
                        and q.id NOT IN(${questionIds}) and q.status=1 and sq.status=1`;
                    ds.connector.query(quesSql, params, function(err, quesData) {
                        if(err){
                            reject(err.message);
                        }          
                        if(quesData){
                            if(quesData[0].quesCount<1){
                                quesIds = [];
                            }
                        }
                    });      
                } 
                resolve(quesIds);
            });           
        });
    }

    let getPostTestQuestions = (userId, topicIds, questionIds, attemptedQuestionIds=[]) => {
        return new Promise((resolve, reject) => {            
            topicIds = topicIds.join(',');
            let params;
            let ds = Syllabusquestions.dataSource;
            let cond = ''; 
            let attemptCond ='';
            
            if(questionIds.length>0){
                questionIds = questionIds.join(',');
                cond = cond + ` and q.id IN(${questionIds})`;
            }

            if(attemptedQuestionIds.length>0){
                attemptedQuestionIds = attemptedQuestionIds.join(',');
                attemptCond = attemptCond + ` and q.id NOT IN(${attemptedQuestionIds})`;
            }
           
            let chkSsql = `SELECT count(*) as totalCount FROM syllabus_questions sq 
                            join questions q on sq.question_id = q.id
                            where sq.syllabus_id IN(${topicIds}) and q.question_type='Post-Test'
                            and sq.status=1 and q.status = 1 ${cond} ${attemptCond}
                            order by sq.syllabus_id,FIELD(q.level_id,'2','1','3')`;
                            // console.log(chkSsql);
            ds.connector.query(chkSsql, params, function(err, countData) {
                if(err){
                    console.log('error');
                }
                countData = JSON.stringify(countData);
                countData= JSON.parse(countData);
                if(countData[0].totalCount<3){
                    attemptCond = '';
                }

                let sql = `SELECT q.id, sq.syllabus_id, q.level_id
                            FROM syllabus_questions sq 
                            join questions q on sq.question_id = q.id
                            where sq.syllabus_id IN(${topicIds}) and q.question_type='Post-Test'
                            and sq.status=1 and q.status = 1 ${cond} ${attemptCond}
                            order by sq.syllabus_id,FIELD(q.level_id,'2','1','3')`;
                            //  console.log(sql)
                ds.connector.query(sql, params, function(err, questionData) {
                    if(err){
                        reject(err.message);
                    }
                    let quesIdArr = [];
                    let tempQues = Syllabusquestions.app.models.temp_user_ptest_ques;
                    let quesInc = 0;
                    questionData.forEach((quesVal)=>{
                        quesInc++;
                        let tempData = {
                            syllabus_id: quesVal.syllabus_id,
                            question_id: quesVal.id,
                            level_id: quesVal.level_id,
                            user_id: userId,
                            ques_order: quesInc
                        }
                        tempQues.create(tempData,function(err, quesData){
                            if(err){
                                reject(err.message);
                            }
                        });
                        // quesIdArr.push(quesVal.id);
                    });
                    resolve(true)
                });
            });
        });
    }

    let deleteUserTempQues = (user_id) => {
        return new Promise((resolve, reject) => {
            let tempQues = Syllabusquestions.app.models.temp_user_ptest_ques;
            tempQues.destroyAll({
                user_id: user_id
            }, function(err, tempData){
                if(err){
                    reject(err.message);
                }
                resolve(true);
            });
        });
    }

    let getUserTestQuestions = (user_id) => {
        return new Promise((resolve, reject) => {                      
            let tempQues = Syllabusquestions.app.models.temp_user_ptest_ques;
            tempQues.find({
                where:{
                    user_id: user_id,
                    // syllabus_id: {inq: topicIds}
                },
                order: "ques_order",
                include:[
                    {
                        relation: 'syllabus_questions',
                        scope:{
                            where: {status: 1},
                            fields:['question_id','question','solution','marks','question_type','level_id','id'],
                            include:[
                                {
                                    relation: 'ansoptions',
                                    scope:{
                                        where:{status: 1},
                                        order: 'answer_order',
                                        fields: ['answer','answer_order','id']
                                    }
                                },
                                {
                                    relation: 'rightansoption',
                                    scope: {
                                        where: {status: 1}
                                    }
                                }
                            ]
                        }
                    }
                ]
            },function(err, quesData){
                if(err){
                    reject(err.message);
                } else {
                    // console.log(quesData)
                    resolve(quesData);
                }
                
            });
        });
    }

    // let getPostTestQuestions = (topicIds, questionIds, attemptedQuestionIds=[]) => {
    //     return new Promise((resolve, reject) => {            
    //         topicIds = topicIds.join(',');
    //         let params;
    //         let ds = Syllabusquestions.dataSource;
    //         let cond = ''; 
    //         let attemptCond ='';
            
    //         if(questionIds.length>0){
    //             questionIds = questionIds.join(',');
    //             cond = cond + ` and q.id IN(${questionIds})`;
    //         }

    //         if(attemptedQuestionIds.length>0){
    //             attemptedQuestionIds = attemptedQuestionIds.join(',');
    //             attemptCond = attemptCond + ` and q.id NOT IN(${attemptedQuestionIds})`;
    //         }
           
    //         let chkSsql = `SELECT count(*) as totalCount FROM syllabus_questions sq 
    //                         join questions q on sq.question_id = q.id
    //                         where sq.syllabus_id IN(${topicIds}) and q.question_type='Post-Test'
    //                         and sq.status=1 and q.status = 1 ${cond} ${attemptCond}
    //                         order by sq.syllabus_id,FIELD(q.level_id,'2','1','3')`;
    //                         // console.log(chkSsql);
    //         ds.connector.query(chkSsql, params, function(err, countData) {
    //             if(err){
    //                 console.log('error');
    //             }
    //             countData = JSON.stringify(countData);
    //             countData= JSON.parse(countData);
    //             if(countData[0].totalCount<3){
    //                 attemptCond = '';
    //             }

    //             let sql = `SELECT q.id FROM syllabus_questions sq 
    //                         join questions q on sq.question_id = q.id
    //                         where sq.syllabus_id IN(${topicIds}) and q.question_type='Post-Test'
    //                         and sq.status=1 and q.status = 1 ${cond} ${attemptCond}
    //                         order by sq.syllabus_id,FIELD(q.level_id,'2','1','3')`;
    //                         //  console.log(sql)
    //             ds.connector.query(sql, params, function(err, questionData) {
    //                 if(err){
    //                     reject(err.message);
    //                 }
    //                 let quesIdArr = [];
    //                 questionData.forEach((quesVal)=>{
    //                     quesIdArr.push(quesVal.id);
    //                 });
                    
    //                 // let Questions = Syllabusquestions.app.models.questions;
    //                 Syllabusquestions.find({
    //                     where:{
    //                         id:{inq: quesIdArr},
    //                         status: 1
    //                     },
    //                     include:[
    //                         {
    //                             relation: 'syllabus_questions',
    //                             scope:{
    //                                 where: {status: 1},
    //                                 fields:['question_id','question','solution','marks','question_type','level_id','id'],
    //                                 include:[
    //                                     {
    //                                         relation: 'ansoptions',
    //                                         scope:{
    //                                             where:{status: 1},
    //                                             order: 'answer_order',
    //                                             fields: ['answer','answer_order','id']
    //                                         }
    //                                     },
    //                                     {
    //                                         relation: 'rightansoption',
    //                                         scope: {
    //                                             where: {status: 1}
    //                                         }
    //                                     }
    //                                 ]
    //                             }
    //                         }
    //                     ]
    //                 },function(err, quesData){
    //                     if(err){
    //                         reject(err.message);
    //                     } else {
    //                         resolve(quesData);
    //                     }
    //                 });
    //             });
    //         });
    //     });
    // }

    let getPostTestQuesScience = (topicIds, questionIds, attemptedQuestionIds=[], levelQuesIds=[]) => {
        return new Promise((resolve, reject) => {            
            topicIds = topicIds.join(',');
            let params;
            let ds = Syllabusquestions.dataSource;
            let cond = ''; 
            let attemptCond ='';
            let levelQuesCond = '';
            
            if(questionIds.length>0){
                questionIds = questionIds.join(',');
                cond = cond + ` and q.id IN(${questionIds})`;
            }

            if(attemptedQuestionIds.length>0){
                attemptedQuestionIds = attemptedQuestionIds.join(',');
                attemptCond = attemptCond + ` and q.id NOT IN(${attemptedQuestionIds})`;
            }

            if(levelQuesIds.length>0){
                levelQuesIds = levelQuesIds.join(',');
                levelQuesCond = levelQuesCond + ` and q.id NOT IN(${levelQuesIds})`;
            }
           
            let chkSsql = `SELECT count(*) as totalCount FROM syllabus_questions sq 
                            join questions q on sq.question_id = q.id
                            where sq.syllabus_id IN(${topicIds}) and q.question_type='Post-Test'
                            and sq.status=1 and q.status = 1 ${cond} ${levelQuesCond} ${attemptCond}
                            order by sq.syllabus_id,FIELD(q.level_id,'2','1','3')`;
                            // console.log(chkSsql);
            ds.connector.query(chkSsql, params, function(err, countData) {
                if(err){
                    console.log('error');
                }
                countData = JSON.stringify(countData);
                countData= JSON.parse(countData);
                if(countData[0].totalCount<9){
                    attemptCond = '';
                }

                let sql = `SELECT q.id FROM syllabus_questions sq 
                            join questions q on sq.question_id = q.id
                            where sq.syllabus_id IN(${topicIds}) and q.question_type='Post-Test'
                            and sq.status=1 and q.status = 1 ${cond} ${levelQuesCond} ${attemptCond}
                            order by sq.syllabus_id,FIELD(q.level_id,'2','1','3')`;
                            // console.log("science", sql)
                ds.connector.query(sql, params, function(err, questionData) {
                    if(err){
                        reject(err.message);
                    }
                    let quesIdArr = [];
                    questionData.forEach((quesVal)=>{
                        quesIdArr.push(quesVal.id);
                    });
                    
                    // let Questions = Syllabusquestions.app.models.questions;
                    Syllabusquestions.find({
                        where:{
                            id:{inq: quesIdArr},
                            status: 1
                        },
                        include:[
                            {
                                relation: 'syllabus_questions',
                                scope:{
                                    where: {status: 1},
                                    fields:['question_id','question','solution','marks','question_type','level_id','id'],
                                    include:[
                                        {
                                            relation: 'ansoptions',
                                            scope:{
                                                where:{status: 1},
                                                order: 'answer_order',
                                                fields: ['answer','answer_order','id']
                                            }
                                        },
                                        {
                                            relation: 'rightansoption',
                                            scope: {
                                                where: {status: 1}
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    },function(err, quesData){
                        if(err){
                            reject(err.message);
                        } else {
                            resolve(quesData);
                        }
                    });
                });
            });
        });
    }

    let getQuestLevel1 = (topicIds, questionIds=[])=>{     
        return new Promise((resolve,reject)=>{
            // let topicIdsVal = topicIds.join(',');
            let ds = Syllabusquestions.dataSource;
            let cond = '';
            let params;
            let quesLimit = 3;
            if(questionIds.length>0){
                questionIds = questionIds.join(',');
                cond = cond + ` and q.id NOT IN(${questionIds})`;
            }
            let quesIdArr = [];
            let incVal = 0;
            topicIds.forEach((topicId,index)=>{
                let chkSsql = `SELECT count(*) as totalCount FROM syllabus_questions sq 
                            join questions q on sq.question_id = q.id
                            where sq.syllabus_id IN(${topicId}) and q.question_type='Post-Test'
                            and sq.status=1 and q.status = 1 and q.level_id=1 ${cond}
                            order by RAND() LIMIT ${quesLimit}`;
                            // console.log(chkSsql);
                ds.connector.query(chkSsql, params, function(err, countData) {
                    if(err){
                        console.log('error');
                    }
                    countData = JSON.stringify(countData);
                    countData= JSON.parse(countData);
                    if(countData[0].totalCount<3){
                        cond = '';
                    }
                    let sql = `SELECT q.id, sq.syllabus_id, q.level_id FROM syllabus_questions sq 
                                join questions q on sq.question_id = q.id
                                where sq.syllabus_id IN(${topicId}) and q.question_type='Post-Test'
                                and sq.status=1 and q.status = 1 and q.level_id=1 ${cond}
                                order by RAND() LIMIT ${quesLimit}`;
                                // console.log(sql);
                    ds.connector.query(sql, params, function(err, questionData) {
                        if(err){
                            console.log('error');
                        }
                        incVal++;
                        questionData.forEach((quesVal,quesIndex)=>{
                            quesVal = JSON.stringify(quesVal);
                            let quesId = JSON.parse(quesVal).id;
                            quesIdArr.push(quesId);
                            if(topicIds.length == incVal && questionData.length == (quesIndex+1)){ 
                                // console.log(quesIdArr)       
                                resolve(quesIdArr);    
                            }
                        });
                    });
                });
            });
            
        });        
    }

    let getQuestLevel2 = (topicIds, questionIds=[])=>{     
        return new Promise((resolve,reject)=>{
            // let topicIdsVal = topicIds.join(',');
            let ds = Syllabusquestions.dataSource;
            let cond = '';
            let params;
            let quesLimit = 3;
            if(questionIds.length>0){
                questionIds = questionIds.join(',');
                cond = cond + ` and q.id NOT IN(${questionIds})`;
            }
            let quesIdArr = [];
            let incVal = 0;
            topicIds.forEach((topicId,index)=>{
                let chkSsql = `SELECT count(*) as totalCount FROM syllabus_questions sq 
                            join questions q on sq.question_id = q.id
                            where sq.syllabus_id IN(${topicId}) and q.question_type='Post-Test'
                            and sq.status=1 and q.status = 1 and q.level_id=2 ${cond}
                            order by RAND() LIMIT ${quesLimit}`;
                            // console.log(chkSsql);
                ds.connector.query(chkSsql, params, function(err, countData) {
                    if(err){
                        console.log('error');
                    }
                    countData = JSON.stringify(countData);
                    countData= JSON.parse(countData);
                    if(countData[0].totalCount<3){
                        cond = '';
                    }
                    let sql = `SELECT q.id, sq.syllabus_id, q.level_id FROM syllabus_questions sq 
                                join questions q on sq.question_id = q.id
                                where sq.syllabus_id IN(${topicId}) and q.question_type='Post-Test'
                                and sq.status=1 and q.status = 1 and q.level_id=2 ${cond}
                                order by RAND() LIMIT ${quesLimit}`;
                                // console.log(sql);
                    ds.connector.query(sql, params, function(err, questionData) {
                        if(err){
                            console.log('error');
                        }
                        incVal++;
                        questionData.forEach((quesVal,quesIndex)=>{
                            quesVal = JSON.stringify(quesVal);
                            let quesId = JSON.parse(quesVal).id;
                            quesIdArr.push(quesId);
                            if(topicIds.length == incVal && questionData.length == (quesIndex+1)){ 
                                // console.log(quesIdArr)       
                                resolve(quesIdArr);    
                            }
                        });
                    });
                });
            });
            
        });        
    }

    let getQuestLevel3 = (topicIds, questionIds=[])=>{     
        return new Promise((resolve,reject)=>{
            // let topicIdsVal = topicIds.join(',');
            let ds = Syllabusquestions.dataSource;
            let cond = '';
            let params;
            let quesLimit = 3;
            if(questionIds.length>0){
                questionIds = questionIds.join(',');
                cond = cond + ` and q.id NOT IN(${questionIds})`;
            }
            let quesIdArr = [];
            let incVal = 0;
            topicIds.forEach((topicId,index)=>{
                let chkSsql = `SELECT count(*) as totalCount FROM syllabus_questions sq 
                            join questions q on sq.question_id = q.id
                            where sq.syllabus_id IN(${topicId}) and q.question_type='Post-Test'
                            and sq.status=1 and q.status = 1 and q.level_id=3 ${cond}
                            order by RAND() LIMIT ${quesLimit}`;
                            // console.log(chkSsql);
                ds.connector.query(chkSsql, params, function(err, countData) {
                    if(err){
                        console.log('error');
                    }
                    countData = JSON.stringify(countData);
                    countData= JSON.parse(countData);
                    if(countData[0].totalCount<3){
                        cond = '';
                    }
                    let sql = `SELECT q.id, sq.syllabus_id, q.level_id FROM syllabus_questions sq 
                                join questions q on sq.question_id = q.id
                                where sq.syllabus_id IN(${topicId}) and q.question_type='Post-Test'
                                and sq.status=1 and q.status = 1 and q.level_id=3 ${cond}
                                order by RAND() LIMIT ${quesLimit}`;
                                // console.log(sql);
                    ds.connector.query(sql, params, function(err, questionData) {
                        if(err){
                            console.log('error');
                        }
                        incVal++;
                        questionData.forEach((quesVal,quesIndex)=>{
                            quesVal = JSON.stringify(quesVal);
                            let quesId = JSON.parse(quesVal).id;
                            quesIdArr.push(quesId);
                            if(topicIds.length == incVal && questionData.length == (quesIndex+1)){ 
                                // console.log(quesIdArr)       
                                resolve(quesIdArr);    
                            }
                        });
                    });
                });
            });
            
        });        
    }

    let getQuestLevel = (topicIds, level_id, questionIds=[])=>{     
        return new Promise((resolve,reject)=>{
            // let topicIdsVal = topicIds.join(',');
            let ds = Syllabusquestions.dataSource;
            let cond = '';
            let params;
            let quesLimit = 3;
            if(questionIds.length>0){
                questionIds = questionIds.join(',');
                cond = cond + ` and q.id NOT IN(${questionIds})`;
            }
            
            let quesIdArr = [];
            let incVal = 0;
            topicIds.forEach((topicId,index)=>{
                let chkSsql = `SELECT count(*) as totalCount FROM syllabus_questions sq 
                            join questions q on sq.question_id = q.id
                            where sq.syllabus_id IN(${topicId}) and q.question_type='Post-Test'
                            and sq.status=1 and q.status = 1 and q.level_id=${level_id} ${cond}
                            order by RAND() LIMIT ${quesLimit}`;
                            // console.log(chkSsql);
                ds.connector.query(chkSsql, params, function(err, countData) {
                    if(err){
                        console.log('error');
                    }
                    countData = JSON.stringify(countData);
                    countData= JSON.parse(countData);
                    if(countData[0].totalCount<3){
                        cond = '';
                    }
                    let sql = `SELECT q.id, sq.syllabus_id, q.level_id FROM syllabus_questions sq 
                                join questions q on sq.question_id = q.id
                                where sq.syllabus_id IN(${topicId}) and q.question_type='Post-Test'
                                and sq.status=1 and q.status = 1 and q.level_id=${level_id} ${cond}
                                order by RAND() LIMIT ${quesLimit}`;
                                // console.log(sql);
                    ds.connector.query(sql, params, function(err, questionData) {
                        if(err){
                            console.log('error');
                        }
                        incVal++;
                        questionData.forEach((quesVal,quesIndex)=>{
                            quesVal = JSON.stringify(quesVal);
                            let quesId = JSON.parse(quesVal).id;
                            quesIdArr.push(quesId);
                            if(topicIds.length == incVal && questionData.length == (quesIndex+1)){ 
                                // console.log(quesIdArr)       
                                resolve(quesIdArr);    
                            }
                        });
                    });
                });
            });
            
        });        
    }

    let getTopicLevelQues = (topicIds, level_id, questionIds=[], levelQuesIds=[])=>{     
        return new Promise((resolve,reject)=>{
            // let topicIdsVal = topicIds.join(',');
            let ds = Syllabusquestions.dataSource;
            let cond = '';            
            let levelQuesCond = '';
            let params;
            let quesLimit = 3;
            if(questionIds.length>0){
                questionIds = questionIds.join(',');
                cond = cond + ` and q.id NOT IN(${questionIds})`;
            }

            if(levelQuesIds.length>0){
                levelQuesIds = levelQuesIds.join(',');
                levelQuesCond = levelQuesCond + ` and q.id NOT IN(${levelQuesIds})`;
            }
            let quesIdArr = [];
            let incVal = 0;
            topicIds = topicIds.join(',');

            let chkSsql = `SELECT count(*) as totalCount FROM syllabus_questions sq 
                        join questions q on sq.question_id = q.id
                        where sq.syllabus_id IN(${topicIds}) and q.question_type='Post-Test'
                        and sq.status=1 and q.status = 1 and q.level_id=${level_id} ${cond}
                        ${levelQuesCond}
                        order by RAND() LIMIT ${quesLimit}`;
                        
            ds.connector.query(chkSsql, params, function(err, countData) {
                if(err){
                    console.log('error');
                }
                countData = JSON.stringify(countData);
                countData= JSON.parse(countData);
                if(countData[0].totalCount<3){
                    cond = '';
                }
                let sql = `SELECT q.id, sq.syllabus_id, q.level_id FROM syllabus_questions sq 
                            join questions q on sq.question_id = q.id
                            where sq.syllabus_id IN(${topicIds}) and q.question_type='Post-Test'
                            and sq.status=1 and q.status = 1 and q.level_id=${level_id} ${cond}
                            ${levelQuesCond}
                            order by RAND() LIMIT ${quesLimit}`;
                            
                ds.connector.query(sql, params, function(err, questionData) {
                    if(err){
                        console.log('error');
                    }
                    incVal++;
                    // console.log(questionData)
                    questionData.forEach((quesVal,quesIndex)=>{
                        quesVal = JSON.stringify(quesVal);
                        let quesId = JSON.parse(quesVal).id;
                        quesIdArr.push(quesId);
                        if(questionData.length == (quesIndex+1)){ 
                            // console.log(quesIdArr)       
                            resolve(quesIdArr);    
                        }
                    });
                });
            });
            
        });        
    }

    let getSubject = (subject_id) => {
        return new Promise((resolve, reject) => {
            let Subject = Syllabusquestions.app.models.subjects;

            Subject.findOne({where: {id: subject_id}}, function(err, subData){
                if(err){
                    reject(err.message);
                }
                if(subData){
                    resolve(subData);
                } else {
                    reject('No subject found.');
                }
            });
        });
    }

    let getQuesIds = (quesIdsArr) => {
        return new Promise((resolve, reject)=>{
            let quesIdsVal = [];
            quesIdsArr.forEach((quesIds)=>{
                quesIds.forEach((quesId)=>{
                    quesIdsVal.push(quesId);
                });
            })
        });
    }
};
