'use strict';
const  fstat = require('fs');
const path = require('path');
const SETTINGS = require('../../server/system-config');


module.exports = function(syllabusupload) {
    syllabusupload.uploadLessonLogo = function(req, res, cb) {

        syllabusupload.getApp(function (err, app) {
            if (err) return err;
            app.dataSources.fileUploadGoogle.connector.getFilename = function(uploadingFile, req, res) {
                const origFName = uploadingFile.name;
                // const extname = path.extname(origFName);
                // const curDate = new Date();
                // const curYear = curDate.getFullYear();
                // const curMonth = curDate.getMonth() + 1;
                // const curDay = curDate.getDate();
                // const fileName = "icons/"+"lesson_icons/"+curYear+'-'+curMonth+'-'+curDay+'/'+Math.random().toString().substr(2) + extname;
                // console.log(fileName);
                // return fileName;
                let class_id = req.query.class_id;
                let subject_id = req.query.subject_id;
                let lesson_id = req.query.lesson_id;
                const fileName = "icons/"+"lesson_icons/"+class_id+'/'+subject_id+'/'+lesson_id+'/'+ origFName;
                console.log(fileName);
                return fileName;
            };
        });

        syllabusupload.upload("marksharks-content",req, res, function(err, imgVal){
            if(err) {
                console.log(err);
                cb(null, err);
            }
            // console.log(imgVal.files);
            let url = {
                url:SETTINGS.SETTINGS.storage_api_path+imgVal.files.files[0].name,
                fileName: imgVal.files.files[0].name,
            };
            cb(null,url);
        });
    }

    syllabusupload.remoteMethod(
        'uploadLessonLogo',
        {
            http: {path: '/uploadLessonLogo', verb: 'post'},
            description: 'upload Lesson Logo',
            accepts:[
               {arg: 'req', type: 'object', http: {source: 'req'}},
               {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {root: true, type: 'object'}
        }
    );
};
