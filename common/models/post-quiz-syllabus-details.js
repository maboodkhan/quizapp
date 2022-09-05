'use strict';

module.exports = function (Quizsyllabusdetails) {


    Quizsyllabusdetails.getActiveQuizSetDetails = function (set_id, cb) {
        let msg = {};
        //let set_id = (data.set_id==undefined || data.set_id==null || data.set_id==''?undefined:data.set_id);

        if (set_id == undefined) {
            msg = { status: false, message: "Please provide set id" };
            return cb(null, msg);
        }

        Quizsyllabusdetails.findOne({
            where: {
                and:
                    [
                        { id: set_id },
                        { status: 1 }
                    ]
            },
            include: [
                {
                    relation: "quiz_syllabus",
                    scope: {
                        where: {
                            status: 1
                        }
                    }
                },
                {
                    relation: "quiz_questions",
                    scope: {
                        where: {
                            status: 1
                        },
                        include: [
                            {
                                relation: "quiz_question",
                                scope: {
                                    where: { status: 1 },
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

    Quizsyllabusdetails.remoteMethod(
        'getActiveQuizSetDetails',
        {
            http: { path: '/getquizsetdetails', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'set_id', type: 'number', required: true }],
            returns: { root: true, type: 'json' }
        }
    );


    Quizsyllabusdetails.getQuizSetClassInfo = function (data, cb) {
        let msg = {};
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);

        if (quiz_set_id == undefined) {
            msg = { status: false, message: "Please provide quiz set id" };
            return cb(null, msg);
        }

        Quizsyllabusdetails.find({
            where: {
                and:
                    [
                        { quiz_set_id: quiz_set_id },
                        { status: 1 }
                    ]
            },
            fields: ["id", "class_id"],
            include: [
                {
                    relation: "quiz_class",
                    scope: {
                        where: {
                            status: 1
                        }
                    }
                }
            ]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }


    Quizsyllabusdetails.remoteMethod(
        'getQuizSetClassInfo',
        {
            http: { path: '/getquizsetClassInfo', verb: 'post' },
            description: 'Get Quiz Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Quizsyllabusdetails.getQuizSetSectionInfo = function (data, cb) {
        let msg = {};
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length < 0 ? undefined : data.class_id);
        var ds = Quizsyllabusdetails.dataSource;
        let params;

        if (quiz_set_id == undefined) {
            msg = { status: false, message: "Please provide quiz set id" };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }
        class_id = class_id.join();
        var sql = `SELECT qsd.section_id, qsd.class_id, c.class_name, s.section_name FROM quiz_syllabus_details qsd 
        join class_sections cs on qsd.section_id = cs.id
        join classes c on c.id = qsd.class_id
        join sections s on s.id = cs.section_id
        where qsd.quiz_set_id = ${quiz_set_id} and c.id IN(${class_id})
        group by qsd.class_id, qsd. section_id`

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


    Quizsyllabusdetails.remoteMethod(
        'getQuizSetSectionInfo',
        {
            http: { path: '/getQuizSetSectionInfo', verb: 'post' },
            description: 'Get Quiz Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Quizsyllabusdetails.getTopicWiseDetails = async function (data, cb) {
        let msg = {};

        let set_id = (data.set_id==undefined || data.set_id==null || data.set_id==''?undefined:data.set_id);
        let attempted_set_id = (data.attempted_set_id==undefined || data.attempted_set_id==null || data.attempted_set_id==''?undefined:data.attempted_set_id);
        let topic_id = (data.topic_id==undefined || data.topic_id==null || data.topic_id==''?undefined:data.topic_id);

        try{
            if (set_id == undefined) {
                msg = { status: false, message: "Please provide set id" };
                return msg;
            }
    
            // if (topic_id == undefined) {
            //     msg = { status: false, message: "Please provide topic id" };
            //     return msg;
            // }
            let topicName = '';
            if(topic_id !== undefined){
                let topicData = await getTopic(topic_id);
                topicName = topicData.topic_name;
            }
            let questionIds = await getQuizQuestionIds(set_id, topic_id);
            questionIds = await getTopicQues(questionIds, topic_id);
            let topicWiseResult = await getTopiceWiseQues(attempted_set_id, set_id, questionIds);
            // console.log(topicWiseResult);
            msg.status = true;
            msg.topic_name = topicName
            msg.data = topicWiseResult;
            return msg;
        } catch(error){
            msg.status = false;
            msg.message = error;
            return msg;
        }        
    }

    Quizsyllabusdetails.remoteMethod(
        'getTopicWiseDetails',
        {
            http: { path: '/getTopicWiseDetails', verb: 'post' },
            description: 'Get attempted quiz set details',
            accepts: [{ arg: 'data', type: 'object', required: true, http: {source: 'body'} }],
            returns: { root: true, type: 'json' }
        }
    );

    let getTopic = (topic_id) => {
        return new Promise((resolve, reject) => {
            let Topics = Quizsyllabusdetails.app.models.topics;
            Topics.findOne({
                where: { id: topic_id}
            },function(err, data){
                if(err){
                    reject(err.message);
                }
                resolve(data);
            });
        });
    }

    let getQuizQuestionIds = (quiz_set_id, topic_id) => {
        return new Promise((resolve, reject) => {
            Quizsyllabusdetails.find({
                where: {
                    quiz_set_id: quiz_set_id,
                    topic_id: topic_id
                },
                include:[
                    {
                        
                            relation: "quiz_syllabus",
                            scope: {
                                include:[
                                    {
                                        relation: "quiz_questions",
                                        scope: {

                                        }
                                    }
                                ]
                            }
                        
                    }
                ]                
            }, function(err, quesData){
                if(err){
                    reject(err.message);
                } 
                if(quesData){
                    let quesIds = [];
                    let incVal = 0;
                    quesData.forEach((quesVal) => {
                        quesVal = JSON.stringify(quesVal);
                        quesVal = JSON.parse(quesVal).quiz_syllabus.quiz_questions;
                        quesVal.forEach((questionIds) =>{
                            quesIds.push(questionIds.question_id);
                        })
                        // console.log(quesVal);
                        
                        incVal++;               
                    });
                    if(incVal == quesData.length){
                        resolve(quesIds);
                    }

                } else {
                    reject("No data found.");
                }
            })
        });
    }

    let getTopicQues = (questionIds, topic_id) => {
        return new Promise((resolve, reject) => {
            let SyllabusQuestions = Quizsyllabusdetails.app.models.syllabus_questions;
            SyllabusQuestions.find({
                where:{
                    syllabus_id: topic_id,
                    question_id: {inq: questionIds}
                }
            }, function(err, quesData){
                if(err){
                    console.log(err)
                    reject(err.message);
                }
                

                if(quesData){
                    let incVal = 0;
                let quesIds = [];
                    quesData.forEach((quesVal)=>{

                        quesVal = JSON.stringify(quesVal);
                        quesVal = JSON.parse(quesVal);
                        // console.log("quesVal",quesVal)
                        quesIds.push(quesVal.question_id);
    
                        incVal++;
                    });
                    if(incVal == quesData.length){
                        resolve(quesIds);
                    }
                } else {
                    reject("No data found.");
                }              
            });
        });
    }

    let getTopiceWiseQues = (attempted_set_id, set_id, questionIds) => {
        return new Promise((resolve, reject) => {

            let AttempQuizQues = Quizsyllabusdetails.app.models.post_attempted_quiz_questions;
            let QuizQues = Quizsyllabusdetails.app.models.post_quiz_questions;
            QuizQues.find({
                where: {
                    question_id: {inq: questionIds},
                    quiz_set_id: set_id
                },
                order:"ques_order",
                include: [
                    {
                        relation: "quiz_question",
                        scope: {
                            include:[
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
                                },
                                {
                                    relation: "postAttemptQuizQues",
                                    scope: {
                                        where: {
                                            attempted_set_id: attempted_set_id
                                        },
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
                        reject(err.message)
                    }
                    resolve(result);
                });
            // AttempQuizQues.find({
            //     where: {
            //         attempted_set_id: attempted_set_id,
            //         question_id: {inq: questionIds}
            //     },
            //     order: 'ques_order',
            //     include: [
            //         {      
            //             relation: "attempted_quiz_answer",
            //             scope: {
            //                 fields: ["id", "answer"]
            //             }
            //         },
            //         {
            //             relation: "attempted_quiz_question",
            //             scope: {
            //                 include: [
            //                     {
            //                         relation: "ansoptions",
            //                         scope: {
            //                             fields: ["id", "answer"],
            //                             where: { status: 1 }
            //                         }
            //                     },
            //                     {
            //                         relation: "rightansoption",
            //                         scope: {
            //                             fields: ["id", "answer_id"],
            //                             where: { status: 1 },
            //                             include: [
            //                                 {
            //                                     relation: "right_ans",
            //                                     scope: {
            //                                         fields: ["id", "answer"]
            //                                     }
            //                                 }
            //                             ]
            //                         }
            //                     }
            //                 ]
            //             }
            //         }     
            //     ]
            // }, function (err, result) {
            //     if (err) {
            //         reject(err.message)
            //     }
            //     resolve(result);
            // });
        });
    }
};
