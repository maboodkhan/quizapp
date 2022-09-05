'use strict';
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser')
const DIR = './uploads';
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
var sanitizeHtml = require('sanitize-html');


module.exports = function (Questions) {

    Questions.quesUpload = function (req, res, cb) {
        let storage = multer.diskStorage({
            destination: (req, res, cb) => {
                if (!fs.existsSync(DIR)) {
                    var dir = fs.mkdirSync(DIR);
                }
                cb(null, DIR);
            },
            filename: (req, file, cb) => {
                let origFName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
                cb(null, origFName);
            }
        });

        var upload = multer({
            storage: storage
        }).array('file', 12);

        var message = {};
        var successMessage = {};
        const results = [];
        var impCount = [];
        var extName = '';
        var fileHeaders = [0, 'question'];
        upload(req, res, function (err) {
            if (err) {
                cb(null, err);
            }

            if (req.files[0]) {
                extName = path.extname(req.files[0].originalname);
            }
            if (!req.files) {
                message = { 'status': false, 'message': 'File not found' };
                cb(null, message);
            } else if ('.zip' != extName) {
                message = { 'status': false, 'message': 'Only *.zip file is allowed.' };
                cb(null, message);
            } else {
                message = { 'status': true, 'message': 'File uploaded successfully.' };
                cb(null, message);
            }
        });
    }

    Questions.remoteMethod(
        'quesUpload',
        {
            http: { path: '/quesupload', verb: 'post' },
            description: 'Upload Questions',
            accepts: [
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: { arg: 'response', type: 'json' }
        }
    );

    Questions.updateQuestion = async function (data, cb) {
        let msg = {};
        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;
        let question = (data.question == undefined || data.question == null || data.question == '') ? undefined : entities.encode(data.question);
        let solution = (data.solution == undefined || data.solution == null || data.solution == '') ? undefined : entities.encode(data.solution);
        let level_id = (data.level_id == undefined || data.level_id == null || data.level_id == '') ? undefined : data.level_id;
        let question_type = (data.question_type == undefined || data.question_type == null || data.question_type == '') ? undefined : data.question_type;
        let marks = (data.marks == undefined || data.marks == null || data.marks == '') ? undefined : data.marks;
        let status = (data.status == undefined || data.status == null) ? undefined : data.status;
        let created_by = (data.created_by == undefined || data.created_by == null) ? undefined : data.created_by;
        let remarks = (data.remarks == '', data.remarks == null, data.remarks == undefined) ? undefined : data.remarks;
        let qc_done = (data.qc_done == undefined || data.qc_done == null) ? undefined : data.qc_done;
        // let qc_done = 2;

        let ansoptions = (data.ansoptions == undefined || data.ansoptions == null || data.ansoptions == '' || data.ansoptions.length < 1) ? undefined : data.ansoptions;

        
        try{
            if (question_id == undefined) {
                msg = { status: false, message: "Please provide question id" };
        //        return cb(null, msg);
                return msg;
            }
    
            if (question == undefined) {
                msg = { status: false, message: "Please provide question." };
                return msg;
            }
    
            if (level_id == undefined) {
                msg = { status: false, message: "Please provide level id." };
                return msg;
            }
    
            if (question_type == undefined) {
                msg = { status: false, message: "Please provide question type." };
                return msg;
            }
    
            if (marks == undefined) {
                msg = { status: false, message: "Please provide marks." };
                return msg;
            }
    
            if (status == undefined) {
                msg = { status: false, message: "Please provide status." };
                return msg;
            }
    
            if (ansoptions == undefined) {
                msg = { status: false, message: "Please provide status." };
                return msg;
            }
            let previousData = await quePerviousData(question_id);
            let updateData = await updateQuestion(question_id, question, solution, ansoptions, level_id, question_type, marks, qc_done, status, remarks, created_by);
            return updateData;
        } catch (error){
            msg.status = false;
            msg.message = error;
            return msg;
        }
        
    }

    Questions.remoteMethod(
        'updateQuestion',
        {
            http: { path: '/updateQuestion', verb: 'post' },
            description: 'Create/Update Question',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let quePerviousData = (question_id) => {
        return new Promise((resolve, reject) => {
            let Questionpreviousdata = Questions.app.models.question_previous_data;
            Questions.findOne({
                where: { id: question_id },
                include: [
                    {
                        relation: "ansoptions",
                        scope: {
                            fields: ["id", "answer", "status"],
                            where: { or: [{ status: 1 }, { status: 2 }] }
                        }
                    },
                    {
                        relation: "rightansoption",
                        scope: {
                            where: { status: 1 },
                            include: [{
                                relation: "right_ans",
                                scope: {
                                    fields: ["id", "answer", "status"],
                                    where: { status: 1 },
                                }
                            }]
                        }
                    }]
            }, function (err, result) {
                // console.log(result);
                if(err){
                    console.log(err);
                    reject(err.message);
                }
                Questionpreviousdata.destroyAll({ question_id: question_id }, function (err, rVal) {
                    if(err){
                        console.log(err);
                        reject(err.message);
                    }
                    let response = JSON.parse(JSON.stringify(result));
                    let questionObj = {
                        question_id: response.id,
                        question_value: response.question,
                        type_value: "question"
                    }
                    Questionpreviousdata.upsert(questionObj, function (err, res) {
                        if(err){
                            console.log(err);
                            reject(err.message);
                        }
                        let solutionObj = {
                            question_id: response.id,
                            question_value: response.solution,
                            type_value: "solution"
                        }
                        Questionpreviousdata.upsert(solutionObj, function (err, res) {
                            if(err){
                                console.log(err);
                                reject(err.message);
                            }
                            response.ansoptions.forEach(ansObj => {
                                let answerObj = {
                                    question_id: ansObj.question_id,
                                    question_value: ansObj.answer,
                                    type_value: "answer"
                                }
                                Questionpreviousdata.upsert(answerObj, function (err, res) { });
                            })
                            response.rightansoption.forEach((rightAns) => {
                                let rightAnsObj = {
                                    question_id: rightAns.question_id,
                                    question_value: rightAns.right_ans.answer,
                                    type_value: "right_answer"
                                }
                                Questionpreviousdata.upsert(rightAnsObj, function (err, res) { });
                            })
                            resolve();
                        });
                    });
                });
            })
        })
    }

    let updateQuestion = (question_id, question, solution, ansoptions, level_id, question_type, marks, qc_done, status, remarks, created_by) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            const entities = new Entities();
            let obj = {
                question: question,
                solution: solution,
                level_id: level_id,
                question_type: question_type,
                marks: marks,
                qc_done: qc_done,
                status: status
            }

            Questions.update({ id: question_id }, obj, function (err, result) {
                if(err){
                    console.log(err);
                    reject(err.message);
                }
                let answer = Questions.app.models.answers;
                let quesRemark = Questions.app.models.question_remarks;
                let Questionqclogs = Questions.app.models.question_qc_logs;
                if (remarks != undefined) {
                    let remarkObj = {
                        question_id: question_id,
                        remarks: remarks,
                        created_by: created_by
                    }
                    quesRemark.upsert(remarkObj, function (err, result) {
                        if(err){
                            console.log(err);
                            reject(err.message);
                        }
                    });
                }

                let logObj = {
                    question_id: question_id,
                    user_id: created_by,
                    action: "Edit",
                    description: "question is edited"
                }
                Questionqclogs.upsert(logObj, function (err, logRes) {
                    if(err){
                        console.log(err);
                        reject(err.message);
                    }
                })

                for (let i = 0; i < ansoptions.length; i++) {
                    let obj = {
                        answer: entities.encode(ansoptions[i].answer),
                        status: ansoptions[i].status,
                        question_id: question_id,
                        answer_order: ansoptions[i].answer_order
                    }
                    answer.upsertWithWhere({ id: ansoptions[i].id }, obj, function (error, res) {
                        if (error) {
                            console.log(error);
                            reject(error.message);
                        }
                        let quesRightAnswer = Questions.app.models.ques_right_answer;
                        let quezAnsObj = {}
                        if (ansoptions[i].correctAns) {
                            quezAnsObj = {
                                question_id: question_id,
                                answer_id: res.id,
                                status: 1
                            }
                        } else {
                            quezAnsObj = {
                                question_id: question_id,
                                answer_id: res.id,
                                status: 2
                            }
                        }

                        quesRightAnswer.upsertWithWhere({
                            question_id: question_id, answer_id: res.id
                        },
                            quezAnsObj,
                            function (err, response) {
                                if(err){
                                    console.log(err);
                                    reject(err.message);
                                }
                            })
                    });
                }
                msg = { status: true, data: result };
                resolve(msg);
            });
        })
    }

    Questions.getQuestions = function (data, res, cb) {
        const entities = new Entities();
        let msg = {};
        let syllabus_id = (data.syllabus_id == undefined || data.syllabus_id == null || data.syllabus_id == '' || data.syllabus_id.length < 1) ? undefined : data.syllabus_id;
        let syllabus_type = (data.syllabus_type == undefined || data.syllabus_type == null || data.syllabus_type == '') ? 'Topic' : data.syllabus_type;
        let syllabusCond = {};

        if (syllabus_id == undefined) {
            msg = { status: false, message: "Please provide syllabus id" };
            return cb(null, msg);
        }

        Questions.find(
            {
                where: {
                    status: 1
                },
                include: [
                    {
                        relation: "ansoptions",
                        scope: {
                            fields: ["id", "answer"],
                            where: { status: 1 }
                        }
                    },
                    {
                        relation: "syllabus_question",
                        scope: {
                            where:
                            {
                                status: 1,
                                syllabus_id: { inq: syllabus_id },
                                syllabus_type: syllabus_type
                            }
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

    Questions.remoteMethod(
        'getQuestions',
        {
            http: { path: '/getquestions', verb: 'post' },
            description: 'Get active questions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Questions.getAllQuestions = function (data, res, cb) {
        let msg = {};
        let syllabus_id = (data.syllabus_id == undefined || data.syllabus_id == null || data.syllabus_id == '') ? undefined : data.syllabus_id;
        let syllabus_type = (data.syllabus_type == undefined || data.syllabus_type == null || data.syllabus_type == '') ? 'Topic' : data.syllabus_type;

        let syllabusCond = {};

        if (syllabus_id == undefined) {
            msg = { status: false, message: "Please provide syllabus id" };
            return cb(null, msg);
        }

        Questions.find(
            {
                where: {
                    and:
                        [
                            {
                                or: [
                                    { status: 1 },
                                    { status: 2 }
                                ]
                            },
                            { syllabus_id: syllabus_id },
                            { syllabus_type: syllabus_type }
                        ]
                },
                include: [
                    {
                        relation: "ansoptions",
                        scope: {
                            fields: ["id", "answer"],
                            where: { or: [{ status: 1 }, { status: 2 }] }
                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    //return cb(null, err);
                    msg = { status: false, data: "Error! Please try again." };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Questions.remoteMethod(
        'getAllQuestions',
        {
            http: { path: '/getallquestions', verb: 'post' },
            description: 'Get all questions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Questions.getActiveQuestion = function (req, cb) {
        let msg = {};
        let question_id = (req.params.question_id == undefined || req.params.question_id == null || req.params.question_id == '') ? undefined : req.params.question_id;

        Questions.findOne(
            {
                id: question_id,
                include: [
                    {
                        relation: "ansoptions",
                        scope: {
                            fields: ["id", "answer"],
                            where: { status: 1 }
                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    //return cb(null, err);
                    msg = { status: false, data: "Error! Please try again." };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Questions.remoteMethod(
        'getActiveQuestion',
        {
            http: { path: '/getactivequestion', verb: 'post' },
            description: 'Get active question',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Questions.getQuestion = function (req, cb) {
        let msg = {};
        let question_id = (req.params.question_id == undefined || req.params.question_id == null || req.params.question_id == '') ? undefined : req.params.question_id;

        Questions.findOne(
            {
                where: {
                    id: question_id
                },
                include: [
                    {
                        relation: "ansoptions",
                        scope: {
                            fields: ["id", "answer", "answer_order", "status"],
                            where: { or: [{ status: 1 }, { status: 2 }] }
                        }
                    },
                    {
                        relation: "rightansoption",
                        scope: {
                            // fields:["id","answer","answer_order","status"],
                            where: { status: 1 }
                        }
                    },
                    {
                        relation: "syllabus_question",
                        scope: {
                            fields: ["id", "syllabus_id", "syllabus_type"],
                            where: { status: 1 },
                            include: [
                                {
                                    relation: "question_topic",
                                    scope: {
                                        fields: ["id", "topic_name", "lesson_id"],
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
                                                                            fields: ["id", "class_name", "board_id"],
                                                                            where: { status: 1 },
                                                                            include: [
                                                                                {
                                                                                    relation: "board_classes",
                                                                                    scope: {
                                                                                        fields: ["id", "board_name", "status"],
                                                                                        where: { status: 1 },
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
                                    }
                                }
                            ]
                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    //return cb(null, err);
                    msg = { status: false, data: "Error! Please try again." };
                    return cb(null, msg);
                }
                //console.log(entities.decode(result.question));
                let htmloptions = {
                    allowedTags: false,
                    allowedAttributes: {
                        'annotation': ['encoding'],
                        'img': ['src']
                    },
                    disallowedTagsMode: 'escape',
                    decodeEntities: true,
                    parser: {
                        lowerCaseTags: true
                    },
                    exclusiveFilter: function (frame) {
                        // console.log(frame);
                        //return (frame.tag === 'p' || frame.tag === 'span' || frame.tag === 'h4') && !frame.text.trim();
                        return (!frame.attribs.src && !frame.text.trim());
                    }
                };
                let question = result.question;
                question = question.replace(/&lt;img/g, "###IMG###&lt;img"); //To skip img tag from sanitizing
                question = entities.decode(question);
                question = sanitizeHtml(question, htmloptions);
                result.question = entities.encode(question);
                result.question = result.question.replace(/###IMG###/g, "").trim(); // To remove back all the ###IMG### tags

                if (result.solution) {
                    let solution = result.solution;
                    solution = solution.replace(/&lt;img/g, "###IMG###&lt;img");
                    solution = entities.decode(solution);
                    solution = sanitizeHtml(solution, htmloptions);
                    result.solution = entities.encode(solution);
                    result.solution = result.solution.replace(/###IMG###/g, "").trim();
                }

                result.toJSON().ansoptions.map(ansVal => {
                    let answer = ansVal.answer;
                    answer = answer.replace(/&lt;img/g, "###IMG###&lt;img");
                    answer = entities.decode(answer);
                    answer = sanitizeHtml(answer, htmloptions);
                    answer = entities.encode(answer);
                    return answer.replace(/###IMG###/g, "").trim();
                });
                //  console.log(result);
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Questions.remoteMethod(
        'getQuestion',
        {
            http: { path: '/getQuestion/:question_id', verb: 'get' },
            description: 'Get Questions',
            accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Questions.questionForPreview = function (data, res, cb) {
        let msg = {};
        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;

        if (question_id == undefined) {
            msg = { status: false, message: "Please provide question id" };
            return cb(null, msg);
        }

        Questions.find(
            {
                where: {
                    // status: 1,
                    id: { inq: question_id },
                },
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
                            where: { status: 1 },
                            include: [{
                                relation: "right_ans",
                                scope: {
                                    fields: ["id", "answer"],
                                    where: { status: 1 }
                                }
                            }]
                        }
                    },
                    {
                        relation: "question_level",
                        scope: {
                            where: { status: 1 }
                        }
                    },
                    {
                        relation: "syllabus_question",
                        scope: {
                            where: { status: 1 },
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
                            ]
                        }
                    },
                ]
            }, function (err, result) {
                if (err) {
                    // console.log(err);
                    return cb(null, err);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Questions.remoteMethod(
        'questionForPreview',
        {
            http: { path: '/questionForPreview', verb: 'post' },
            description: 'Get active questions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Questions.addQuestion = async function (data, cb) {
        const entities = new Entities();
        let msg = {};
        let question = (data.question == undefined || data.question == null || data.question == '') ? undefined : entities.encode(data.question);
        let solution = (data.solution == undefined || data.solution == null || data.solution == '') ? undefined : entities.encode(data.solution);
        let level_id = (data.level_id == undefined || data.level_id == null || data.level_id == '') ? undefined : data.level_id;
        let question_type = (data.question_type == undefined || data.question_type == null || data.question_type == '') ? undefined : data.question_type;
        let marks = (data.marks == undefined || data.marks == null || data.marks == '') ? undefined : data.marks;
        let status = (data.status == undefined || data.status == null) ? undefined : data.status;
        let qc_done = (data.qc_done == undefined || data.qc_done == null) ? 1 : data.qc_done;
        let syllabus_id = (data.syllabus_id == undefined || data.syllabus_id == null || data.syllabus_id == '' || data.syllabus_id.length < 1) ? undefined : data.syllabus_id;
        let syllabus_type = (data.syllabus_type == undefined || data.syllabus_type == null || data.syllabus_type == '') ? 'topic' : data.syllabus_type;
        let ansoptions = (data.ansoptions == undefined || data.ansoptions == null || data.ansoptions == '' || data.ansoptions.length < 1) ? undefined : data.ansoptions;
        let created_by = (data.created_by == undefined || data.created_by == null) ? undefined : data.created_by;
        let remarks = (data.remarks == '', data.remarks == null, data.remarks == undefined) ? undefined : data.remarks;

        try {
            if (syllabus_id == undefined) {
                msg = { status: false, message: "Please provide syllabus id." };
                return cb(null, msg);
            }
    
            if (question == undefined) {
                msg = { status: false, message: "Please provide question." };
                return cb(null, msg);
            }
    
            if (level_id == undefined) {
                msg = { status: false, message: "Please provide level id." };
                return cb(null, msg);
            }
    
            if (question_type == undefined) {
                msg = { status: false, message: "Please provide question type." };
                return cb(null, msg);
            }
    
            if (marks == undefined) {
                msg = { status: false, message: "Please provide marks." };
                return cb(null, msg);
            }
    
            if (status == undefined) {
                msg = { status: false, message: "Please provide status." };
                return cb(null, msg);
            }
    
            if (ansoptions == undefined) {
                msg = { status: false, message: "Please provide status." };
                return cb(null, msg);
            }
    
    
            let quesResult = await upsertQuestion(question, solution, level_id, question_type, marks, qc_done, status);
            await upsertSyllabusQuestion(quesResult.id, syllabus_id, syllabus_type);
            await questionLogs(quesResult.id, created_by);
            if (remarks != undefined) {
                await questionRemark(quesResult.id, remarks, created_by);
            }
            await answerOption(quesResult.id, ansoptions);
            msg = { status: true, data: quesResult };
            return msg;
        } catch (error) {
            console.log(error);
			msg.status = false;
			msg.message = error.message;
			return msg;
        }

    }

    Questions.remoteMethod(
        'addQuestion',
        {
            http: { path: '/addQuestion', verb: 'post' },
            description: 'Create/Update Question',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    let upsertQuestion = (question, solution, level_id, question_type, marks, qc_done, status) => {
        return new Promise((resolve, reject) => {
            let obj = {
                question: question,
                solution: solution,
                level_id: level_id,
                question_type: question_type,
                marks: marks,
                qc_done: qc_done,
                status: status
            }

            Questions.upsert(obj, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        })
    }

    let upsertSyllabusQuestion = (question_id, syllabus_id, syllabus_type) => {
        return new Promise((resolve, reject) => {
            let syllabuQuestions = Questions.app.models.syllabus_questions;
            let syllabusObj = {
                question_id: question_id,
                syllabus_id: syllabus_id,
                syllabus_type: syllabus_type
            }
            syllabuQuestions.upsert(syllabusObj, function (err, syllabusRes) {
                if (err) {
                    reject(err);
                }
                resolve(syllabusRes);
            });
        })
    }

    let questionLogs = (question_id, created_by) => {
        return new Promise((resolve, reject) => {
            let Questionqclogs = Questions.app.models.question_qc_logs;
            let logObj = {
                question_id: question_id,
                user_id: created_by,
                action: "Add",
                description: "new question is added"
            }
            Questionqclogs.upsert(logObj, function (err, logRes) {
                if (err) {
                    reject(err);
                }
                resolve(logRes);
            });
        })
    }

    let questionRemark = (question_id, remarks, created_by) => {
        return new Promise((resolve, reject) => {
            let quesRemark = Questions.app.models.question_remarks;
            let remarkObj = {
                question_id: question_id,
                remarks: remarks,
                created_by: created_by
            }
            quesRemark.upsert(remarkObj, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        })
    }

    let answerOption = (question_id, ansoptions) => {
        return new Promise((resolve, reject) => {
            let answer = Questions.app.models.answers;
            for (let i = 0; i < ansoptions.length; i++) {
                let obj = {
                    answer: entities.encode(ansoptions[i].answer),
                    status: ansoptions[i].status,
                    question_id: question_id,
                    answer_order: ansoptions[i].answer_order
                }
                answer.upsert(obj, function (error, res) {
                    if (error) {
                        reject(error);
                    }
                    let quesRightAnswer = Questions.app.models.ques_right_answer;
                    let quezAnsObj = {}
                    if (ansoptions[i].correctAns) {
                        quezAnsObj = {
                            question_id: question_id,
                            answer_id: res.id,
                            status: 1
                        }
                    } else {
                        quezAnsObj = {
                            question_id: question_id,
                            answer_id: res.id,
                            status: 2
                        }
                    }
                    quesRightAnswer.upsert(quezAnsObj,
                        function (err, response) {
                            if (err) {
                                reject(err);
                            }
                        })
                });
            }
            resolve();
        })
    }


    Questions.assignQuestion = function (data, cb) {
        let msg = {};
        // console.log(data);
        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;
        let qc_assigned_to = (data.qc_assigned_to == undefined || data.qc_assigned_to == null || data.qc_assigned_to == '') ? undefined : data.qc_assigned_to;
        let qc_assigned_by = (data.qc_assigned_by == undefined || data.qc_assigned_by == null || data.qc_assigned_by == '') ? undefined : data.qc_assigned_by;
        let reviewer_edit = (data.reviewer_edit == undefined || data.reviewer_edit == null || data.reviewer_edit == '') ? undefined : data.reviewer_edit;
        let remarks = (data.remarks == '' || data.remarks == null || data.remarks == undefined) ? undefined : data.remarks;
        if (qc_assigned_to == undefined) {
            msg = { status: false, message: "Please provide qc_assigned_to." };
            return cb(null, msg);
        }
        if (question_id == undefined) {
            msg = { status: false, message: "Please provide question_id." };
            return cb(null, msg);
        }
        let obj = {
            qc_done: 0,
            qc_assigned_to: qc_assigned_to,
            qc_assigned_by: qc_assigned_by,
            reviewer_edit: reviewer_edit
        }
        let quesRemark = Questions.app.models.question_remarks;
        let Questionqclogs = Questions.app.models.question_qc_logs;
        Questions.update({ id: { inq: question_id } }, obj, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            if (remarks != undefined) {
                question_id.forEach(queId => {
                    let remarkObj = {
                        question_id: queId,
                        remarks: remarks,
                        created_by: qc_assigned_by
                    }
                    quesRemark.upsert(remarkObj, function (err, result) {
                        if (err) {
                            console.log(err);
                            return cb(null, err);
                        }
                    });
                });
            }

            question_id.forEach(queId => {
                let assignToObj = {
                    question_id: queId,
                    user_id: qc_assigned_to,
                    action: "assigned_to",
                    description: "question is assigned to user"
                }
                Questionqclogs.upsert(assignToObj, function (err, logRes) {
                    if (err) {
                        // console.log("h>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" ,err);
                        return cb(null, err);
                    }
                });
                let assignByObj = {
                    question_id: queId,
                    user_id: qc_assigned_by,
                    action: "assigned_by",
                    description: "question is assigned by user"
                }
                Questionqclogs.upsert(assignByObj, function (err, logRes) {
                    if (err) {
                        return cb(null, err);
                    }
                });
            });
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Questions.remoteMethod(
        'assignQuestion',
        {
            http: { path: '/assignQuestion', verb: 'post' },
            description: 'Assign Question',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Questions.updateQcDone = function (data, cb) {
        let msg = {};
        // console.log(data);
        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;
        let qc_done = (data.qc_done == undefined || data.qc_done == null) ? undefined : data.qc_done;
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '') ? undefined : data.created_by;
        let remarks = (data.remarks == '' || data.remarks == null || data.remarks == undefined) ? undefined : data.remarks;

        if (question_id == undefined) {
            msg = { status: false, message: "Please provide question_id." };
            return cb(null, msg);
        }

        let quesRemark = Questions.app.models.question_remarks;
        let Questionqclogs = Questions.app.models.question_qc_logs;
        Questions.update({ id: { inq: question_id } }, { qc_done: qc_done }, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            question_id.forEach(queId => {
                let logObj = {};
                if (qc_done == 0) {
                    logObj = {
                        question_id: queId,
                        user_id: created_by,
                        action: "BackToQC",
                        description: "BackToQC"
                    }
                } else if (qc_done == 1) {
                    logObj = {
                        question_id: queId,
                        user_id: created_by,
                        action: "QCDone",
                        description: "QCDone"
                    }
                }

                Questionqclogs.upsert(logObj, function (err, logRes) {
                    if (err) {
                        reject(err);
                    }
                })
            });
            if (remarks != undefined) {
                question_id.forEach(queId => {
                    let remarkObj = {
                        question_id: queId,
                        remarks: remarks,
                        created_by: created_by
                    }
                    quesRemark.upsert(remarkObj, function (err, result) {
                        if (err) {
                            console.log(err);
                            return cb(null, err);
                        }
                    });
                });
            }

            if (qc_done == 1) {
                let quesIssue = Questions.app.models.question_issues;
                quesIssue.update({ question_id: question_id }, { issue_status: 'resolved' }, function (err, issueResult) {
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
            } else {
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        });
    }

    Questions.remoteMethod(
        'updateQcDone',
        {
            http: { path: '/updateQcDone', verb: 'post' },
            description: 'update QcDone',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Questions.removeAssignQue = function (data, cb) {
        let msg = {};
        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;

        if (question_id == undefined) {
            msg = { status: false, message: "Please provide question_id." };
            return cb(null, msg);
        }
        let obj = {
            qc_done: 1,
            qc_assigned_to: 0,
            qc_assigned_by: 0,
            reviewer_edit: 0
        }
        Questions.update({ id: { inq: question_id } }, obj, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Questions.remoteMethod(
        'removeAssignQue',
        {
            http: { path: '/removeAssignQue', verb: 'post' },
            description: ' Remove Assign Question',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


};
