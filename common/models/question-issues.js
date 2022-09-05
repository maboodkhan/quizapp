'use strict';
const path = require('path');
const SETTINGS = require('../../server/system-config');

module.exports = function (Questionissues) {

    // Questionissues.addQuesIssue = function (req, res, cb) {
    //     let msg = {};
    //     var Container = Questionissues.app.models.container;
    //     Container.getApp(function (err, app) {
    //         if (err) return err;            
    //         app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
    //             const origFName = uploadingFile.name;
    //             const extname = path.extname(origFName);
    //             const curDate = new Date();
    //             const curYear = curDate.getFullYear();
    //             const curMonth = curDate.getMonth() + 1;
    //             const fileName = "images/ques_screenshots/"+curYear+'/'+curMonth+'/'+Math.random().toString().substr(2) + extname;
    //             // console.log(fileName);
    //             return fileName;
    //         };
    //     });

    //     Container.upload("lms-app",req, res, async function(err, imgVal){
    //         if(err) {
    //             cb(null, err);
    //         }
    //         // console.log(imgVal.fields);
    //         let data = imgVal.fields;
    //         let screenshot_path = imgVal.files.files[0].name;
    //         let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;
    //         let clientapp_user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
    //         let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '') ? undefined : data.topic_id;
    //         let email = (data.userMailId == undefined || data.userMailId == null || data.userMailId == '') ? undefined : data.userMailId;

    //         if (question_id == undefined) {
    //             msg = { status: false, message: "Please provide question id." };
    //             return cb(null, msg);
    //         }

    //         if (clientapp_user_id == undefined) {
    //             msg = { status: false, message: "Please provide user id." };
    //             return cb(null, msg);
    //         }

    //         if (topic_id == undefined) {
    //             msg = { status: false, message: "Please provide topic id." };
    //             return cb(null, msg);
    //         }

    //         if (email == undefined) {
    //             msg = { status: false, message: "Please provide email." };
    //             return cb(null, msg);
    //         }

    //         try {
    //             // let screenshot_path = await uploadScreenshot(req);
    //             let webapp_user_id = await getWebAppUserId(email);
    //             let getSyllabus = await getSyllabusDetails(data.topic_id);
    //             let quesData = {
    //                 question_id: data.question_id,
    //                 clientapp_user_id: clientapp_user_id,
    //                 webapp_user_id: webapp_user_id,
    //                 class_id: getSyllabus.class_id,
    //                 subject_id: getSyllabus.subject_id,
    //                 lesson_id: getSyllabus.lesson_id,
    //                 topic_id: getSyllabus.topic_id,
    //                 screenshot_path: screenshot_path,
    //                 device_manufacturer: data.device_manufacturer,
    //                 device_model: data.device_model,
    //                 app_name: data.app_name,
    //                 app_pkg: data.app_pkg,
    //                 app_version: data.app_version,
    //                 os: data.os,
    //                 os_version: data.os_version,
    //                 feedback_source_detail: data.feedback_source_detail,
    //                 feedback_from_user: data.feedback_from_user,
    //                 created_on: new Date()
    //             }
    //             // console.log(quesData);
    //             let addQuestionIssue = await addIssue(quesData);
    //             msg.status = true;
    //             msg.message = "Issue reported successfully.";
    //         } catch(error) {
    //             // cb(null, error);
    //             msg.status = false;
    //             msg.message = error.message;
    //             return cb(null, msg);
    //         }

    //         resolve(imgVal.files.upload[0].name);
    //     });


    // }

    // Questionissues.remoteMethod(
    //     'addQuesIssue',
    //     {
    //         http: { path: '/reportissue', verb: 'post' },
    //         description: 'Assign Question',
    //         accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } },
    //         {arg: 'res', type: 'object', http: {source: 'res'}}],
    //         returns: { root: true, type: 'json' }
    //     }
    // );


    Questionissues.addQuesIssue = async function (data, cb) {
        let msg = {};

        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;
        let clientapp_user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        // let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '') ? undefined : data.topic_id;
        let email = (data.userMailId == undefined || data.userMailId == null || data.userMailId == '') ? undefined : data.userMailId;
        let screenshot_path = (data.screenshot_path == undefined || data.screenshot_path == null || data.screenshot_path == '') ? undefined : data.screenshot_path;

        if (question_id == undefined) {
            msg = { status: false, message: "Please provide question id." };
            return cb(null, msg);
        }

        if (clientapp_user_id == undefined) {
            msg = { status: false, message: "Please provide user id." };
            return cb(null, msg);
        }

        if (screenshot_path == undefined) {
            msg = { status: false, message: "Please provide screenshot path." };
            return cb(null, msg);
        }

        if (email == undefined) {
            msg = { status: false, message: "Please provide email." };
            return cb(null, msg);
        }

        try {
            // let screenshot_path = await uploadScreenshot(req);
            let webapp_user_id = await getWebAppUserId(email);
            let getSyllabus = await getSyllabusDetails(data.question_id);
            let quesData = {
                question_id: data.question_id,
                clientapp_user_id: clientapp_user_id,
                webapp_user_id: webapp_user_id,
                class_id: getSyllabus.class_id,
                subject_id: getSyllabus.subject_id,
                lesson_id: getSyllabus.lesson_id,
                topic_id: getSyllabus.topic_id,
                screenshot_path: screenshot_path,
                device_manufacturer: data.device_manufacturer,
                device_model: data.device_model,
                app_name: data.app_name,
                app_pkg: data.app_pkg,
                app_version: data.app_version,
                os: data.os,
                os_version: data.os_version,
                feedback_source_detail: data.feedback_source_detail,
                feedback_from_user: data.feedback_from_user,
                created_on: new Date()
            }
            // console.log(quesData);
            let addQuestionIssue = await addIssue(quesData);
            msg.status = true;
            msg.message = "Issue reported successfully.";
            return cb(null, msg);
        } catch (error) {
            // cb(null, error);
            msg.status = false;
            msg.message = error.message;
            // return cb(null, msg);
            return msg;
        }
    }

    Questionissues.remoteMethod(
        'addQuesIssue',
        {
            http: { path: '/reportissue', verb: 'post' },
            description: 'Assign Question',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let uploadScreenshot = (req) => {
        return new Promise((resolve, reject) => {
            var Container = Questionissues.app.models.container;
            Container.getApp(function (err, app) {
                if (err) return err;
                app.dataSources.fileUploadGoogle.connector.getFilename = function (uploadingFile, req, res) {
                    const origFName = uploadingFile.name;
                    const extname = path.extname(origFName);
                    const curDate = new Date();
                    const curYear = curDate.getFullYear();
                    const curMonth = curDate.getMonth() + 1;
                    const fileName = "images/ques_screenshots/" + curYear + '/' + curMonth + '/' + Math.random().toString().substr(2) + extname;
                    // console.log(fileName);
                    return fileName;
                };
            });

            Container.upload("lms-app", req, res, function (err, imgVal) {
                if (err) {
                    reject(err);
                }
                let url = { url: SETTINGS.SETTINGS.bucket_lmsapp + imgVal.files.upload[0].name };
                resolve(imgVal.files.upload[0].name);
            });
        });
    }

    let getWebAppUserId = (email) => {
        return new Promise((resolve, reject) => {
            let User = Questionissues.app.models.user;
            User.findOne({ where: { email: email, status: 1 } }, function (err, userData) {
                if (err) {
                    reject(err);
                }
                resolve(userData.id);
            });
        });
    }

    let getSyllabusDetails = (question_id) => {
        return new Promise((resolve, reject) => {
            let ds = Questionissues.dataSource;
            let sql = `select s.id as subject_id, s.class_id, l.id as lesson_id, t.id as topic_id
                    from subjects s
                    join lessons l on s.id = l.subject_id
                    join topics t on l.id = t.lesson_id
                    join syllabus_questions sq on t.id = sq.syllabus_id
                    where sq.question_id = ${question_id}`;
            // console.log(sql);
            let params = [];
            let sybResult = ds.connector.query(sql, params, function (err, sybData) {
                if (err) {
                    reject(err);
                }
                // console.log(sybData);
                resolve(sybData[0]);
            });
        });
    }

    let addIssue = (data) => {
        return new Promise((resolve, reject) => {
            Questionissues.create(data, function (err, issueData) {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }


    Questionissues.getQuestionIssue = async function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        let issue_id = (data.issue_id == undefined || data.issue_id == null || data.issue_id == '') ? undefined : data.issue_id;
        let issueBy = (data.issueBy == undefined || data.issueBy == null || data.issueBy == '') ? undefined : data.issueBy;
        let fromDate = (data.fromDate == undefined || data.fromDate == null || data.fromDate == '') ? undefined : data.fromDate;
        let toDate = (data.toDate == undefined || data.toDate == null || data.toDate == '') ? undefined : data.toDate;
        let issue_status = (data.issue_status == undefined || data.issue_status == null || data.issue_status == '') ? undefined : data.issue_status;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '') ? 0 : data.offset;
        let limit = (data.limit == undefined || data.limit == null || data.limit == '') ? 10 : data.limit;
        let sortBy = (data.sortBy == undefined || data.sortBy == null || data.sortBy == '') ? 'created_on' : data.sortBy;
        let sortDirection = (data.sortDirection == undefined || data.sortDirection == null || data.sortDirection == '') ? 'desc' : data.sortDirection;
        let cond = {};

        if(issueBy != undefined){
            user_id = issueBy;
        }

        try {
            let assignedArr = [];
            assignedArr.push(user_id);
            let userArr = [];
            userArr.push(user_id);
            await allUserIds(userArr, assignedArr);
            // console.log(assignedArr);
            if (fromDate !== undefined) {
                let frmDate = new Date(fromDate);
                fromDate = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
            }

            if (toDate !== undefined) {
                let tDate = new Date(toDate);
                let month = tDate.getMonth() + 1;
                toDate = tDate.getFullYear() + "-" + month + "-" + tDate.getDate() + " 23:59:59";
            }

            cond = { webapp_user_id: { inq: assignedArr }, issue_status: issue_status, id: issue_id, status: 1 };
            if (fromDate != undefined && toDate != undefined) {
                cond.created_on = { between: [fromDate, toDate] };
            } else if (fromDate == undefined && toDate != undefined) {
                cond.created_on = { lte: toDate };
            } else if (fromDate != undefined && toDate == undefined) {
                cond.created_on = { gte: fromDate };
            }

            if (class_id != undefined) {
                cond.class_id = { inq: class_id }
            }
            if (subject_id != undefined) {
                cond.subject_id = { inq: subject_id }
            }
            if (lesson_id != undefined) {
                cond.lesson_id = { inq: lesson_id }
            }
            if (topic_id != undefined) {
                cond.topic_id = { inq: topic_id }
            }
            // console.log(cond);

            let queRes = await questionIssued(cond, limit, offset, sortBy, sortDirection);
            return queRes;
        } catch (error) {
            throw error;
        }
    }

    Questionissues.remoteMethod(
        'getQuestionIssue',
        {
            http: { path: '/getQuestionIssue', verb: 'post' },
            description: 'Assign lesson to users',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let questionIssued = (cond, limit, offset, sortBy, sortDirection) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            Questionissues.find({ where: cond }, function (err, res) {
                if (err) { console.log(err); reject(err); }
                Questionissues.find({
                    where: cond,
                    limit: limit,
                    skip: offset,
                    order: sortBy+' '+ sortDirection,
                    include: [
                        {
                            relation: "webUsers",
                            scope: {
                                where: {
                                    status: 1
                                },
                                fields: ['firstName', 'lastName', 'user_type_id']
                            }
                        },
                        {
                            relation: "questions",
                            scope: {
                                where: { status: 1 },
                                include: [
                                    {
                                        relation: "que_assigned_to",
                                        scope: {
                                        },
                                    }
                                ]
                            }
                        },
                    ]
                }, function (err, result) {
                    if (err) { console.log(err); reject(err); }
                    msg = { status: true, data: result, totalIssue: res.length };
                    resolve(msg);
                });
            })

        });
    }

    let allUserIds = (user_id, assignedArr) => {
        return new Promise((resolve, reject) => {
            let createdIds = [];
            let Users = Questionissues.app.models.user;
            Users.find({ where: { assigned_to: { inq: user_id } } }, function (err, result) {
                if (err) {
                    return err;
                }
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        assignedArr.push(result[i].id);
                        createdIds.push(result[i].id);
                    }
                    resolve(allUserIds(createdIds, assignedArr));
                }
                else {
                    resolve(assignedArr);
                }
            });
        });
    }


    Questionissues.getQueIssueById = function (data, cb) {
        let msg = {};
        // console.log(data);
        let issue_id = (data.issue_id == undefined || data.issue_id == null || data.issue_id == '') ? undefined : data.issue_id;
        Questionissues.findOne({
            where: {
                id: issue_id
            },
            include: [
                {
                    relation: "webUsers",
                    scope: {
                        where: { status: 1 },
                        fields: ['firstName', 'lastName', 'user_type_id']
                    }
                },
                {
                    relation: "class_id",
                    scope: {
                        where: { status: 1 },
                        fields: ['class_name']
                    }
                },
                {
                    relation: "subject_id",
                    scope: {
                        where: { status: 1 },
                        fields: ['subject_name']
                    }
                },
                {
                    relation: "lesson_id",
                    scope: {
                        where: { status: 1 },
                        fields: ['lesson_name']
                    }
                },
                {
                    relation: "topic_id",
                    scope: {
                        where: { status: 1 },
                        fields: ['topic_name']
                    }
                },
                {
                    relation: "questions",
                    scope: {
                        where: { status: 1 },
                    }
                },
            ]
        }, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }

            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Questionissues.remoteMethod(
        'getQueIssueById',
        {
            http: { path: '/getQueIssueById', verb: 'post' },
            description: 'Assign lesson to users',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Questionissues.updateQueIssueById = function (data, cb) {
        let msg = {};
        // console.log(data);        
        let issue_id = (data.issue_id == undefined || data.issue_id == null || data.issue_id == '') ? undefined : data.issue_id;
        let feedback_from_user = (data.feedback_from_user == undefined || data.feedback_from_user == null || data.feedback_from_user == '') ? undefined : data.feedback_from_user;

        if (issue_id == undefined) {
            msg = { status: false, message: "Please provide issue id" };
            return cb(null, msg);
        }

        Questionissues.update(
            { id: issue_id },
            { feedback_from_user: feedback_from_user }, function (err, result) {
                if (err) {
                    console.log(err);
                    return cb(null, err);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            });
    }

    Questionissues.remoteMethod(
        'updateQueIssueById',
        {
            http: { path: '/updateQueIssueById', verb: 'post' },
            description: 'Assign Question',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Questionissues.uploadScreenshot = function (req, res, cb) {
        let msg = {};
        var Container = Questionissues.app.models.container;
        Container.getApp(function (err, app) {
            if (err) return err;
            app.dataSources.fileUploadGoogle.connector.getFilename = function (uploadingFile, req, res) {
                const origFName = uploadingFile.name;
                const extname = path.extname(origFName);
                const curDate = new Date();
                const curYear = curDate.getFullYear();
                const curMonth = curDate.getMonth() + 1;
                const fileName = "images/ques_screenshots/" + curYear + '/' + curMonth + '/' + Math.random().toString().substr(2) + extname;
                // console.log(fileName);
                return fileName;
            };
        });

        Container.upload("lms-app", req, res, async function (err, imgVal) {
            if (err) {
                // cb(null, err);
                msg.status = false;
                msg.message = "Error in uploading file.";
                cb(null, msg);
            }
            // console.log(imgVal.files);
            //  let data = imgVal.fields;
            msg.status = true;
            msg.filename = imgVal.files.files[0].name;
            cb(null, msg);
        });


    }

    Questionissues.remoteMethod(
        'uploadScreenshot',
        {
            http: { path: '/uploadScreenshot', verb: 'post' },
            description: 'Upload Screenshot',
            accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Questionissues.getUserIssueList = async function (data, cb) {
        let msg = {};
        // console.log(data);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;

        try {
            let assignedArr = [];
            assignedArr.push(user_id);
            let userArr = [];
            userArr.push(user_id);
            await allUserIds(userArr, assignedArr);
            let userResult = await usersList(assignedArr);
            return (userResult);
        } catch (error) {
            throw error;
        }
    }

    Questionissues.remoteMethod(
        'getUserIssueList',
        {
            http: { path: '/getUserIssueList', verb: 'post' },
            description: 'Assign lesson to users',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let usersList = (assignedArr) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Users = Questionissues.app.models.user;
            Users.find({ where: { id: { inq: assignedArr } } }, function (err, result) {
                if (err) {
                    reject(err);
                }
                msg.status = true;
                msg.data = result
                resolve(msg);
            });
        });
    }


    Questionissues.getIssueQuestions = function(data, cb) {
        let msg = {};
        let syllabus_id = (data.syllabus_id == undefined || data.syllabus_id == null || data.syllabus_id == '' || data.syllabus_id.length<1)?undefined:data.syllabus_id;
        let syllabus_type = (data.syllabus_type == undefined || data.syllabus_type == null || data.syllabus_type == '')?'topic':data.syllabus_type;
        let qc_done = (data.qc_done == undefined || data.qc_done == null || data.qc_done == '')?undefined:data.qc_done;
        let issue_status = (data.issue_status == undefined || data.issue_status == null || data.issue_status == '')?undefined:data.issue_status;
        let zero = undefined;
        let one = undefined;
        if(qc_done != undefined){
            zero = 0;
            one = 1;
        }

        if(syllabus_id == undefined){
            msg = {status:false,message:"Please provide syllabus id"};
            return cb(null, msg);
        }

        Questionissues.find(
            {
                where:{
                    topic_id:{inq:syllabus_id},
                    issue_status: issue_status
                },
                fields: {id: true, question_id: true, syllabus_id: true},      
                include: [
                    {
                        relation: "topic_id",
                        scope: {
                            where:{status:1},
                            include: [
                                {
                                    relation: "lesson_topics",
                                    scope: {
                                        fields: {id: true, lesson_name: true, lesson_id: true},
                                        where:{status:1},
                                    }
                                }
                            ]
                        }
                    },
                    {
                        relation: "questions",					
                        scope: {												                            
                            where:
                            {
                                and:
                                [
                                    {or: [{qc_done:zero},{qc_done:one}]},
                                    {status:1}
                                ]
                            },
                            
                            include: [
                                {
                                    relation: "que_assigned_to",					
                                    scope: {												
                                        fields:["id","firstName", "lastName"],
                                        where:{status:1}
                                    }
                                },
                                {
                                    relation: "que_assigned_by",					
                                    scope: {												
                                        fields:["id","firstName", "lastName"],
                                        where:{status:1}
                                    }
                                },
                                {
                                    relation: "question_level",					
                                    scope: {												
                                        fields:["id","level_name"],
                                        where:{status:1}
                                    }
                                },
                                {
                                    relation: "rightansoption",					
                                    scope: {												
                                        fields:["id","answer_id"],
                                        where:{status:1},
                                        include: [
                                            {
                                                relation: "right_ans",					
                                                scope: {												
                                                    fields:["id","answer"],
                                                    where:{status:1}
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
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
            }
        );
    }

    Questionissues.remoteMethod(
        'getIssueQuestions',
        {
            http: {path: '/getIssueQuestions', verb: 'post'},
            description: 'Get active questions',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Questionissues.viewIssueList = function(data, cb) {
        let msg = {};
        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '')?undefined:data.question_id;
        let offset = (data.offset == undefined || data.offset == null || data.offset == '') ? undefined : data.offset;
        let limit = (data.limit == undefined || data.limit == null || data.limit == '') ? undefined : data.limit;

        Questionissues.find({ where: {question_id: question_id} }, function (err, res) {
            if (err) { console.log(err); return cb(null, err); }
            Questionissues.find({
                where: {question_id: question_id},
                limit: limit,
                skip: offset,
                order: "id asc",
                include: [
                    {
                        relation: "webUsers",
                        scope: {
                            where: {
                                status: 1
                            },
                            fields: ['firstName', 'lastName', 'user_type_id']
                        }
                    },
                    {
                        relation: "questions",
                        scope: {
                            where: { status: 1 },
                            include: [
                                {
                                    relation: "que_assigned_to",
                                    scope: {
                                    },
                                }
                            ]
                        }
                    },
                ]
            }, function (err, result) {
                if (err) { console.log(err); return cb(null, err); }
                msg = { status: true, data: result, totalIssue: res.length };
                return cb(null, msg);
            });
        })
    }

    Questionissues.remoteMethod(
        'viewIssueList',
        {
            http: {path: '/viewIssueList', verb: 'post'},
            description: 'Get active questions',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );


    Questionissues.deleteIssue = function(data, cb) {
        let msg = {};
        let issue_id = (data.issue_id == undefined || data.issue_id == null || data.issue_id == ''?undefined:data.issue_id);

        Questionissues.update({ id:issue_id },{status: 5}, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Questionissues.remoteMethod(
        'deleteIssue',
        {
            http: {path: '/deleteIssue', verb: 'post'},
            description: 'Issue deleted',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );

};