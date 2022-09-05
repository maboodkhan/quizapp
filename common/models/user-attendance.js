'use strict';

module.exports = function(Userattendance) {
    Userattendance.getTime = function(cb) {
        let currentTime = new Date();       
        let data = {currentTime: currentTime};
        cb(null, data);
    }

    Userattendance.remoteMethod(
        "getTime",
        {
            http: { path: '/gettime', verb: 'get' },
            description: 'Get current server time',
            accepts: [],
            returns: { root: true, type: 'json' }
        }
    );

    Userattendance.logAcceptTime = function(user_id, popup_time, cb) {       
        let accept_time = new Date();
        let inactive_time_val = Math.round((accept_time - new Date(popup_time))/1000);
        let inactive_time = 0;
        if(inactive_time_val > 60){
            inactive_time = inactive_time_val;
        }

       // console.log(accept_time_val.diff(popup_time_val,'seconds'));
        let userDetails = {
            user_id: user_id,
            popup_time: popup_time,
            accept_time: new Date(),
            inactive_time: inactive_time
        }
        // console.log(userDetails);
        let msg = {};
        Userattendance.create(userDetails, function(err, attendanceData){
            if(err) {
                console.log(err);
                msg.status = false;
                msg.message = err.message;
                return cb(null, msg);
            }
            
            msg.status = true;
            msg.message = "Accept time added successfully.";
            cb(null, msg);      
        });
    }

    Userattendance.remoteMethod(
        "logAcceptTime",
        {
            http: { path: '/logaccepttime', verb: 'post' },
            description: 'Add user acceptance time',
            accepts: [{ arg: 'user_id', type: 'number', 'required':true},
                { arg: 'popup_time', type: 'string', 'required':true}],
            returns: { root: true, type: 'json' }
        }
    );
};
