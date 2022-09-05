'use strict';

module.exports = function (Pushnotificationlogs) {

    Pushnotificationlogs.getlogs = function (data, cb) {
        let msg = {};
        let notificationReport = (data.notificationReport == undefined || data.notificationReport == null || data.notificationReport == '' ? undefined : data.notificationReport);
		let day = (data.day == undefined || data.day == null || data.day == '' ? undefined : data.day);

        if(notificationReport == undefined){
            msg = { status: false, message: "Please provide Notification Report" };
            return cb(null, msg);
        }
        if(day == undefined){
            msg = { status: false, message: "Please provide date" };
            return cb(null, msg);
        }

        let date = new Date();
        //date = dateFormatter(date);
        //date = new Date(date);

        switch (day) {
            case 1:
                date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
              break;
            case 2:
                date.setDate(date.getDate() - 2);
              break;
            case 3:
                date.setDate(date.getDate() - 3);
              break;
            case 4:
                date.setDate(date.getDate() - 7);
          }

        Pushnotificationlogs.find({
            where: {
                module: notificationReport,
                sent_on: {gte: date}
            },
            include: [
                {
                    relation: "sendToUser",
                    scope: {}
                },
                {
                    relation: "sendByUser",
                    scope: {}
                }
            ]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Pushnotificationlogs.remoteMethod(
        'getlogs',
        {
            http: { path: '/getlogs', verb: 'post' },
            description: 'Get Quiz Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let dateFormatter = (dt) => {
        var options = {
            timeZone: "Asia/Kolkata",
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        };
        
        var formatter = new Intl.DateTimeFormat([], options);
        var dateTime = formatter.format(new Date(dt));
        return dateTime;
    }

};



