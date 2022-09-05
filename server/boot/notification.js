'use_strict';
const schedule = require('node-schedule');
const request = require("request");

module.exports = function(Notifications) {

    let scheduleNotifications = () => {
        let notifyData = getNotifications();
    }

    let getNotifications = () => {
        let Pushnotifications = Notifications.models.push_notifications;
        Pushnotifications.find({
            where: { status: 1 }
        }, function (err, result) {
            if (err) {
                console.log("error",err)
                return err;
            }
            result.forEach(async (nVal) => {
                let notification_id = nVal.id;
                let subNotificationTypeVal = await subNotificationType(nVal.subNotificationTypeId);
                nVal.subNotificationTypeVal = subNotificationTypeVal;
                let scheduleJobData = await scheduleJob(notification_id, nVal);
            });
            // console.log("result", result.length)
            // return result;
        });
    }

    let scheduleJob = (notification_id, data) => {
        return new Promise((resolve, reject) => {
            let uniqueJobName = String(notification_id);            
            let scheduleRuleValue = scheduleRule(data);
            if(data.status==1){              
                if(schedule.scheduledJobs[uniqueJobName]){
                    let current_job = schedule.scheduledJobs[uniqueJobName].cancel();
                }
                // console.log("uniqueJobName",scheduleRuleValue)
                var j = schedule.scheduleJob(uniqueJobName,{rule:scheduleRuleValue}, async function(jobData){                
                   
                    var App = require("../../server/server");
                    var requestUrl = 'http://localhost:' + App.get('port');
                    request.post({
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "url": requestUrl+'/api/push_notifications/execusertype',
                        "json": data
                    }, function (err, res) {
                        /* if (err) {
                            console.log(err);
                            reject(err.message);
                        }
                        // console.log(res.body);
                        if (res) {
                            if (res.body) {
                                if (res.body.status) {
                                    console.log(res.body.status)
                                } else {
                                    console.log(res.body.message);
                                }
                            }
                        } else {
                            console.log("error")
                        } */
                    }
                    );           
                });
            } else {
                let current_job = schedule.scheduledJobs[uniqueJobName];
                current_job.cancel()
            }
            resolve('Done');
        });        
    }

    let scheduleRule = (data) => {
        let dayHour = (data.dayHour == undefined || data.dayHour == null || data.dayHour == '' ? undefined : data.dayHour);
        let dayMinutes = (data.dayMinutes == undefined || data.dayMinutes == null || data.dayMinutes == '' ? undefined : data.dayMinutes);
        let subNotificationTypeVal = (data.subNotificationTypeVal!==null 
                                        && data.subNotificationTypeVal!=='' 
                                        && data.subNotificationTypeVal!==undefined) ? data.subNotificationTypeVal : undefined;
        let notifyScheduleDate = (data.notifyScheduleDate == undefined || data.notifyScheduleDate == null || data.notifyScheduleDate == '' ? null : data.notifyScheduleDate);
      
        var rule;
            // rule.dayOfWeek = [0, new schedule.Range(4, 6)];
        if(subNotificationTypeVal.type_value == 0){ //For a specific schedule Date
            // let scheduleDate = dateFormatter(notifyScheduleDate);
            let scheduleDate = new Date(notifyScheduleDate);
            rule = scheduleDate;
        } else if (subNotificationTypeVal.type_value == 'MONTHLY-1ST-DAY'){
            // rule = new schedule.RecurrenceRule();
            // rule.month = [1,12];
            // rule.date = 1;
            // rule.hour = dayHour;
            // rule.minute = dayMinutes;
            // console.log(rule)
            rule = dayMinutes+' '+dayHour+' '+'1 * *';
            // console.log(rule, new Date())
        } else {
            rule = new schedule.RecurrenceRule();
            let curDate = new Date();
            curDate = dateFormatter(curDate);
            curDate = new Date(curDate);
            let currYear = curDate.getFullYear();
            let currMonth = curDate.getMonth()+1;
            let currDate = curDate.getDate();
            curDate = currYear+'-'+currMonth+'-'+currDate+' '+dayHour+':'+dayMinutes+':00';
            // curDate = new Date(curDate).toISOString();
            curDate = new Date(curDate);
            curDate.setMinutes(curDate.getMinutes()-30);
            curDate.setHours(curDate.getHours()-5);
            dayHour = curDate.getHours();
            dayMinutes = curDate.getMinutes();
            rule.hour = dayHour;
            rule.minute = dayMinutes;
        }
        return rule;
    }

    let subNotificationType = (type_id) => {
        return new Promise((resolve,reject) => {
            let notificationType = Notifications.models.push_notification_master;
            notificationType.findOne({where : {id: type_id}}, function(err, typeRes) {
                if(err){
                    reject(err.message);
                }
                resolve(typeRes);
            });
        });        
    }

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

    scheduleNotifications();
}