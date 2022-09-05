'use strict';

module.exports = function (Homeworkfiles) {

    Homeworkfiles.deleteHWFile = async function (data, cb) {
        let msg = {};
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);
        let remark_id = (data.remark_id == undefined || data.remark_id == null ? undefined : data.remark_id);

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return cb(null, msg);
        }
        if (remark_id == undefined) {
            msg = { status: false, message: "Please provide remark id." };
            return cb(null, msg);
        }
        let response = await HWFileUpdate(homework_id, remark_id);
        await HWFileRemove(homework_id, remark_id);
        return response;
    }

    Homeworkfiles.remoteMethod(
        'deleteHWFile',
        {
            http: { path: '/deleteHWFile', verb: 'post' },
            description: 'delete File Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let HWFileUpdate = (homework_id, remark_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            Homeworkfiles.update({ homework_id: homework_id, remark_id: remark_id }, { status: 5 },
                function (err, res) {
                    if (err) { reject(err); }
                    msg = { status: true, message: "Homework file delete successfully" }
                    resolve(msg);
                });
        });
    }


    let HWFileRemove = (homework_id, remark_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Container = Homeworkfiles.app.models.container;
            Homeworkfiles.findOne({ where: { homework_id: homework_id, remark_id: remark_id } }, function (err, resFile) {
                if (err) { reject(err); }
                let homework = resFile.filepath.split("/");
                let filepath = homework[homework.length-2] + '/' + homework[homework.length-1];
                Container.removeFile("lms-app", "homework/"+filepath, function(err, result){
                    msg.status = true;
                    msg.message = "File removed successfully.";
                    resolve(msg);
                });
            });
        });
    }

};
