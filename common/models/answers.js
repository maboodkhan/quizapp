'use strict';

module.exports = function(Answers) {

    Answers.deleteOption = function (data, cb) {
        let msg = {};
        let id = (data.id == undefined || data.id == null || data.id == '' ? undefined : data.id);
        let rightAns = Answers.app.models.ques_right_answer;
        
        Answers.update({ id:id },{status: 5}, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            rightAns.update({ answer_id:id },{status: 5}, function (err, result) {
                if (err) {
                    console.log(err);
                    return cb(null, err);
                }            
                msg = { status: true, data: result };
                return cb(null, msg);
            });
        });
    }

    Answers.remoteMethod(
        'deleteOption',
        {
            http: { path: '/deleteOption', verb: 'post' },
            description: 'Get quiz sets user-wise details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
