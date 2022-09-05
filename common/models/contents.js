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

module.exports = function (Contents) {

    Contents.getContent = function (data, res, cb) {
        let msg = {};
        // let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '') ? undefined : data.country_id;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        // let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '') ? undefined : data.board_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
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

        if (lesson_id != undefined) {
            cond.lesson_id = { inq: lesson_id }
        }

        if (topic_id != undefined) {
            cond.topic_id = { inq: topic_id }
        }        
        
        cond.status = status;

        Contents.find({where: cond}, function (err, res) {
            Contents.find({
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

    Contents.remoteMethod(
        'getContent',
        {
            http: { path: '/getContent', verb: 'post' },
            description: 'Get all content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Contents.createContent = function (data, res, cb) {
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
        let encryptionKey = (data.encryptionKey == undefined || data.encryptionKey == null || data.encryptionKey == '') ? undefined : data.encryptionKey;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let path = (data.path == undefined || data.path == null || data.path == '') ? undefined : data.path;
        let zipPath = (data.zipPath == undefined || data.zipPath == null || data.zipPath == '') ? undefined : data.zipPath;
        let content_type = (data.content_type == undefined || data.content_type == null || data.content_type == '') ? undefined : data.content_type;
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
        // if (encryptionKey == undefined) {
        //     msg = { status: false, message: "Please provide encryption key" };
        //     return cb(null, msg);
        // }

        if (path == undefined) {
            msg = { status: false, message: "Please provide Content Path" };
            return cb(null, msg);
        }
        
        if (content_type == undefined) {
            msg = { status: false, message: "Please provide content Type" };
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
            encryptionKey: encryptionKey,
            status: status,
            path: path,
            zipPath: zipPath,
            content_type: content_type,
            created_by: created_by,
            modified_by: created_by,
            created_on: created_on,
            modified_by: modified_by
        }

        Contents.findOne({where: {topic_id: topic_id, title: title}}, function(err, res){
            if(res){
                msg = {status: false, message: "Title already exist on this topic"}
                return cb(null, msg);
            }else{
                Contents.upsert(saveObj, function (err, result) {
                    if (err) {
                        return cb(null, err);
                    }
                    if(content_type == 1){
                        contentDecompress(saveObj, result.id); 
                    }
        
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
            }
        })
    }

    Contents.remoteMethod(
        'createContent',
        {
            http: { path: '/create', verb: 'post' },
            description: 'Create Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Contents.updateContent = function (data, res, cb) {
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
        let encryptionKey = (data.encryptionKey == undefined || data.encryptionKey == null || data.encryptionKey == '') ? undefined : data.encryptionKey;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let path = (data.path == undefined || data.path == null || data.path == '') ? undefined : data.path;
        let zipPath = (data.zipPath == undefined || data.zipPath == null || data.zipPath == '') ? undefined : data.zipPath;
        let content_type = (data.content_type == undefined || data.content_type == null || data.content_type == '') ? undefined : data.content_type;
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
        if (content_type == undefined) {
            msg = { status: false, message: "Please provide content Type" };
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
            encryptionKey: encryptionKey,
            status: status,
            path: path,
            zipPath: zipPath,
            content_type: content_type,
            modified_by: modified_by,
        }

        Contents.findOne({where: {topic_id: topic_id, title: title, id: {neq: content_id}}}, function(err, res){
            if(res){
                msg = {status: false, message: "Title already exist on this topic"}
                return cb(null, msg);
            }else{
                Contents.findOne({ where: { id: content_id } }, function (err, cntData) {
                //     if (res==null) {
                        Contents.update({ id: content_id }, updateObj, function (err, result) {
                            if (err) {
                                return cb(null, err);
                            }
                            // console.log(">>>>>>>>>>>>>...............",result);
                            if(content_type == 1){
                                // contentDecompress(updateObj, content_id);
                                if(cntData.path != data.path){ //Only allow extraction if user has uploaded new zip file
                                    let extVal = contentDecompress(data, content_id);
                                    if(extVal){
                                        let uploadStatus = chngUploadStatus(content_id, 0, data.status)
                                        .then((statVal) => {
                                            if(statVal){
                                                return true;
                                            }
                                            return false;
                                        });
                                        if(uploadStatus){
                                            msg = { status: true, message: "Record updated successfully." };
                                        }                                
                                    } else {
                                        msg = { status: false, message: "Error in uploading content. Please try again." };
                                    }
                                } else {
                                    msg = { status: true, message: "Record updated successfully." };
                                }
                            } else {
                                msg = { status: true, message: "Record updated successfully." };
                            }
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

    Contents.remoteMethod(
        'updateContent',
        {
            http: { path: '/update', verb: 'post' },
            description: 'Update Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    

    Contents.getContentById = function (data, res, cb) {
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

        Contents.findOne({ 
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

    Contents.remoteMethod(
        'getContentById',
        {
            http: { path: '/getContentById', verb: 'post' },
            description: 'Get all content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Contents.getLessonContent = function (data, res, cb) {
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

        Contents.find({
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

    Contents.remoteMethod(
        'getLessonContent',
        {
            http: { path: '/getLessonContent', verb: 'post' },
            description: 'Get Lesson Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Contents.getTopicContent = function (data, res, cb) {
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

        Contents.find({ 
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

    Contents.remoteMethod(
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

    let contentDecompress = async (sybData, content_id) => {
        try {
            // const lessonDetails = await getLessonDetails(sybData.lesson_id);
            // let lessonNum = lessonDetails.lesson_num;
            // lessonNum = lessonNum.length > 1 ? lessonNum : '0'+lessonNum;
            // let oldRecordId = lessonDetails.old_record_id;
            // const directory = await unzipper.Open.url(request,sybData.zipPath);
            let randFolderName = Math.random().toString().substr(2);
            const sybPath = sybData.school_id+'/'+sybData.board_id+'/'+sybData.class_id+'/'+sybData.subject_id+'/'+sybData.lesson_id+'/'+sybData.topic_id+'/'+content_id+'/'+randFolderName;
            //const sybPath = sybData.school_id+'/'+sybData.board_id+'/'+sybData.class_id+'/'+sybData.subject_id+'/'+sybData.lesson_id+'/'+sybData.topic_id+'/'+content_id+'/'+sybData.version;

            // directory full path
            const dir = './uploads/schools/'+sybPath;
            // const dir1 = 'c:/OKS/lms-app/uploads/'+sybPath;
            const bucketName = 'marksharks-content';
            const bucketDir = "gs://"+bucketName+'/msplus-content/uploads/'+sybPath;
            // let contentFilePath = storageApiPath+'uploads/'+sybPath+'/'+oldRecordId+'/'+lessonNum+'/index.html';
            let contentFilePath = 'uploads/'+sybPath+'/index.html';            
            
            await createDirectory(dirpath.join(__dirname, dir));
            // await createDirectory(dir);
            let zipDownloadPath  = dir + '/' + dirpath.basename(sybData.zipPath);
            let extractionPath = 'uploads/'+sybPath +'/';
            console.log('extract',extractionPath);
            let zipPath = storageApiPath+sybData.zipPath;
            console.log('Zip Path', zipPath);
            let downloadFiles = await downloadZipFile(zipPath, zipDownloadPath, extractionPath, sybData.encryptionKey, bucketDir);
            // if(!downloadFiles){
            //     return false;
            // }
            await extractZipFile(zipDownloadPath, extractionPath, sybData.encryptionKey, bucketDir);
            let fileArr = await getAllFiles(extractionPath, bucketDir);
            // await Contents.update({id:content_id},{uploadStatus:0},function(err, upData){
            //     if(err){
            //         console.log("up error",err)
            //         return false;
            //     }
            //     return true;
            // });            
            await chngUploadStatus(content_id, 0, sybData.status);
            var c = 0;
                    
            var interval = await setInterval(function() { 
                let fileArrVal = fileArr[c];
                // console.log("fileArrVal ",fileArrVal);
                let returnVal;
                if (typeof fileArrVal === 'string') {
                    returnVal = uploadFile(fileArrVal,dirpath.dirname(fileArrVal), content_id).then(uploadVal => {
                        // console.log("UploadVal", uploadVal);
                        return JSON.parse(uploadVal);
                    });
                    // console.log("returnVal", returnVal);
                    if(!returnVal){
                        clearInterval(interval);
                        chngUploadStatus(content_id, 2, 2); //Change download status to failed and status to inactive
                        return false;
                    }
                }
                c++; 
                if(c >= fileArr.length) {
                    clearInterval(interval);
                    let updVal = Contents.update({id:content_id},{path: contentFilePath, uploadStatus:1},function(err, upData){
                        if(err){
                            console.log("up error",err)
                            return false;
                        }
                        // console.log("Content File Path",contentFilePath);
                        
                        return true;
                    });
                };
            }, 2000);
            if(!interval){
                chngUploadStatus(content_id, 2, 2); //Change download status to failed and status to inactive
                return false;
            }
            return true;
        } catch (error) {
            console.log(error);
            chngUploadStatus(content_id, 2, 2); //Change download status to failed and status to inactive
            return false;
        }        
    }

    let downloadZipFile =  (fileUrl, filePath, extractionPath, encryptionKey, bucketDir) => {
        /* Create an empty file where we can save data */
        let file = fs.createWriteStream(filePath);
        /* Using Promises so that we can use the ASYNC AWAIT syntax */        
        return new Promise((resolve, reject) => {
            let stream = request({
                /* Here you should specify the exact link to the file you are trying to download */
                uri: fileUrl,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive'
                },
                /* GZIP true for most of the websites now, disable it if you don't need it */
                gzip: true
            })
            .pipe(file)
            .on('finish',  () => {
                console.log(`The file is finished downloading.`);                
                    resolve(true);
            })
            .on('error',(err) => {
                reject(err)
            })
        });        
    }

    let extractZipFile = (zipFilePath, extractFolderPath, encryptionKey, bucketDir) => {
        return new Promise((resolve, reject) => {
            const pathTo7zip = sevenBin.path7za;
            const myStream = Zip.extractFull(zipFilePath, extractFolderPath, {
                recursive: true,
              $bin: pathTo7zip,
              $progress: true,
              password: encryptionKey,
              $ai: true
            })
            
            myStream.on('data', async function (data) {
               
                    // console.log(data.file);
                    let FilePath = extractFolderPath + data.file;
                    let extension = dirpath.extname(FilePath);
                    if(data.status == 'extracted' && extension!='') {
                        let bucketFullPath = bucketDir + data.file;                        
                        // uploadFile(FilePath,dirpath.dirname(FilePath));
                    }               
                // doStuffWith(data) //? { status: 'extracted', file: 'extracted/file.txt" }
              })
              
              myStream.on('progress', function (progress) {
                //   console.log("Progress ", progress);
                // doStuffWith(progress) //? { percent: 67, fileCount: 5, file: undefinded }
              })
              
              myStream.on('end',  function () {               
                resolve(true);
                // end of the operation, get the number of folders involved in the operation
                // myStream.info.get('Folders') //? '4'
              });
              
              myStream.on('error', (err) => {
                console.log(err);
                removeDirectory(extractFolderPath);
                reject(err);
              });
        });
    }

    let getAllFiles = (dirPath, bucketFullPath, files=[]) => {
        // let files = [];
        return new Promise((resolve, reject) => {
            let newFiles = fs.readdirSync(dirPath).forEach(function(file) {
                let filepath = dirpath.join(dirPath , file);
                // let filepath = dirPath + '/' +file;
                // console.log(filepath)
                let stat= fs.statSync(filepath);
                if (stat.isDirectory()) {            
                    getAllFiles(filepath, bucketFullPath,files);
                } else {
                    return files.push(filepath);
                }    
            });  
            // console.log(files);
            resolve(files);
        });        
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

    let createDirectory = (directoryPath) => {
        return new Promise((resolve, reject) => {
            fs.mkdir(directoryPath.replace('common/models/',''), { recursive: true }, (err) => {
                if (err) {
                    console.log('dir error ',err);
                    // throw err;
                }
                console.log("directory created successfully");
                resolve(true);
            });
        });
    }

    let chngUploadStatus = (content_id, uploadStatus, status=1) => {
        return new Promise((resolve, reject) => {
            Contents.update({id:content_id},{uploadStatus:uploadStatus, status: status},function(err, upData){
                if(err){
                    console.log("up error",err)
                    reject('Upload Status not changed');
                }
                // console.log("uploadStatus", uploadStatus)
                resolve(true);
            });
        });
    }

    let getLessonDetails = (lesson_id) => {
        return new Promise((resolve, reject ) => {
            let Lessons = Contents.app.models.lessons;

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


    Contents.downloadContent = function (data, res, cb) {
        let content_id = (data.content_id == undefined || data.content_id == null || data.content_id == '') ? undefined : data.content_id;
        let msg = {};

        if (content_id == undefined) {
            msg = { status: false, message: "Please provide content_id" };
            return cb(null, msg);
        }

        Contents.findOne({ where: { id: content_id }}, function (err, result) {
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

    Contents.remoteMethod(
        'downloadContent',
        {
            http: { path: '/downloadContent', verb: 'post' },
            description: 'Download content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    
    Contents.getEncryptionKey = function (data, res, cb) {
        let content_id = (data.content_id == undefined || data.content_id == null || data.content_id == '') ? undefined : data.content_id;
        let msg = {};

        if (content_id == undefined) {
            msg = { status: false, message: "Please provide content_id" };
            return cb(null, msg);
        }

        Contents.findOne({ 
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

    Contents.remoteMethod(
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
      
    let getCouponHierarchyDetail = (couponCode) => {
        return new Promise((resolve, reject) => {
            var ds = Contents.dataSource;
            let params;
            let cond = "where 1";
            if(couponCode != undefined) {
                cond += " and c.couponCode = '"+couponCode+"'";
            }
           
            var sql = `SELECT cd.class_id, cd.subject_id, cd.lesson_id, cd.topic_id FROM coupons c join coupon_details cd on c.id = cd.coupon_id ${cond}`;

            return ds.connector.query(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    let getCouponDetail = (couponCode, school_id) => {
        let couponCond = {};
        if(couponCode != undefined) {
            couponCond.couponCode = couponCode;
        }
        if(school_id != undefined) {
            couponCond.school_id = school_id;
        }
        return new Promise((resolve, reject) => {
            let Coupondatas = Contents.app.models.Coupons;
            Coupondatas.findOne({
                where:  couponCond
            }, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    } 

    let getCouponSchool = (coupon_id, school_id) => {
        let cond = {};
        if(coupon_id != undefined) {
            cond.coupon_id = coupon_id;
        }
        if(school_id != undefined) {
            cond.school_id = school_id;
        }
        return new Promise((resolve, reject) => {
            let Coupondatas = Contents.app.models.school_coupons;
            Coupondatas.findOne({
                where:  cond
            }, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    } 

    let getCouponUserDetail = (school_id, couponCode, email, phone, user_id) => {
        let condCouponUser = {};
        if (email != undefined) {
            condCouponUser.email = email;
        }
        if (phone != undefined) {
            condCouponUser.phone = phone;
        }
        if (user_id != undefined) {
            condCouponUser.user_id = user_id;
        }
        if (couponCode != undefined) {
            condCouponUser.couponCode = couponCode;
        }
        if (school_id != undefined) {
            condCouponUser.school_id = school_id;
        }
        return new Promise((resolve, reject) => {
            let Couponuserdata = Contents.app.models.coupon_users;
            Couponuserdata.findOne({
                where: condCouponUser,
            }, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    let getSchoolCouponAttempts = (couponCode, school_id) => {
        return new Promise((resolve, reject) => {
            var ds = Contents.dataSource;
            let params;
            let cond = "where 1";
            if(couponCode != undefined) {
                cond += " and couponCode = '"+couponCode+"'";
            }
            if(school_id != undefined) {
                cond += " and school_id = '"+school_id+"'";
            }

            var sql = `SELECT SUM(noOfAttempt) AS totalAttempt FROM coupon_users ${cond}`;

            return ds.connector.query(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    let getContent = (class_id, subject_id, lesson_id, topic_id) => {
        let cond = {};
        cond.status = 1;
        if (class_id.length > 0) {
            cond.class_id = { inq: class_id }
        }
        if (subject_id.length > 0) {
            cond.subject_id = { inq: subject_id }
        }
        if (lesson_id.length > 0) {
            cond.lesson_id = { inq: lesson_id }
        }
        if (topic_id.length > 0) {
            cond.topic_id = { inq: topic_id }
        }
        return new Promise((resolve, reject) => {
            Contents.find({
            where: cond,
            //skip: offset,
            //limit: limit,
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
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    Contents.getSchoolContent = async function (data, res, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let couponCode = (data.couponCode == undefined || data.couponCode == null || data.couponCode == '') ? undefined : data.couponCode;
        let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
        let phone = (data.phone == undefined || data.phone == null || data.phone == '') ? undefined : data.phone;
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        
        if (school_id === undefined) {
            msg = { status: false, message: "Please provide School ID" };
            return cb(null, msg);
        }

        if (couponCode === undefined) {
            msg = { status: false, message: "Please provide Coupon Code" };
            return cb(null, msg);
        }

        if (email === undefined) {
            msg = { status: false, message: "Please provide Email" };
            return cb(null, msg);
        }
        
        let couponDetail = await getCouponDetail(couponCode);  
        if(couponDetail === null) {
            msg = { status: false, message: "Wrong coupon code entered." };
            return cb(null, msg);
        }                     
        
        let couponSchool = await getCouponSchool(couponDetail.id, school_id);
        if(couponSchool === null) {
            msg = { status: false, message: "Given Coupon code is not assigned to the given School ID." };
            return cb(null, msg);
        }

        let currentDate = new Date();
        let couponExpiryDate = new Date(couponDetail.expiration_date);
        if(currentDate >= couponExpiryDate) {
            msg = { status: false, message: "Coupon Code Expired. Please contact to Markshark Support." };
            return cb(null, msg);
        }

        let schoolCouponAttempts = await getSchoolCouponAttempts(couponCode, school_id);
        if(schoolCouponAttempts[0].totalAttempt >= couponDetail.num_attempts) {
            msg = { status: false, message: "User reached the total number of attempts. Please contact Markshark Support." };
            return cb(null, msg);
        }        
        
        let couponUserDetail = await getCouponUserDetail(school_id, couponCode, email, phone, user_id);
        let Couponusers = Contents.app.models.coupon_users;
        //console.log(couponUserDetail);
        if(couponUserDetail === null) {
            let obj = {
                school_id: school_id,
                coupon_id: couponDetail.id,
                email: email,
                couponCode: couponCode,
                noOfAttempt: 1
            }
            Couponusers.upsert(obj, function (err, response) {
                if (err) {
                    msg = { status: false, message: err };
                    return cb(null, msg);
                }
            });
        } else {
            let obj = {
                noOfAttempt: couponUserDetail.noOfAttempt+1
            }
            Couponusers.upsertWithWhere({ "id":couponUserDetail.id  }, obj, function (err, data1) {
                if (err) {
                    msg = { status: false, message: err };
                    cb(null, msg);
                }    
            });
        }
        
        
        let couponHierarchyDetail = await getCouponHierarchyDetail(couponCode);
        //console.log(couponHierarchyDetail);
        let class_ids = [];
        let subject_ids = [];
        let lesson_ids = [];
        let topic_ids = [];
        for(let i=0; i < couponHierarchyDetail.length; i++) {
            if(couponHierarchyDetail[i].class_id != 0) {
                class_ids.push(couponHierarchyDetail[i].class_id);
            }
            if(couponHierarchyDetail[i].subject_id != 0) {
                subject_ids.push(couponHierarchyDetail[i].subject_id);
            }
            if(couponHierarchyDetail[i].lesson_id != 0) {
                lesson_ids.push(couponHierarchyDetail[i].lesson_id);
            }
            if(couponHierarchyDetail[i].topic_id != 0) {
                topic_ids.push(couponHierarchyDetail[i].topic_id);
            }
        }
        
        let fetchedContent = await getContent(class_ids, subject_ids, lesson_ids, topic_ids);
        return fetchedContent;
    }

    Contents.remoteMethod(
        'getSchoolContent',
        {
            http: { path: '/getSchoolContent', verb: 'post' },
            description: 'Get all content Wizenoze',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Contents.getContentByIdWN = function (data, res, cb) {
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let content_id = (data.content_id == undefined || data.content_id == null || data.content_id == '') ? undefined : data.content_id;
        let couponCode = (data.couponCode == undefined || data.couponCode == null || data.couponCode == '') ? undefined : data.couponCode;
        let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
        let phone = (data.phone == undefined || data.phone == null || data.phone == '') ? undefined : data.phone;
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        let msg = {};
        let cond = {};

        if (couponCode == undefined) {
            msg = { status: false, message: "Please provide coupon code" };
            return cb(null, msg);
        }

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
        cond.id = content_id;

        Contents.findOne({ 
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
        }, async function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            } else {
                let couponDetail = await getCouponDetail(couponCode);
                if(couponDetail == null) {
                    msg = { status: false, message: "Wrong coupon code entered." };
                    return cb(null, msg);
                }

                let couponUserDetail = await getCouponUserDetail(couponCode, email, phone, user_id);
                if(couponUserDetail == null) {
                    msg = { status: false, message: "Entered coupon code not assigned to given user." };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        }
        );
    }

    Contents.remoteMethod(
        'getContentByIdWN',
        {
            http: { path: '/getContentByIdWN', verb: 'post' },
            description: 'Get Wizenoze content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
