'use strict';
const request = require('request');
const fs = require("fs");
const dirpath = require('path');
const SETTINGS = require('../../server/system-config');
//const storageApiPath = 'https://storage.googleapis.com/marksharks-content/app-content/';
const storageApiPath = SETTINGS.SETTINGS.storage_api_path_app;
const sevenBin = require('7zip-bin');
const Zip = require('node-7z');
const { execSync } = require("child_process");

module.exports = function (Appcontents) {

    Appcontents.getContent = function (data, res, cb) {
        let msg = {};
        let cond = {};
        // console.log(data);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        let lessonCond = {}
        if (lesson_id !== undefined) {
            // lessonCond = { lesson_id: { inq: lesson_id } };
            cond.lesson_id = { inq: lesson_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        if (subject_id != undefined) {
            cond.subject_id = { inq: subject_id }
        }

        Appcontents.find({
            where: {
                and: [
                    cond,
                    {
                        or: [
                            { status: 1 },
                            { status: 2 }
                        ]
                    }
                ]

            }
        }, function (err, res) {
            Appcontents.find({
                where: {
                    and: [
                        cond,
                        {
                            or: [
                                { status: 1 },
                                { status: 2 }
                            ]
                        }
                    ]

                },
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
                            fields: ['lesson_name', 'old_record_id']
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

    Appcontents.remoteMethod(
        'getContent',
        {
            http: { path: '/getContent', verb: 'post' },
            description: 'Get all content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Appcontents.createContent = function (data, res, cb) {
        let msg = {};
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '') ? undefined : data.board_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let version = (data.version == undefined || data.version == null || data.version == '') ? undefined : data.version;
        let encryptionKey = (data.encryptionKey == undefined || data.encryptionKey == null || data.encryptionKey == '') ? undefined : data.encryptionKey;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let created_on = (data.created_on == undefined || data.created_on == null || data.created_on == '') ? undefined : data.created_on;
        let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '') ? undefined : data.modified_by;

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
        if (version == undefined) {
            msg = { status: false, message: "Please provide version" };
            return cb(null, msg);
        }
        if (encryptionKey == undefined) {
            msg = { status: false, message: "Please provide encryption key" };
            return cb(null, msg);
        }
        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }

        Appcontents.findOne({ where: { lesson_id: lesson_id } }, async function (err, res) {
            if (err) {
                msg = { status: false, message: err.message };
                return cb(null, msg);
            }
            if (res == null) {
                Appcontents.upsert(data, function (err, result) {
                    if (err) {
                        msg = { status: false, message: err.message };
                        return cb(null, msg);
                    }

                    let extVal = contentDecompress(data, result.id);
                    if (extVal) {
                        msg = { status: true, data: result };
                    } else {
                        msg = { status: false, message: "Error in uploading content. Please try again." };
                    }

                    return cb(null, msg);
                });
            } else {
                msg = { status: false, message: "Content already available" };
                return cb(null, msg);
            }
        })

    }

    Appcontents.remoteMethod(
        'createContent',
        {
            http: { path: '/create', verb: 'post' },
            description: 'Create Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Appcontents.updateContent = function (data, res, cb) {
        let msg = {};
        let content_id = (data.content_id == undefined || data.content_id == null || data.content_id == '') ? 0 : data.content_id;
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '') ? undefined : data.board_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let version = (data.version == undefined || data.version == null || data.version == '') ? undefined : data.version;
        let encryptionKey = (data.encryptionKey == undefined || data.encryptionKey == null || data.encryptionKey == '') ? undefined : data.encryptionKey;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let created_on = (data.created_on == undefined || data.created_on == null || data.created_on == '') ? undefined : data.created_on;
        let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '') ? undefined : data.modified_by;

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
        if (version == undefined) {
            msg = { status: false, message: "Please provide version" };
            return cb(null, msg);
        }
        if (encryptionKey == undefined) {
            msg = { status: false, message: "Please provide encryption key" };
            return cb(null, msg);
        }
        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }

        // Appcontents.upsertWithWhere({ id: content_id }, data, function (err, result) {
        //     if (err) {
        //         return cb(null, err);
        //     }
        //     msg = { status: true, data: result };
        //     return cb(null, msg);
        // });
        Appcontents.findOne({ where: { lesson_id: lesson_id, id: { neq: content_id } } }, function (err, res) {
            if (err) {
                msg = { status: false, message: err.message };
                return cb(null, msg);
            }
            if (res == null) {
                Appcontents.findOne({ where: { lesson_id: lesson_id, id: content_id } }, function (err, cntData) {
                    if (err) {
                        msg = { status: false, message: err.message };
                        return cb(null, msg);
                    }
                    Appcontents.update({ id: content_id }, data, function (err, result) {
                        if (err) {
                            msg = { status: false, message: err.message };
                            return cb(null, msg);
                        }
                        // console.log(cntData.path,' != ',data.path)

                        if (cntData.path != data.path) { //Only allow extraction if user has uploaded new zip file                            
                            let extVal = contentDecompress(data, content_id);
                            if (extVal) {
                                let uploadStatus = chngUploadStatus(content_id, 0, data.status)
                                .then((statVal) => {
                                    if(statVal){
                                        return true;
                                    }
                                    return false;
                                });
                                if(uploadStatus){
                                    msg = { status: true, message: "Content updated successfully." };
                                }                                
                            } else {
                                msg = { status: false, message: "Error in uploading content. Please try again." };
                            }
                        } else {
                            msg = { status: true, message: "Content updated successfully." };
                        }


                        return cb(null, msg);

                    });
                });
            } else {
                msg = { status: false, message: "Content already available" };
                return cb(null, msg);
            }
        })
    }

    Appcontents.remoteMethod(
        'updateContent',
        {
            http: { path: '/update', verb: 'post' },
            description: 'Update Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Appcontents.getContentById = function (data, res, cb) {
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

        Appcontents.findOne({
            where: cond,
            include: [
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

    Appcontents.remoteMethod(
        'getContentById',
        {
            http: { path: '/getContentById', verb: 'post' },
            description: 'Get all content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Appcontents.getLessonContent = function (data, res, cb) {
        let content_id = (data.content_id == undefined || data.content_id == null || data.content_id == '') ? undefined : data.content_id;
        let msg = {};
        // console.log("content_id",content_id)

        if (content_id == undefined) {
            msg = { status: false, message: "Please provide content id" };
            return cb(null, msg);
        }

        Appcontents.findOne({ where: { id: content_id } }, function (err, result) {
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

    Appcontents.remoteMethod(
        'getLessonContent',
        {
            http: { path: '/getLessonContent', verb: 'post' },
            description: 'Get Lesson Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Appcontents.getActiveLessonContent = function (data, res, cb) {
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let msg = {};
        let cond = {};

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
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
        cond.uploadStatus = 1
        // console.log("lesson_id",lesson_id)

        Appcontents.findOne({ where: cond }, function (err, result) {
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

    Appcontents.remoteMethod(
        'getActiveLessonContent',
        {
            http: { path: '/getActiveLessonContent', verb: 'post' },
            description: 'Get Lesson Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let contentDecompress = async (sybData, content_id) => {
        try {
            // const lessonDetails = await getLessonDetails(sybData.lesson_id);
            // let lessonNum = lessonDetails.lesson_num;
            // lessonNum = lessonNum.length > 1 ? lessonNum : '0'+lessonNum;
            // let oldRecordId = lessonDetails.old_record_id;
            // const directory = await unzipper.Open.url(request,sybData.zipPath);
            let randFolderName = Math.random().toString().substr(2);
            const sybPath = sybData.board_id+'/'+sybData.class_id+'/'+sybData.subject_id+'/'+sybData.lesson_id+'/'+randFolderName;
            //const sybPath = sybData.board_id+'/'+sybData.class_id+'/'+sybData.subject_id+'/'+sybData.lesson_id+'/'+sybData.version;

            // directory full path
            const dir = './uploads/' + sybPath;
            // const dir1 = 'c:/OKS/lms-app/uploads/'+sybPath;
            const bucketName = 'marksharks-content';
            const bucketDir = "gs://" + bucketName + '/app-content/uploads/' + sybPath;
            // let contentFilePath = storageApiPath+'uploads/'+sybPath+'/'+oldRecordId+'/'+lessonNum+'/index.html';
            let contentFilePath = 'uploads/' + sybPath + '/index.html';

            await createDirectory(dirpath.join(__dirname, dir));
            let zipDownloadPath = dir + '/' + dirpath.basename(sybData.zipPath);
            let extractionPath = 'uploads/' + sybPath + '/';
            console.log('extract', extractionPath)
            let zipPath = storageApiPath + sybData.zipPath;
            let downloadFiles = await downloadZipFile(zipPath, zipDownloadPath, extractionPath, sybData.encryptionKey, bucketDir);
            // if(!downloadFiles){
            //     return false;
            // }
            await extractZipFile(zipDownloadPath, extractionPath, sybData.encryptionKey, bucketDir);
            let fileArr = await getAllFiles(extractionPath, bucketDir);
            // await Appcontents.update({id:content_id},{uploadStatus:0},function(err, upData){
            //     if(err){
            //         console.log("up error",err)
            //         return false;
            //     }
            //     return true;
            // });            
            await chngUploadStatus(content_id, 0, sybData.status);
            var c = 0;

            var interval = await setInterval(function () {
                let fileArrVal = fileArr[c];
                // console.log("fileArrVal ",fileArrVal);
                let returnVal;
                if (typeof fileArrVal === 'string') {
                    returnVal = uploadFile(fileArrVal, dirpath.dirname(fileArrVal), content_id).then(uploadVal => {
                        // console.log("UploadVal", uploadVal);
                        return JSON.parse(uploadVal);
                    });
                    // console.log("returnVal", returnVal);
                    if (!returnVal) {
                        clearInterval(interval);
                        chngUploadStatus(content_id, 2, 2); //Change download status to failed and status to inactive
                        return false;
                    }
                }
                c++;
                if (c >= fileArr.length) {
                    clearInterval(interval);
                    let updVal = Appcontents.update({ id: content_id }, { path: contentFilePath, uploadStatus: 1 }, function (err, upData) {
                        if (err) {
                            console.log("up error", err)
                            return false;
                        }
                        // console.log("Content File Path",contentFilePath);

                        return true;
                    });
                };
            }, 2000);
            if (!interval) {
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
            if (stdout) {
                resolve(true);
            } else {
                console.log("error zip file del", stdout);
                reject("Error in deleting zip file");
            }
        })
    }

    let getLessonDetails = (lesson_id) => {
        return new Promise((resolve, reject) => {
            let Lessons = Appcontents.app.models.lessons;

            Lessons.findOne({ id: lesson_id }, function (err, lessonData) {
                if (err) {
                    console.log("error", err)
                    reject(err);
                }
                // console.log("lessonData", lessonData)
                if (lessonData) {
                    resolve(lessonData);
                } else {
                    reject('Lesson not found');
                }
            });
        });
    }

    let downloadZipFile = (fileUrl, filePath, extractionPath, encryptionKey, bucketDir) => {
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
                .on('finish', () => {
                    console.log(`The file is finished downloading.`);
                    resolve(true);
                })
                .on('error', (err) => {
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
                if (data.status == 'extracted' && extension != '') {
                    let bucketFullPath = bucketDir + data.file;
                    // uploadFile(FilePath,dirpath.dirname(FilePath));
                }
                // doStuffWith(data) //? { status: 'extracted', file: 'extracted/file.txt" }
            })

            myStream.on('progress', function (progress) {
                //   console.log("Progress ", progress);
                // doStuffWith(progress) //? { percent: 67, fileCount: 5, file: undefinded }
            })

            myStream.on('end', function () {
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

    let getAllFiles = (dirPath, bucketFullPath, files = []) => {
        // let files = [];
        return new Promise((resolve, reject) => {
            let newFiles = fs.readdirSync(dirPath).forEach(function (file) {
                let filepath = dirpath.join(dirPath, file);
                // let filepath = dirPath + '/' +file;
                // console.log(filepath)
                let stat = fs.statSync(filepath);
                if (stat.isDirectory()) {
                    getAllFiles(filepath, bucketFullPath, files);
                } else {
                    return files.push(filepath);
                }
            });
            // console.log(files);
            resolve(files);
        });
    }

    let uploadFile = (contentFullPath, sybPath, content_id) => {

        return new Promise((resolve, reject) => {
            // const form = new formData();
            // let url = 'http://localhost:4001/api/containers/uploadUnzippedFile?sybPath=' + sybPath;
            let url = SETTINGS.SETTINGS.app_content_zip_path_upload+'?sybPath=' + sybPath;
            // const buffer = fs.readFileSync(contentFullPath);        
            // console.log(url);
            // console.log("upload", buffer)
            // console.log("full path",fs.createReadStream(contentFullPath));
            if (fs.existsSync(contentFullPath)) {
                //Do some operation on myData here
                const formData = {
                    // Pass data via Streams
                    files: fs.createReadStream(contentFullPath)
                    // files:myData
                    // path: sybPath
                };
                request.post({
                    url: url,
                    formData: formData
                }, function optionalCallback(err, httpResponse, body) {
                    // console.log("Response ",httpResponse)
                    if (err) {
                        // console.log(contentFullPath);
                        console.error('upload failed:', err);
                        chngUploadStatus(content_id, 2, 2);
                        removeDirectory(sybPath);
                        // return false;
                        resolve(false);
                    } else if (httpResponse.statusCode == 201
                        || httpResponse.statusCode == 200) {
                        console.log('Upload successful!  Server responded with:');
                        // return true;
                        resolve(true)
                    } else {
                        console.log('error: ' + httpResponse.statusCode)
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
            fs.mkdir(directoryPath.replace('common/models/', ''), { recursive: true }, (err) => {
                if (err) {
                    console.log('dir error ', err);
                    // throw err;
                }
                console.log("directory created successfully");
                resolve(true);
            });
        });
    }

    let chngUploadStatus = (content_id, uploadStatus, status = 1) => {
        return new Promise((resolve, reject) => {
            Appcontents.update({ id: content_id }, { uploadStatus: uploadStatus, status: status }, function (err, upData) {
                if (err) {
                    console.log("up error", err)
                    reject('Upload Status not changed');
                }
                // console.log("uploadStatus", uploadStatus)
                resolve(true);
            });
        });
    }

    let removeDirectory = (dir) => {
        let delFile = execShellCommand('rm -rf ' + dir)
            .then((delVal) => {
                return delVal;
            });
        return delFile;
    }


    Appcontents.downloadAppContent = function (data, res, cb) {
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let msg = {};

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson_id" };
            return cb(null, msg);
        }

        Appcontents.findOne({ where: { lesson_id: lesson_id } }, function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            
            let obj = {
                board_id: result.board_id,
                class_id: result.class_id,
                subject_id: result.subject_id,
                lesson_id: result.lesson_id,
                version: result.version,
                content_type: result.content_type,
                encryptionKey: result.encryptionKey,
                appZipPath: result.appZipPath,
                path: result.path,
                iconPath: result.iconPath,
                status: result.status,
                created_by: result.created_by,
                modified_by: result.modified_by,
                created_on: result.created_on,
                modified_on: result.modified_on,
                id: result.id
            }
            msg = { status: true, data: obj };
            return cb(null, msg);
        });
    }

    Appcontents.remoteMethod(
        'downloadAppContent',
        {
            http: { path: '/downloadAppContent', verb: 'post' },
            description: 'Download content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Appcontents.getAppEncryptionKey = function (data, res, cb) {
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let msg = {};

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson_id" };
            return cb(null, msg);
        }

        Appcontents.findOne({
            where: { lesson_id: lesson_id },
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

    Appcontents.remoteMethod(
        'getAppEncryptionKey',
        {
            http: { path: '/getAppEncryptionKey', verb: 'post' },
            description: 'get Encryption Key',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Appcontents.getappContent = function (data, res, cb) {
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let old_record_id = (data.old_record_id == undefined || data.old_record_id == null || data.old_record_id == '') ? undefined : data.old_record_id;
        let msg = {};
        var ds = Appcontents.dataSource;
        let cond = '';
        let params;

        if (old_record_id == undefined) {
            msg = { status: false, message: "Please provide old_record_id" };
            return cb(null, msg);
        }else{
            cond = cond + " and l.old_record_id = " + old_record_id
        }

        if (country_id != undefined) {
            cond = cond + " and ac.country_id = " + country_id
        }else{
        }

        if (class_id !== undefined) {
            cond = cond + " and ac.class_id IN(" + class_id.join() + ")";
        }

        if (section_id !== undefined) {
            cond = cond + " and ac.section_id IN(" + section_id.join() + ")";
        }

        // if (school_id != undefined) {
        //     cond.school_id = { inq: school_id }
        // }

        // if (class_id != undefined) {
        //     cond.class_id = { inq: class_id }
        // }

        // if (section_id != undefined) {
        //     cond.section_id = { inq: section_id }
        // }

        // console.log("lesson_id",lesson_id)


        var sql = `SELECT ac.*, l.old_record_id as old_lesson_id FROM app_contents ac
        join lessons l ON l.id = ac.lesson_id
        where ac.status=1 and ac.uploadStatus=1  ${cond}`

        ds.connector.query(sql, params, function (err, result) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });


        // Appcontents.findOne({ where: cond }, function (err, result) {
        //     if (err) {
        //         console.log(err);
        //         msg = { status: false, msg: err };
        //         return cb(null, msg);
        //     }
        //     msg = { status: true, data: result };
        //     return cb(null, msg);
        // });
    }

    Appcontents.remoteMethod(
        'getappContent',
        {
            http: { path: '/getappContent', verb: 'post' },
            description: 'Get Lesson Content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
