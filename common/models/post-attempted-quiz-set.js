'use strict';

module.exports = function (Attemptedquizset) {
    Attemptedquizset.createQuizSet = function (data, cb) {

        let msg;
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);
        let total_attempted = (data.total_attempted == undefined || data.total_attempted == null || data.total_attempted == '' ? undefined : data.total_attempted);
        let total_correct = (data.total_correct == undefined || data.total_correct == null || data.total_correct == '' ? undefined : data.total_correct);
        let total_incorrect = (data.total_incorrect == undefined || data.total_incorrect == null || data.total_incorrect == '' ? undefined : data.total_incorrect);
        let total_skipped = (data.total_skipped == undefined || data.total_skipped == null || data.total_skipped == '' ? undefined : data.total_skipped);
        let time_spent = (data.time_spent == undefined || data.time_spent == null || data.time_spent == '' ? undefined : data.time_spent);
        let questions = (data.questions == undefined || data.questions == null || data.questions == '' || data.questions.length < 1 ? undefined : data.questions);
        let quiz_type = (data.quiz_type == undefined || data.quiz_type == null || data.quiz_type == '' ? 'post' : data.quiz_type);

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide user id." };
            return cb(null, msg);
        }

        if (quiz_set_id == undefined) {
            msg = { status: false, message: "Please provide quiz set id." };
            return cb(null, msg);
        }

        if (questions == undefined) {
            msg = { status: false, message: "Please provide questions." };
            return cb(null, msg);
        }

        Attemptedquizset.count({ quiz_set_id: quiz_set_id, user_id: user_id }, async function (err, countData) {
            if (err) {
                console.log(err);
                msg = { status: false, message: "Error! Please try again." };
                return cb(null, msg);
            }

            if (countData < 1) {

                let quizSetData = { quiz_type: quiz_type, user_id: user_id, quiz_set_id: quiz_set_id, total_attempted: total_attempted, total_correct: total_correct, total_incorrect: total_incorrect, total_skipped: total_skipped, time_spent: time_spent };

                Attemptedquizset.upsertWithWhere({ user_id: user_id, quiz_set_id: quiz_set_id }, quizSetData, async function (err, result) {
                    if (err) {
                        console.log(err);
                        msg = { status: false, message: "Error! Please try again." };
                        return cb(null, msg);
                    }
                    let quizQCreate = await quizQuesCreate(result.id, questions)

                    msg = { status: true, message: "Quiz set submitted successfully." };
                    return cb(null, msg);
                });
            } else {
                msg = { status: false, message: "Quiz set already exists." };
                return cb(null, msg);
            }
        });

    }

    Attemptedquizset.remoteMethod(
        'createQuizSet',
        {
            http: { path: '/create', verb: 'post' },
            description: 'Create Attempted Quiz Set',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let quizQuesCreate = (attempted_set_id, questions) => {
        return new Promise((resolve, reject) => {
            let quizQuestion = Attemptedquizset.app.models.post_attempted_quiz_questions;
            let quesOrder = 0;
            questions.forEach((quesVal) => {
                quesOrder++;
                let quesData = { 
                    attempted_set_id: attempted_set_id, 
                    question_id: quesVal.question_id, 
                    answer_id: quesVal.answer_id, 
                    attempt_status: quesVal.attempt_status,
                    ques_order: quesOrder
                };
                // console.log(quesData)
                quizQuestion.findOrCreate({ where: { attempted_set_id: attempted_set_id, question_id: quesVal.question_id } }, quesData, function (err, quesResult) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    // console.log(quesResult);
                    resolve(quesResult);
                });
            });
        });
    }

    Attemptedquizset.getAttemptedQuizSets = function (user_id, data, cb) {
        let msg = {};
        let limit = (data == undefined || data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data == undefined || data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let school_id = (data == undefined || data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);

        // if(school_id == undefined){
        //     msg = {status:false,message:"Please provide school id"};
        //     return cb(null, msg);
        // }

        Attemptedquizset.find({
            where: {
                and:
                    [
                        { user_id: user_id }
                    ]
            },
            limit: limit,
            skip: offset,
            include: [
                {
                    relation: "attempted_quiz_sets",
                    scope: {
                        fields: ["set_name", "quiz_syllabus_path", "num_ques", "duration"],
                        include: [
                            {
                                relation: "quiz_schools",
                                scope: {
                                    where: {
                                        school_id: school_id
                                    }
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
            result
            msg = { status: true, data: result, currentDate: new Date() };
            return cb(null, msg);
        });
    }

    Attemptedquizset.remoteMethod(
        'getAttemptedQuizSets',
        {
            http: { path: '/getattemptedquizsets', verb: 'post' },
            description: 'Get attempted quiz sets',
            accepts: [{ arg: 'user_id', type: 'number', required: true },
            { arg: 'data', type: 'object' }],
            returns: { root: true, type: 'json' }
        }
    );


    Attemptedquizset.getActiveQuizSetDetails = function (attempted_set_id, cb) {
        let msg = {};
        //let set_id = (data.set_id==undefined || data.set_id==null || data.set_id==''?undefined:data.set_id);
        if (attempted_set_id == undefined) {
            msg = { status: false, message: "Please provide set id" };
            return cb(null, msg);
        }
        Attemptedquizset.findOne({
            where: {
                and:
                    [
                        { id: attempted_set_id }
                    ]
            },
            include: [

                {
                    relation: "attempted_quiz_questions",
                    scope: {
                        order: 'question_id',
                        fields: ["attempt_status", "question_id", "answer_id"],
                        include: [
                            {
                                relation: "attempted_quiz_answer",
                                scope: {
                                    fields: ["id", "answer"]
                                }
                            },
                            {
                                relation: "attempted_quiz_question",
                                scope: {
                                    include: [
                                        {
                                            relation: "ansoptions",
                                            scope: {
                                                fields: ["id", "answer"],
                                                where: { status: 1 }
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
                                                            fields: ["id", "answer"]
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
        });
    }

    Attemptedquizset.remoteMethod(
        'getActiveQuizSetDetails',
        {
            http: { path: '/getquizsetdetails', verb: 'post' },
            description: 'Get attempted quiz set details',
            accepts: [{ arg: 'attempted_set_id', type: 'number', required: true }],
            returns: { root: true, type: 'json' }
        }
    );

    Attemptedquizset.getQuizSetsData = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);

        Attemptedquizset.find({
            where: {
                and:
                    [
                        { user_id: user_id },
                        { quiz_set_id: quiz_set_id }
                    ]
            },
            include: [
                {
                    relation: "attempted_quiz_sets",
                    scope: {
                        fields: ["set_name", "quiz_syllabus_path", "num_ques", "duration"]
                    }
                },
                {
                    relation: "quiz_users",
                    scope: {
                        where: {
                            status: 1
                        },
                        fields: ["firstName", "lastName"]
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
        });
    }

    Attemptedquizset.remoteMethod(
        'getQuizSetsData',
        {
            http: { path: '/getquizsetsdata', verb: 'post' },
            description: 'Get quiz sets user-wise details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Attemptedquizset.getFilteredQuizData = function (data, cb) {
        let msg = {};
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);
        var ds = Attemptedquizset.dataSource;
        let cond = '';
        let params;

        if (quiz_set_id == undefined) {
            msg.status = false;
            msg.message = "Please provide quizset id.";
            return cb(null, msg);
        }

        if (class_id !== undefined) {
            cond = cond + " and ud.class_id IN(" + class_id.join() + ")";
        }

        if (section_id !== undefined) {
            cond = cond + " and ud.section_id IN(" + section_id.join() + ")";
        }

        var sql = `SELECT aqs.*, 
        c.class_name, s.section_name, qs.set_name,
        CONCAT(qu.firstName," ",qu.lastName) as userName,
        (aqs.total_correct/(aqs.total_correct+aqs.total_incorrect+aqs.total_skipped))*100 as percentage
        FROM post_attempted_quiz_set aqs 
        join post_quiz_set qs on aqs.quiz_set_id = qs.id
        join quiz_user qu ON qu.id = aqs.user_id
        join user_data ud on qu.email = ud.email
        join classes c on ud.class_id = c.id
        join class_sections cs on ud.section_id = cs.id
        join sections s on cs.section_id = s.id
        where aqs.quiz_set_id =  ${quiz_set_id}  ${cond}`
        //console.log(sql);

        ds.connector.query(sql, params, function (err, quizData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            cb(null, quizData);
        });
    }

    Attemptedquizset.remoteMethod(
        'getFilteredQuizData',
        {
            http: { path: '/getFilteredQuizData', verb: 'post' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Attemptedquizset.getActiveQuizSetQues = async function (data, cb) {
        try {
            let msg = {};
            let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);
            let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
            let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
            if (quiz_set_id == undefined) {
                msg = { status: false, message: "Please provide set id" };
                return cb(null, msg);
            }
            let userDetail = await attemptUsersDetail(quiz_set_id, class_id, section_id);   // find all the users detail attempt Quizset
            let user_id = [];
            await userDetail.forEach(userId => { user_id.push(userId.user_id) });
            let attemptQuizDetail = await attemptQuizDetails(quiz_set_id, user_id);
            return attemptQuizDetail;
        } catch (error) {
            return cb(null, error);
        }

    }


    Attemptedquizset.remoteMethod(
        'getActiveQuizSetQues',
        {
            http: { path: '/getquizsetques', verb: 'post' },
            description: 'Get attempted quiz set details',
            accepts: [{ arg: 'data', type: 'object', required: true, http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    let attemptUsersDetail = (quiz_set_id, class_id, section_id) => {
        return new Promise((resolve, reject) => {
            var ds = Attemptedquizset.dataSource;
            let cond = '';
            let params;

            if (class_id !== undefined) {
                cond = cond + " and ud.class_id IN(" + class_id.join() + ")";
            }

            if (section_id !== undefined) {
                cond = cond + " and ud.section_id IN(" + section_id.join() + ")";
            }

            var sql = `SELECT aqs.user_id FROM post_attempted_quiz_set aqs 
            join post_attempted_quiz_questions aqq on aqs.id = aqq.attempted_set_id
            join quiz_user qu ON qu.id = aqs.user_id
            join user_data ud on qu.email = ud.email
            where aqs.quiz_set_id = ${quiz_set_id} ${cond} group by aqs.user_id`;

            ds.connector.query(sql, params, function (err, quizUserData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    reject(msg);
                }
                resolve(quizUserData);
            });
        });
    }

    let attemptQuizDetails = (quiz_set_id, user_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            Attemptedquizset.find({
                where: {
                    and:
                        [
                            { quiz_set_id: quiz_set_id },
                            { user_id: { inq: user_id } }
                        ]
                },
                include: [
                    {
                        relation: "attempted_quiz_questions",
                        scope: {
                            order: 'question_id',
                            fields: ["attempt_status", "question_id", "answer_id"],
                            include: [
                                {
                                    relation: "attempted_quiz_answer",
                                    scope: {
                                        fields: ["id", "answer"]
                                    }
                                },
                                {
                                    relation: "attempted_quiz_question",
                                    scope: {
                                        include: [
                                            {
                                                relation: "ansoptions",
                                                scope: {
                                                    fields: ["id", "answer"],
                                                    where: { status: 1 }
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
                                                                fields: ["id", "answer"]
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
                    }
                ]
            }, function (err, result) {
                if (err) {
                    reject(err)
                }
                if (user_id.length < 1) {
                    result = {};
                }
                msg = { status: true, data: result };
                resolve(msg);
            });
        });
    }


    Attemptedquizset.getQuizDataReport = async function (data, cb) {
        let msg = {};
        // console.log(data);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let chart_type = (data.chart_type == undefined || data.chart_type == null || data.chart_type == '' ? undefined : data.chart_type);
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);
        let student_id = (data.student_id == undefined || data.student_id == null || data.student_id == '' ? undefined : data.student_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);


        let quizReport = await getQuizReport(user_id, school_id, class_id, section_id, chart_type, quiz_set_id, student_id, topic_id);
        return quizReport;

    }


    let getQuizReport = (user_id, school_id, class_id, section_id, chart_type, quiz_set_id, student_id, topic_id) => {
        return new Promise((resolve, reject) => {

            let cond = '';
            let joinCond = '';
            let groupByCond = ' ';
            // console.log("schoolID",school_id, "classId", class_id);

            if (school_id != undefined) {

                cond = cond + " and ud.school_id = " + school_id;
            }
            if (class_id != undefined) {

                cond = cond + " and ud.class_id = " + class_id;
            }
            if (section_id != undefined) {

                cond = cond + " and ud.section_id = " + section_id;
            }
            if (quiz_set_id != undefined) {
                cond = cond + " and qs.id = " + quiz_set_id;
            }

            if (student_id != undefined) {
                cond = cond + " and qu.id = " + student_id;
                groupByCond = " group by aqs.id";
            } else {
                groupByCond = " group by qu.id";
            }

            if (topic_id != undefined) {
                joinCond = joinCond + " JOIN quiz_syllabus_details qsyb on qs.id = qsyb.quiz_set_id";
                cond = cond + " and qsyb.topic_id = " + topic_id;
            }

            if (chart_type == 'quizDash') {
                groupByCond = groupByCond + ", qs.id"
            }
            let getSqlData = findSqlData(joinCond, cond, groupByCond);
            resolve(getSqlData);
        });
    }

    let findSqlData = (joinCond, cond, groupByCond) => {
        return new Promise((resolve, reject) => {

            var ds = Attemptedquizset.dataSource;
            let params;
            let msg = {};

            var sql = `SELECT aqs.id as attempt_id,aqs.user_id, aqs.quiz_set_id, qu.id,
            sum(aqs.total_attempted) as total_attempted,
            sum(aqs.total_correct) as total_correct, 
            sum(aqs.total_incorrect) as total_incorrect, 
            sum(aqs.total_skipped) as total_skipped, 
            aqs.time_spent, aqs.attempted_on,
            sc.school_name, c.class_name, s.section_name, qs.set_name,
            (SUM(total_correct)/(SUM(total_correct)+SUM(total_incorrect)+SUM(total_skipped)))*100 as percentage
            FROM post_attempted_quiz_set aqs
            join post_quiz_set qs on aqs.quiz_set_id = qs.id
            join quiz_user qu ON qu.id = aqs.user_id
            join user_data ud on qu.email = ud.email
            join schools sc on ud.school_id = sc.id
            join classes c on ud.class_id = c.id
            join class_sections cs on ud.section_id = cs.id
            join sections s on cs.section_id = s.id ${joinCond}
            where 1=1 and qs.status = 1 and qu.status = 1
            and sc.status = 1 and c.status = 1 and cs.status =1 and s.status = 1
             ${cond} ${groupByCond}`
            //  console.log(sql);
            ds.connector.query(sql, params, function (err, quizData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    reject(msg);
                }
                // console.log(quizData);
                resolve(quizData);
            });
        })
    }


    Attemptedquizset.remoteMethod(
        'getQuizDataReport',
        {
            http: { path: '/getQuizDataReport', verb: 'post' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Attemptedquizset.getTopicReport = function (data, cb) {
        let msg = {};
        // console.log(data);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);
        let student_id = (data.student_id == undefined || data.student_id == null || data.student_id == '' ? undefined : data.student_id);
        let studentCond = '';

        if(student_id != undefined){
            studentCond = " and aqs.user_id = " + student_id;
        }

        var ds = Attemptedquizset.dataSource;
        let params;

        var countSql = `select aqq.question_id from  post_attempted_quiz_set aqs 
        join post_attempted_quiz_questions aqq on aqs.id = aqq.attempted_set_id 
        join syllabus_questions sq on aqq.question_id = sq.question_id
        where  aqs.quiz_set_id = ${quiz_set_id} and sq.syllabus_id = ${topic_id} ${studentCond}
        group by aqq.question_id`;

        var totalSql = `select aqq.id
                from post_quiz_set qs join quiz_set_schools qss on qs.id = qss.quiz_set_id 
                join post_attempted_quiz_set aqs on qs.id = aqs.quiz_set_id 
                join quiz_user qu on aqs.user_id = qu.id 
                join user_data ud on ud.email = qu.email 
                join post_attempted_quiz_questions aqq on aqs.id = aqq.attempted_set_id 
                join syllabus_questions sq on sq.question_id = aqq.question_id 
                where qss.school_id = ${school_id} and ud.class_id = ${class_id} 
                and ud.section_id = ${section_id} and qs.id = ${quiz_set_id} 
                and sq.syllabus_id = ${topic_id} ${studentCond}`;

        ds.connector.query(countSql, params, function (err, countData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                reject(msg)
            }
            // console.log(countData);
            ds.connector.query(totalSql, params, function (err, quizCountData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return (null, msg)
                }

                let quizCountVal = 0;
                if (quizCountData.length > 0) {
                    quizCountVal = quizCountData.length;
                }

                var sql = `select aqs.attempt_status, ROUND(((count(*)/${quizCountVal})*100),2) as attempt_count
                from post_quiz_set qs join quiz_set_schools qss on qs.id = qss.quiz_set_id 
                join post_attempted_quiz_set aqs on qs.id = aqs.quiz_set_id 
                join quiz_user qu on aqs.user_id = qu.id 
                join user_data ud on ud.email = qu.email 
                join post_attempted_quiz_questions aqq on aqs.id = aqq.attempted_set_id 
                join syllabus_questions sq on sq.question_id = aqq.question_id 
                where qss.school_id = ${school_id} and ud.class_id = ${class_id} 
                and ud.section_id = ${section_id} and qs.id = ${quiz_set_id} 
                and sq.syllabus_id = ${topic_id} ${studentCond}
                group by aqq.attempt_status`;

                ds.connector.query(sql, params, function (err, quizData) {
                    if (err) {
                        console.log(err);
                        msg.status = false;
                        msg.message = "Invalid Data";
                        return (null, msg)
                    }
                    let countVal = 0;
                    if (countData.length > 0) {
                        countVal = countData.length;
                    }
                    let contentData = {};
                    contentData.status = true;
                    contentData.total_question = countVal;
                    contentData.data = quizData;
                    // console.log("contentData", contentData);
                    cb(null, contentData);
                });
            });
        });
    }

    Attemptedquizset.remoteMethod(
        'getTopicReport',
        {
            http: { path: '/getTopicReport', verb: 'post' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Attemptedquizset.getAttemptUserList = function (data, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        var ds = Attemptedquizset.dataSource;
        let cond = '';
        let params;

        var sql = `SELECT aqs.*, ud.studentName, count(*) as total_quiz_attempt,
        sum(aqs.total_attempted) as total_attempted, 
        sum(aqs.total_correct) as total_correct, 
        sum(aqs.total_incorrect) as total_incorrect, 
        sum(aqs.total_skipped) as total_skipped,
        (SUM(total_correct)/(SUM(total_correct)+SUM(total_incorrect)+SUM(total_skipped)))*100 as percentage
        FROM post_attempted_quiz_set aqs
        join quiz_user qu ON qu.id = aqs.user_id 
        join user_data ud on qu.email = ud.email 
        where ud.school_id = ${school_id} and ud.class_id = ${class_id}
        and ud.section_id= ${section_id} 
        group by aqs.user_id`

        // console.log(sql);

        ds.connector.query(sql, params, function (err, quizData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            cb(null, quizData);
        });
    }

    Attemptedquizset.remoteMethod(
        'getAttemptUserList',
        {
            http: { path: '/getAttemptUserList', verb: 'post' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Attemptedquizset.getActiveQuizSets = async function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let set_id = (data.set_id == undefined || data.set_id == null || data.set_id == '' ? undefined : data.set_id);
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '' ? undefined : data.board_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);
        let limit = (data == undefined || data.limit == undefined || data.limit == null || data.limit == '' ? 5 : data.limit);
        let offset = (data == undefined || data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        try{
            if (user_id == undefined) {
                msg.status = false;
                msg.message = "Please provide user id.";
                return msg;
            }
    
            if (lesson_id == undefined) {
                msg.status = false;
                msg.message = "Please provide lesson id.";
                return msg;
            }
            let quizSetsId = await userQuiz(lesson_id, user_id);
            let userQuizs = await quizSets(quizSetsId, board_id, class_id, subject_id);
            return userQuizs;
        } catch(error){
            //console.log(error)
            msg.status = false;
            msg.message = "Error! Please try again.";
            return msg;
        }
        
    }

    Attemptedquizset.remoteMethod(
        'getActiveQuizSets',
        {
            http: { path: '/getquizsets', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Attemptedquizset.getAttemptedPostTest = async function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let set_id = (data.set_id == undefined || data.set_id == null || data.set_id == '' ? undefined : data.set_id);
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '' ? undefined : data.board_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);
        let limit = (data == undefined || data.limit == undefined || data.limit == null || data.limit == '' ? 5 : data.limit);
        let offset = (data == undefined || data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        try{
            if (user_id == undefined) {
                msg.status = false;
                msg.message = "Please provide user id.";
                return msg;
            }
    
            if (lesson_id == undefined) {
                msg.status = false;
                msg.message = "Please provide lesson id.";
                return msg;
            }

            let quizSetsId = await userQuiz(lesson_id, user_id);
            let postTests = await getPostTests(quizSetsId, user_id);
            return postTests;
        } catch(error){
            msg.status = false;
            msg.message = error;
            return msg;
        }
        
    }

    Attemptedquizset.remoteMethod(
        'getAttemptedPostTest',
        {
            http: { path: '/getmytests', verb: 'post' },
            description: 'Get attempted post tests',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let userQuiz = (lesson_id, user_id) => {
        return new Promise((resolve, reject) => {
            let Quizsyllabusdetails = Attemptedquizset.app.models.post_quiz_syllabus_details;
            let msg = {};
            Quizsyllabusdetails.find({
                where: { lesson_id: lesson_id }
            }, function (err, result) {
                if (err) {
                    reject(err);
                }
                let quizLessons = [];
                let response = JSON.parse(JSON.stringify(result));
                response.forEach(element => {
                    quizLessons.push(element.quiz_set_id);
                });
                quizLessons = quizLessons.filter((v, i, a) => a.indexOf(v) === i);
                // resolve(quizSetId);

                Attemptedquizset.find({
                    where: { user_id: user_id },
                    order: 'id DESC',
                }, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    let quizUsers = [];
                    let response = JSON.parse(JSON.stringify(result));
                    response.forEach(element => {
                        quizUsers.push(element.quiz_set_id);
                    });
                    quizUsers = quizUsers.filter((v, i, a) => a.indexOf(v) === i);
                    // resolve(quizSetId);
                    let quizSetsId = [];
                    quizUsers.forEach(ql => {
                        quizLessons.forEach(qu => {
                            if (ql == qu && quizSetsId.length < 5) {
                                quizSetsId.push(ql);
                            }
                        });
                    });
                    resolve(quizSetsId);
                })
            })

        });
    }

    let lessonTopic = (lesson_id) => {
        return new Promise((resolve, reject) => {
            let Quizsyllabusdetails = Attemptedquizset.app.models.post_quiz_syllabus_details;
            let msg = {};
            let topicId = [];
            Quizsyllabusdetails.find({ where: { lesson_id: lesson_id } }, function (err, result) {
                if (err) {
                    reject(err);
                }
                result = JSON.parse(JSON.stringify(result));
                result.forEach(element => { topicId.push(element.topic_id); });
                topicId = topicId.filter((v, i, a) => a.indexOf(v) === i);
                resolve(topicId);
            });
        });
    }

    let quizQues = (quizSetsId, topicIds, lesson_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            var ds = Attemptedquizset.dataSource;
            let params;
            var sql =`SELECT aqs.quiz_set_id, qsd.topic_id, qsd.lesson_id, aqq.question_id, aqq.answer_id, aqq.attempt_status
            FROM post_attempted_quiz_set aqs
            join post_quiz_syllabus_details qsd on aqs.quiz_set_id = qsd.quiz_set_id      
            join syllabus_questions sq on qsd.topic_id = sq.syllabus_id
            join post_attempted_quiz_questions aqq on aqq.attempted_set_id = aqs.id and aqq.question_id = sq.question_id
            where sq.syllabus_id IN (${topicIds}) and aqs.quiz_set_id IN (${quizSetsId})`
           
            // console.log(sql);
            ds.connector.query(sql, params, function (err, result) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    reject(msg);
                }
                msg = {status: true, data: result}
                resolve(msg);
            });
        });
    }

    let quizSets = (quizSetsId, board_id, class_id, subject_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Quizsyllabusdetails = Attemptedquizset.app.models.post_quiz_syllabus_details;
            Quizsyllabusdetails.find({
                fields: ["id", "quiz_set_id", "lesson_id", "topic_id"],
                where: {
                    quiz_set_id: { inq: quizSetsId },
                    board_id: board_id,
                    class_id: class_id,
                    subject_id: subject_id
                },
                include: [
                    {
                        relation: "quiz_syllabus",
                        scope: {
                            fields: ["id"],
                            where: { status: 1 },
                            include: [
                                {
                                    relation: "attemptQuizSet",
                                    scope: {
                                        fields: ["id", "user_id", "quiz_set_id", "quiz_type"],
                                        where: { status: 1 },
                                        include: [
                                            {
                                                relation: "attempted_quiz_questions",
                                                scope: {
                                                    fields: ["question_id", "answer_id", "attempt_status"],
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
                    reject(err);
                }
                msg = { status: true, data: result };
                resolve(msg);
            })
        });
    }

    let getPostTests = (quizSetsId, userId) => {
        return new Promise((resolve, reject) => {
            let msg = {};

            Attemptedquizset.find({
                where: {
                    user_id: userId,
                    quiz_set_id: {inq: quizSetsId}
                },
                order: "id desc"
            }, function(err, result){
                if(err){
                    reject(err.message);
                }
                msg.status = true;
                msg.data = result;
                msg.total_count = quizSetsId.length;
                resolve(msg);
            });
        });
    }

    Attemptedquizset.getTopicWiseResult = function (data, cb) {
        let msg = {};
        let attempted_set_id = (data.attempted_set_id == undefined || data.attempted_set_id == null || data.attempted_set_id == '' ? undefined : data.attempted_set_id);

        if(attempted_set_id == undefined){
            msg.status = false;
            msg.message = "Please provide attempted set id.";
            return cb(null, msg);
        }
        
        var ds = Attemptedquizset.dataSource;
        let cond = '';
        let params;

        var sql = `select attempted_set_id, quiz_set_id, syllabus_id, topic_name, 
                    MAX(CASE WHEN attempt_status=1 THEN countVal ELSE 0 END) AS total_correct, 
                    MAX(CASE WHEN attempt_status=2 THEN countVal ELSE 0 END) AS total_incorrect, 
                    MAX(CASE WHEN attempt_status=0 THEN countVal ELSE 0 END) AS total_skipped 
                    from 
                        (SELECT paqq.attempted_set_id, paqs.quiz_set_id, t.topic_name, sq.syllabus_id, attempt_status,count(*) countVal 
                            FROM post_attempted_quiz_set paqs 
                            join post_attempted_quiz_questions paqq on paqs.id = paqq.attempted_set_id
                            join syllabus_questions sq on sq.question_id = paqq.question_id 
                            join topics t on t.id = sq.syllabus_id
                            where paqq.attempted_set_id = ${attempted_set_id} 
                            group by paqq.attempt_status,sq.syllabus_id 
                            order by syllabus_id
                        ) q group by syllabus_id`;

        // console.log(sql);

        ds.connector.query(sql, params, function (err, quizData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            } else {
                msg.status = true;
                msg.data = quizData;
                return cb(null, msg);
            }            
        });
    }

    Attemptedquizset.remoteMethod(
        'getTopicWiseResult',
        {
            http: { path: '/getTopicWiseResult', verb: 'post' },
            description: 'Get topic wise result of a test',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Attemptedquizset.getStudentPostReport = function (data, cb) {
        let msg = {};
        let cond = {};
        let student_id = (data.student_id == undefined || data.student_id == null || data.student_id == '' ? undefined : data.student_id);
        let from_date = (data.from_date == undefined || data.from_date == null || data.from_date == '' ? undefined : data.from_date);
        let to_date = (data.to_date == undefined || data.to_date == null || data.to_date == '' ? undefined : data.to_date);

        if (student_id == undefined) {
            msg = { status: false, message: "Please provide student id." };
            return cb(null, msg);
        }

        if (from_date !== undefined) {
            let frmDate = dateFormatter(from_date);
            frmDate = new Date(from_date);
            from_date = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
        }

        if (to_date !== undefined) {
            let tDate = dateFormatter(to_date);
            tDate = new Date(to_date);
            let month = tDate.getMonth() + 1;
            to_date = tDate.getFullYear() + "-" + month + "-" + tDate.getDate() + " 23:59:59";
        }
        cond = { user_id: student_id };
        if (from_date != undefined && to_date != undefined) {
            cond.attempted_on = { between: [from_date, to_date] };
        } else if (from_date == undefined && to_date != undefined) {
            cond.attempted_on = { lte: to_date };
        } else if (from_date != undefined && to_date == undefined) {
            cond.attempted_on = { gte: from_date };
        }

        Attemptedquizset.find({ 
            where: cond,
            include: [
                {
                    relation: "attempted_quiz_sets",
                    scope: {
                        fields: ["set_name"]
                    }
                }
            ]
        }, function (err, attemptedQuiz) {
            if (err) { return cb(null, msg); }
            let Quizuser = Attemptedquizset.app.models.quiz_user;
            Quizuser.findOne({where: {id: student_id}}, function(err, userData){
                if (err) { return cb(null, err); }
                msg = { status: true, attemptedQuiz: attemptedQuiz, userData: userData}
                return cb(null, msg);
            })
        })
    }

    Attemptedquizset.remoteMethod(
        'getStudentPostReport',
        {
            http: { path: '/getStudentPostReport', verb: 'post' },
            description: 'Get studnet post quiz sets report',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let dateFormatter = (dt) => {
        var options = {
            timeZone: "Asia/Kolkata",
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        };

        var formatter = new Intl.DateTimeFormat([], options);
        var dateTime = formatter.format(new Date(dt));
        return dateTime;
    }

};
