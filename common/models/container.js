'use strict';
const  fstat = require('fs');
const path = require('path');
const SETTINGS = require('../../server/system-config');


module.exports = function(Container) {
    
    Container.uploadFile = function(req, res, cb) {

        Container.getApp(function (err, app) {
            if (err) return err;            
            app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
                const origFName = uploadingFile.name;
                const extname = path.extname(origFName);
                const curDate = new Date();
                const curYear = curDate.getFullYear();
                const curMonth = curDate.getMonth() + 1;
                const fileName = "images/ques_images/"+curYear+'/'+curMonth+'/'+Math.random().toString().substr(2) + extname;
                // console.log(fileName);
                return fileName;
            };
        });

        Container.upload("lms-app",req, res, function(err, imgVal){
            if(err) {
                console.log(err);
                cb(null, err);
            }
            // console.log(imgVal.files);
            let url = {url:SETTINGS.SETTINGS.bucket_lmsapp+imgVal.files.upload[0].name};
            cb(null,url);
        });
    }

    Container.remoteMethod(
        'uploadFile',
        {
            http: {path: '/uploadfile', verb: 'post'},
            description: 'Upload Image',
            accepts:[
               {arg: 'req', type: 'object', http: {source: 'req'}},
               {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {root: true, type: 'object'}
        }
    );

    Container.afterRemote('uploadFile', function (ctx, res, callback) {
        // var arrStr = ctx.req.url.split(/[//]/);
        // var mkdirp = require('mkdirp');
        // var path = '../storage/images/' + arrStr[1];  //arrStr[1] is the container folder
        // mkdirp(path, function (err) {
        //     console.log(err);
        // });
       
        
   // console.log(ctx);
        callback();
    });

    Container.uploadHomeworkFile = function(req, res, cb) {
        let msg = {};
        Container.getApp(function (err, app) {
            if (err) {
                console.log(err)
                return err
            };            
            app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
                const origFName = uploadingFile.name;
                const extname = path.extname(origFName);
                const curDate = new Date();
                const curYear = curDate.getFullYear();
                const curMonth = curDate.getMonth() + 1;
                const curDay = curDate.getDate();
                const fileName = "homework/"+curYear+'-'+curMonth+'-'+curDay+'/'+Math.random().toString().substr(2) + extname;
                // console.log(fileName);
                return fileName;
            };
        });

        Container.upload("lms-app",req, res, function(err, imgVal){
            if(err) {
                // console.log(err);
                // cb(null, err);
                msg.status = false;
                msg.message = err.message;
                return cb(null, msg)
            } else {
                let allowedFileExts = ['jpg','jpeg','png','pdf','gif','txt', 'mp4', 'html'];
                let fileName = imgVal.files.files[0].name;
                let fileExt = fileName.split('.').pop();
                if(allowedFileExts.includes(fileExt)){
                    let url = {
                                status: true,
                                message: "File uploaded successfully.",
                                url: SETTINGS.SETTINGS.bucket_lmsapp+imgVal.files.files[0].name,
                                filename: imgVal.files.files[0].name
                            };
                    return cb(null,url);
                } else {
                    msg.status = false;
                    msg.message = "Only jpg, png, pdf, gif, mp4, html and txt files are allowed.";
                    console.log(msg)
                    return cb(null, msg);
                }
            }
        });
    }

    Container.remoteMethod(
        'uploadHomeworkFile',
        {
            http: {path: '/upload', verb: 'post'},
            description: 'Upload homework file',
            accepts:[
               {arg: 'req', type: 'object', http: {source: 'req'}},
               {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {root: true, type: 'object'}
        }
    );

    Container.uploadHwFile = function(req, res, cb) {

        Container.getApp(function (err, app) {
            if (err) return err;            
            app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
                const origFName = uploadingFile.name;
                const extname = path.extname(origFName);
                const curDate = new Date();
                const curYear = curDate.getFullYear();
                const curMonth = curDate.getMonth() + 1;
                const curDay = curDate.getDate();
                const fileName = "homework/"+curYear+'-'+curMonth+'-'+curDay+'/'+Math.random().toString().substr(2) + extname;
                // console.log(fileName);
                return fileName;
            };
        });

        Container.upload("lms-app",req, res, function(err, imgVal){
            if(err) {
                console.log(err);
                cb(null, err);
            }
            // console.log(imgVal.files);
            let url = {url:SETTINGS.SETTINGS.bucket_lmsapp+imgVal.files.upload[0].name};
            cb(null,url);
        });
    }

    Container.remoteMethod(
        'uploadHwFile',
        {
            http: {path: '/uploadhwfile', verb: 'post'},
            description: 'Upload Image',
            accepts:[
               {arg: 'req', type: 'object', http: {source: 'req'}},
               {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {root: true, type: 'object'}
        }
    );

    Container.removeHWFile = function(filepath, cb) {
        let msg = {};

        Container.removeFile("lms-app", "homework/"+filepath, function(err, result){
            if(err) {
                // console.log(err);
                msg.status = false;
                msg.message = "Error! Please try again.";
                return cb(null,msg);
            }
            // console.log(result)
            msg.status = true;
            msg.message = "File removed successfully.";
            return cb(null,msg);
        });
    }

    Container.remoteMethod(
        'removeHWFile',
        {
            http: {path: '/removeHWfile', verb: 'post'},
            description: 'Remove a file',
            accepts:[
               {arg: 'filepath', type: 'string', required: true}
            ],
            returns: {root: true, type: 'object'}
        }
    );

    Container.uploadContentFile = function(req, res, cb) {

        Container.getApp(function (err, app) {
            if (err) return err;            
            app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
                const origFName = uploadingFile.name;
                const extname = path.extname(origFName);
                // const curDate = new Date();
                // const curYear = curDate.getFullYear();
                // const curMonth = curDate.getMonth() + 1;
                // const curDay = curDate.getDate();
                // const fileName = "upload/"+curYear+'-'+curMonth+'-'+curDay+'/'+Math.random().toString().substr(2) + extname;
                // console.log(fileName);
                // return fileName;
                // const fileName = "app-content/"+req.query.class_id+'/'+origFName;
                let board_id = req.query.board_id;
                let school_id = req.query.school_id;
                let class_id = req.query.class_id;
                let subject_id = req.query.subject_id;
                let lesson_id = req.query.lesson_id;
                let topic_id = req.query.topic_id;
                const sybPath = school_id+'/'+board_id+'/'+class_id+'/'+subject_id+'/'+lesson_id+'/'+topic_id+'/'+Math.random().toString().substr(2) + extname;
                // console.log(req.query);
                // console.log(sybPath);
                const fileName = "msplus-content/uploads/"+sybPath;
                console.log(fileName);
                return fileName;
            };
        });

        Container.upload("marksharks-content",req, res, function(err, imgVal){
            if(err) {
                console.log(err);
                cb(null, err);
            }
            let uploadPath = imgVal.files.files[0].name.replace('msplus-content/', '');

            let url = {
                url:SETTINGS.SETTINGS.storage_api_path+imgVal.files.files[0].name,
                fileName: uploadPath
            };
            cb(null,url);
        });
    }

    Container.remoteMethod(
        'uploadContentFile',
        {
            http: {path: '/uploadContentFile', verb: 'post'},
            description: 'Upload Content',
            accepts:[
               {arg: 'req', type: 'object', http: {source: 'req'}},
               {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {root: true, type: 'object'}
        }
    );

    Container.uploadAppContent = function(req, res, cb) {

        Container.getApp(function (err, app) {
            if (err) return err;            
            app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
                const origFName = uploadingFile.name;
                const extname = path.extname(origFName);
                var sybPath;
                let board_id = req.query.board_id;
                let class_id = req.query.class_id;
                let subject_id = req.query.subject_id;
                let lesson_id = req.query.lesson_id;
                let version = req.query.version;
                let old_record_id = req.query.old_record_id;
                let appZipPath = req.query.appZipPath;
                let folderName = Math.random().toString().substr(2);
                if(appZipPath == "appZip"){
                    sybPath = board_id+'/'+class_id+'/'+subject_id+'/'+lesson_id+'/'+version+'/'+old_record_id + extname;
                    console.log(sybPath);
                }else{
                    sybPath = board_id+'/'+class_id+'/'+subject_id+'/'+lesson_id+'/'+Math.random().toString().substr(2) + extname;
                    console.log(sybPath);
                }
                
                // const sybPath = board_id+'/'+class_id+'/'+subject_id+'/'+lesson_id+'/'+Math.random().toString().substr(2) + extname;
                // console.log(req.query);
                // console.log(sybPath);
                const fileName = "app-content/uploads/"+sybPath;
                return fileName;
            };
        });

        Container.upload("marksharks-content",req, res, function(err, imgVal){
            if(err) {
                console.log(err);
                cb(null, err);
            }

            let uploadPath = imgVal.files.files[0].name.replace('app-content/', '');

            let url = {
                url:SETTINGS.SETTINGS.storage_api_path+imgVal.files.files[0].name,
                fileName: uploadPath
            };
            cb(null,url);
        });
    }

    Container.remoteMethod(
        'uploadAppContent',
        {
            http: {path: '/uploadAppContent', verb: 'post'},
            description: 'Upload App Content',
            accepts:[
               {arg: 'req', type: 'object', http: {source: 'req'}},
               {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {root: true, type: 'object'}
        }
    );

    Container.uploadUnzippedFile = function(req, res, cb) {
        // console.log("req",req.query)
        Container.getApp(function (err, app) {
            if (err) return err;
            
            app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
                // console.log("upload test", req)
                // console.log(uploadingFile)
                const origFName = uploadingFile.name;
                // const extname = path.extname(origFName);
                // const curDate = new Date();
                // const curYear = curDate.getFullYear();
                // const curMonth = curDate.getMonth() + 1;
                // const curDay = curDate.getDate();
                const fileName = "app-content/"+req.query.sybPath+'/'+origFName;
                // console.log("content file",fileName);
                return fileName;
            };
        });
        
        Container.upload("marksharks-content",req, res, function(err, imgVal){
            let msg = {};
            if(err) {
                console.log('Upload error',err);
                msg.status = false;
                msg.message = err.message;
                // cb(null, msg);
            } else if(imgVal){
                //msg = {status:true,url:"https://storage.googleapis.com/lms-app/"+imgVal.files.files[0].name};
                console.log(imgVal.files.files[0].name)
                msg.status = true;
                msg.url = SETTINGS.SETTINGS.storage_api_path+imgVal.files.files[0].name;
            } else {
                //msg = {status: false, message: "Upload Error. Please try again."};
                console.log("upload error 1")
                msg.status = false;
                msg.message = "Upload Error. Please try again.";
            }
            
            cb(null,msg);
        });
    }

    Container.remoteMethod(
        'uploadUnzippedFile',
        {
            http: {path: '/uploadUnzippedFile', verb: 'post'},
            description: 'Upload unzipped content file',
            accepts:[
               {arg: 'req', type: 'object', http: {source: 'req'}},
               {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {root: true, type: 'object'}
        }
    );

    Container.uploadCntUnzippedFile = function(req, res, cb) {
        // console.log("req",req.query)
        Container.getApp(function (err, app) {
            if (err) return err;
            
            app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
                // console.log("upload test", req)
                // console.log(uploadingFile)
                const origFName = uploadingFile.name;
                // const extname = path.extname(origFName);
                // const curDate = new Date();
                // const curYear = curDate.getFullYear();
                // const curMonth = curDate.getMonth() + 1;
                // const curDay = curDate.getDate();
                const fileName = "msplus-content/"+req.query.sybPath+'/'+origFName;
                // console.log("content file",fileName);
                return fileName;
            };
        });
        
        Container.upload("marksharks-content",req, res, function(err, imgVal){
            let msg = {};
            if(err) {
                console.log('Upload error',err);
                msg.status = false;
                msg.message = err.message;
                // cb(null, msg);
            } else if(imgVal){
                //msg = {status:true,url:"https://storage.googleapis.com/lms-app/"+imgVal.files.files[0].name};
                console.log(imgVal.files.files[0].name)
                msg.status = true;
                msg.url = SETTINGS.SETTINGS.storage_api_path+imgVal.files.files[0].name;
            } else {
                //msg = {status: false, message: "Upload Error. Please try again."};
                console.log("upload error 1")
                msg.status = false;
                msg.message = "Upload Error. Please try again.";
            }
            
            cb(null,msg);
        });
    }

    Container.remoteMethod(
        'uploadCntUnzippedFile',
        {
            http: {path: '/uploadCntUnzippedFile', verb: 'post'},
            description: 'Upload unzipped content file',
            accepts:[
               {arg: 'req', type: 'object', http: {source: 'req'}},
               {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {root: true, type: 'object'}
        }
    );

    Container.uploadSchoolLogo = function(req, res, cb) {

        Container.getApp(function (err, app) {
            if (err) return err;            
            app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
                const origFName = uploadingFile.name;
                const extname = path.extname(origFName);
                const curDate = new Date();
                const curYear = curDate.getFullYear();
                const curMonth = curDate.getMonth() + 1;
                const curDay = curDate.getDate();
                const fileName = "school-logos/"+curYear+'-'+curMonth+'-'+curDay+'/'+Math.random().toString().substr(2) + extname;
                // console.log(fileName);
                return fileName;
            };
        });

        Container.upload("lms-app",req, res, function(err, imgVal){
            if(err) {
                console.log(err);
                cb(null, err);
            }
            // console.log(imgVal.files);
            let url = {url:SETTINGS.SETTINGS.bucket_lmsapp+imgVal.files.files[0].name};
            cb(null,url);
        });
    }

    Container.remoteMethod(
        'uploadSchoolLogo',
        {
            http: {path: '/uploadSchoolLogo', verb: 'post'},
            description: 'Upload school logo',
            accepts:[
               {arg: 'req', type: 'object', http: {source: 'req'}},
               {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {root: true, type: 'object'}
        }
    );

};
