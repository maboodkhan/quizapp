'use strict';
const request = require('request');
const fs = require("fs");
const dirpath = require('path');
const SETTINGS = require('../../server/system-config');
//const storageApiPath = 'https://storage.googleapis.com/marksharks-content/msplus-content/';
const storageApiPath = SETTINGS.SETTINGS.storage_api_path_msplus;
const sevenBin = require('7zip-bin');
const Zip = require('node-7z');
const { execSync } = require("child_process");

module.exports = function (Textbookcontents) {

    Textbookcontents.getContent = function (data, res, cb) {
        let msg = {};
        // let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '') ? undefined : data.country_id;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        // let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '') ? undefined : data.board_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let country_lesson_id = (data.country_lesson_id == undefined || data.country_lesson_id == null || data.country_lesson_id == '') ? undefined : data.country_lesson_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '') ? undefined : data.topic_id;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let cond = {};

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        if (subject_id != undefined) {
            cond.subject_id = { inq: subject_id }
        }

        if (country_lesson_id != undefined) {
            cond.country_lesson_id = { inq: country_lesson_id }
        }

        if (lesson_id != undefined) {
            cond.lesson_id = { inq: lesson_id }
        }

        if (topic_id != undefined) {
            cond.topic_id = { inq: topic_id }
        }        
        
        cond.status = status;

        Textbookcontents.find({where: cond}, function (err, res) {
            Textbookcontents.find({
                where: cond,
                skip: offset,
                limit: limit,
                order: 'id desc',
                include: [
                    {
                        relation: "content_board",
                        scope: {
                            fields: ['board_name']
                        }
                    },
                    {
                        relation: "content_school",
                        scope: {
                            fields: ['school_name']
                        }
                    },
                    {
                        relation: "content_class",
                        scope: {
                            fields: ['class_name']
                        }
                    },
                    {
                        relation: "content_subject",
                        scope: {
                            fields: ['subject_name']
                        }
                    },
                    {
                        relation: "content_lesson",
                        scope: {
                            fields: ['lesson_name']
                        }
                    },
                    {
                        relation: "content_topic",
                        scope: {
                            fields: ['topic_name']
                        }
                    },
                    {
                        relation: "created_by",
                        scope: {
                            fields: ['firstName', 'lastName']
                        }
                    },
                    {
                        relation: "modified_by",
                        scope: {
                            fields: ['firstName', 'lastName']
                        }
                    },
                ]
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    msg = { status: false, msg: err };
                    return cb(null, msg);
                }
                msg = { status: true, data: result, totalContent: res.length };
                return cb(null, msg);
            });
        });
    }

    Textbookcontents.remoteMethod(
        'getContent',
        {
            http: { path: '/getContent', verb: 'post' },
            description: 'Get all content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Textbookcontents.createContent = function (data, res, cb) {
        let msg = {};
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '') ? undefined : data.country_id;
        let country_lesson_id = (data.country_lesson_id == undefined || data.country_lesson_id == null || data.country_lesson_id == '') ? undefined : data.country_lesson_id;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '') ? undefined : data.board_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '') ? undefined : data.topic_id;
        let title = (data.title == undefined || data.title == null || data.title == '') ? undefined : data.title;
        let version = (data.version == undefined || data.version == null || data.version == '') ? undefined : data.version;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let path = (data.path == undefined || data.path == null || data.path == '') ? undefined : data.path;
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '') ? undefined : data.created_by;
        let created_on = (data.created_on == undefined || data.created_on == null || data.created_on == '') ? undefined : data.created_on;
        let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '') ? undefined : data.modified_by;
        
        if (country_id == undefined) {
            msg = { status: false, message: "Please provide country id" };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id" };
            return cb(null, msg);
        }

        if (board_id == undefined) {
            msg = { status: false, message: "Please provide board id" };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id" };
            return cb(null, msg);
        }
        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }
        if (topic_id == undefined) {
            msg = { status: false, message: "Please provide topic id" };
            return cb(null, msg);
        }
        if (version == undefined) {
            msg = { status: false, message: "Please provide version" };
            return cb(null, msg);
        }

        if (path == undefined) {
            msg = { status: false, message: "Please provide Content Path" };
            return cb(null, msg);
        }

        if (created_by == undefined) {
            msg = { status: false, message: "Please provide created by" };
            return cb(null, msg);
        }

        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }

        let saveObj = {
            country_id: country_id,
            country_lesson_id: country_lesson_id,
            board_id: board_id,
            school_id: school_id,
            class_id: class_id,
            subject_id: subject_id,
            lesson_id: lesson_id,
            topic_id: topic_id,
            title: title,
            version: version,
            status: status,
            path: path,
            created_by: created_by,
            modified_by: created_by,
            created_on: created_on,
            modified_by: modified_by
        }

        Textbookcontents.findOne({where: {topic_id: topic_id, title: title}}, function(err, res){
            if(res){
                msg = {status: false, message: "Title already exist on this topic"}
                return cb(null, msg);
            }else{
                Textbookcontents.upsert(saveObj, function (err, result) {
                    if (err) {
                        return cb(null, err);
                    }        
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
            }
        })
    }

    Textbookcontents.remoteMethod(
        'createContent',
        {
            http: { path: '/create', verb: 'post' },
            description: 'Create Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Textbookcontents.updateContent = function (data, res, cb) {
        // console.log(data)
        let msg = {};
        let content_id = (data.content_id == undefined || data.content_id == null || data.content_id == '') ? 0 : data.content_id;
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '') ? undefined : data.country_id;
        let country_lesson_id = (data.country_lesson_id == undefined || data.country_lesson_id == null || data.country_lesson_id == '') ? undefined : data.country_lesson_id;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '') ? undefined : data.board_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '') ? undefined : data.topic_id;
        let title = (data.title == undefined || data.title == null || data.title == '') ? undefined : data.title;
        let version = (data.version == undefined || data.version == null || data.version == '') ? undefined : data.version;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let path = (data.path == undefined || data.path == null || data.path == '') ? undefined : data.path;
        let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '') ? undefined : data.modified_by;

        if (country_id == undefined) {
            msg = { status: false, message: "Please provide country id" };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id" };
            return cb(null, msg);
        }

        if (board_id == undefined) {
            msg = { status: false, message: "Please provide board id" };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id" };
            return cb(null, msg);
        }
        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }
        if (topic_id == undefined) {
            msg = { status: false, message: "Please provide topic id" };
            return cb(null, msg);
        }
        if (version == undefined) {
            msg = { status: false, message: "Please provide version" };
            return cb(null, msg);
        }
        // if (encryptionKey == undefined) {
        //     msg = { status: false, message: "Please provide encryption key" };
        //     return cb(null, msg);
        // }
        if (path == undefined) {
            msg = { status: false, message: "Please provide Content Path" };
            return cb(null, msg);
        }
        if (modified_by == undefined) {
            msg = { status: false, message: "Please provide modified by" };
            return cb(null, msg);
        }
        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }

        let updateObj = {
            country_id: country_id,
            country_lesson_id: country_lesson_id,
            board_id: board_id,
            school_id: school_id,
            class_id: class_id,
            subject_id: subject_id,
            lesson_id: lesson_id,
            topic_id: topic_id,
            title: title,
            version: version,
            status: status,
            path: path,
            modified_by: modified_by,
        }

        Textbookcontents.findOne({where: {topic_id: topic_id, title: title, id: {neq: content_id}}}, function(err, res){
            if(res){
                msg = {status: false, message: "Title already exist on this topic"}
                return cb(null, msg);
            }else{
                Textbookcontents.findOne({ where: { id: content_id } }, function (err, cntData) {
                //     if (res==null) {
                    Textbookcontents.update({ id: content_id }, updateObj, function (err, result) {
                            if (err) {
                                return cb(null, err);
                            }
                            // console.log(">>>>>>>>>>>>>...............",result);
                            msg = { status: true, message: "Record updated successfully." };
                            return cb(null, msg);
                        });
                //     } else {
                //         msg = { status: false, message: "Content already available" };
                //         return cb(null, msg);
                //     }
                });
            }
        });
    }

    Textbookcontents.remoteMethod(
        'updateContent',
        {
            http: { path: '/update', verb: 'post' },
            description: 'Update Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Textbookcontents.getContentById = function (data, res, cb) {
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let content_id = (data.content_id == undefined || data.content_id == null || data.content_id == '') ? undefined : data.content_id;
        let msg = {};
        let cond = {};

        if (content_id == undefined) {
            msg = { status: false, message: "Please provide content id" };
            return cb(null, msg);
        }

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        if (section_id != undefined) {
            cond.section_id = { inq: section_id }
        }
        cond.country_id = country_id;
        cond.id = content_id

        Textbookcontents.findOne({ 
            where: cond,
            include: [
                {
                    relation: "content_lesson",
                    scope: {
                        fields: ['id', 'lesson_name']
                    }
                },
                {
                    relation: "content_topic",
                    scope: {
                        fields: ['id', 'topic_name', 'topic_num']
                    }
                },
                {
                    relation: "created_by",
                    scope: {
                        fields: ['firstName', 'lastName']
                    }
                },
                {
                    relation: "modified_by",
                    scope: {
                        fields: ['firstName', 'lastName']
                    }
                },
            ]
        }, function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        }
        );
    }

    Textbookcontents.remoteMethod(
        'getContentById',
        {
            http: { path: '/getContentById', verb: 'post' },
            description: 'Get all content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Textbookcontents.getLessonContent = function (data, res, cb) {
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let msg = {};
        let cond = {};

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson_id id" };
            return cb(null, msg);
        }

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        if (section_id != undefined) {
            cond.section_id = { inq: section_id }
        }
        cond.lesson_id = lesson_id;
        cond.country_id = country_id;
        cond.status = 1

        Textbookcontents.find({
            where: cond,
            include: [
                {
                    relation: "content_lesson",
                    scope: {
                        fields: ['lesson_name']
                    }
                },
                {
                    relation: "content_topic",
                    scope: {
                        fields: ['id', 'topic_name', 'topic_num']
                    }
                },
            ] 
        }, function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        }
        );
    }

    Textbookcontents.remoteMethod(
        'getLessonContent',
        {
            http: { path: '/getLessonContent', verb: 'post' },
            description: 'Get Lesson Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Textbookcontents.getTopicContent = function (data, res, cb) {
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '') ? undefined : data.topic_id;
        let msg = {};
        let cond = {};

        if (topic_id == undefined) {
            msg = { status: false, message: "Please provide topic id" };
            return cb(null, msg);
        }

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        if (section_id != undefined) {
            cond.section_id = { inq: section_id }
        }
        cond.topic_id = topic_id;
        cond.country_id = country_id;
        cond.status = 1

        Textbookcontents.find({ 
            where: cond,
            include: [
                {
                    relation: "content_topic",
                    scope: {
                        fields: ['id', 'topic_name', 'topic_num']
                    }
                },
                {
                    relation: "content_lesson",
                    scope: {
                        fields: ['id', 'lesson_name']
                    }
                },
            ] 
        }, function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        }
        );
    }

    Textbookcontents.remoteMethod(
        'getTopicContent',
        {
            http: { path: '/getTopicContent', verb: 'post' },
            description: 'Get Topic Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    function execShellCommand(cmd) {
        return new Promise((resolve, reject) => {
        // const exec = require("child_process").exec;
        // // return new Promise((resolve, reject) => {
        //     exec(cmd, (error, stdout, stderr) => {
        //         if (error) {
        //             console.warn(error);
        //             // reject(error)
        //             // return false;
        //         } else if (stdout) {
        //             console.log(stdout); 
        //             // resolve(stdout ? true : false);
        //             // return false;
        //         } else {
        //             console.log(stderr);
        //             // return false;
        //             // reject(stderr);
        //         }     
        //         return stdout?true:false;       
        //     });
        // // });
            const stdout = execSync(cmd, {
            // env: {
            //   NODE_ENV: "production",
            // },
            });
            if(stdout){
                resolve(true);
            } else {
                console.log("error zip file del", stdout);
                reject("Error in deleting zip file");
            }
        })
    }

    let uploadFile = (contentFullPath,sybPath, content_id) => {      
       
        return new Promise((resolve, reject) => {
            // const form = new formData();
            // let url = 'http://localhost:4001/api/containers/uploadCntUnzippedFile?sybPath='+sybPath;
            let url = SETTINGS.SETTINGS.content_zip_path_upload+'?sybPath='+sybPath;
            // const buffer = fs.readFileSync(contentFullPath);        
            // console.log(url);
            // console.log("upload", buffer)
            // console.log("full path",fs.createReadStream(contentFullPath));
            if(fs.existsSync(contentFullPath)){
                //Do some operation on myData here
                const formData = {
                    // Pass data via Streams
                    files: fs.createReadStream(contentFullPath)
                    // files:myData
                    // path: sybPath
                };
                request.post({url:url,
                    formData: formData}, function optionalCallback(err, httpResponse, body) {
                    // console.log("Response ",httpResponse)
                    if (err) {
                        // console.log(contentFullPath);
                        console.error('upload failed:', err);
                        chngUploadStatus(content_id, 2, 2);                        
                        removeDirectory(sybPath);
                        // return false;
                        resolve(false);
                    } else if(httpResponse.statusCode == 201
                        || httpResponse.statusCode == 200){
                        console.log('Upload successful!  Server responded with:');
                        // return true;
                       resolve(true)
                    } else {
                        console.log('error: '+ httpResponse.statusCode)
                        console.log(body);
                        chngUploadStatus(content_id, 2, 2);
                        removeDirectory(sybPath);
                        // return false;
                        reject(false);
                    }             
                });
            } else {
                reject(false);
            }
        });          
    }

    let getLessonDetails = (lesson_id) => {
        return new Promise((resolve, reject ) => {
            let Lessons = Textbookcontents.app.models.lessons;

            Lessons.findOne({id: lesson_id}, function(err, lessonData) {
                if(err){
                    console.log("error", err)
                    reject(err);
                }
                console.log("lessonData", lessonData)
                if(lessonData){
                    resolve(lessonData);
                } else {
                    reject('Lesson not found');
                }
            });
        });        
    }


    Textbookcontents.downloadContent = function (data, res, cb) {
        let content_id = (data.content_id == undefined || data.content_id == null || data.content_id == '') ? undefined : data.content_id;
        let msg = {};

        if (content_id == undefined) {
            msg = { status: false, message: "Please provide content_id" };
            return cb(null, msg);
        }

        Textbookcontents.findOne({ where: { id: content_id }}, function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            if(result.content_type == 1 
                || result.content_type == 2
                || result.content_type == 3
                || result.content_type == 4
                || result.content_type == 5){
                result.path = SETTINGS.SETTINGS.storage_api_path+ result.path;
            }
            let obj = {
                board_id : result.board_id,
                class_id : result.class_id,
                subject_id : result.subject_id,
                lesson_id : result.lesson_id,
                version : result.version,
                content_type : result.content_type,
                zipPath : result.zipPath,
                path : result.path,
                status : result.status,
                created_by : result.created_by,
                modified_by : result.modified_by,
                created_on : result.created_on,
                modified_on : result.modified_on,
                id : result.id
            }
            msg = { status: true, data: obj };
            return cb(null, msg);
        });
    }

    Textbookcontents.remoteMethod(
        'downloadContent',
        {
            http: { path: '/downloadContent', verb: 'post' },
            description: 'Download content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    
    Textbookcontents.getEncryptionKey = function (data, res, cb) {
        let content_id = (data.content_id == undefined || data.content_id == null || data.content_id == '') ? undefined : data.content_id;
        let msg = {};

        if (content_id == undefined) {
            msg = { status: false, message: "Please provide content_id" };
            return cb(null, msg);
        }

        Textbookcontents.findOne({ 
            where: { id: content_id },
            fields: ['encryptionKey']
        }, function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Textbookcontents.remoteMethod(
        'getEncryptionKey',
        {
            http: { path: '/getEncryptionKey', verb: 'post' },
            description: 'get Encryption Key',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let removeDirectory = (dir) => {
        let delFile = execShellCommand('rm -rf ' + dir)
            .then((delVal) => {
                return delVal;
            });
        return delFile;
    }

    // async function main(file) {
    //     const storage = new Storage();
    //     const bucket = storage.bucket('lms-app');
    //     const zipFile = bucket.file(file);
        
    //     const customSource = {
    //       stream: function(offset, length) {
    //         return zipFile.createReadStream({
    //           start: offset,
    //           end: length && offset + length
    //         })
    //       },
    //       size: async function() {
    //         const objMetadata = (await zipFile.getMetadata())[0];
    //         return objMetadata.size;
    //       }
    //     };
    //     // unzipper.Open.custom()
      
    //     const directory = await unzipper.Open.custom(customSource);
    //     console.log('directory', directory);
    //     // ...
    //   }
      
      

};
