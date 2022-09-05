'use strict';

module.exports = function(Homeworkdetails) {
    
    Homeworkdetails.getHomeDetails = function (data, cb) {
        let msg = {};
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return cb(null, msg);
        }

        Homeworkdetails.findOne({where: { id: homework_id },}, function (err, result) {
            if (err) { return cb(null, err); }
            let school_id = [];
            let class_id = [];
            let section_id = [];
            let subject_id = [];
            let response = JSON.parse(JSON.stringify(result));
            response.homeworkDetails.forEach(element => {
                school_id.push(element.school_id);
                class_id.push(element.class_id);
                section_id.push(element.section_id);
                subject_id.push(element.subject_id);
            });
            school_id = school_id.filter((v, i, a) => a.indexOf(v) === i);
            class_id = class_id.filter((v, i, a) => a.indexOf(v) === i);
            section_id = section_id.filter((v, i, a) => a.indexOf(v) === i);
            subject_id = subject_id.filter((v, i, a) => a.indexOf(v) === i);
            msg = {
                status: true,
                data: result,
                school_id: school_id,
                class_id: class_id,
                section_id: section_id,
                subject_id: subject_id
            }
            return cb(null, msg);
            // })
        });
    }

    Homeworkdetails.remoteMethod(
        'getHomeDetails',
        {
            http: { path: '/getHomeDetails', verb: 'post' },
            description: 'Get Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


};
