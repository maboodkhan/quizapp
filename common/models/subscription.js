'use strict';
const request = require("request");
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const SETTINGS = require('../../server/system-config');

module.exports = function (Subscription) {

    Subscription.createSubscription = async function (data, cb) {
        let msg = {};
        let firstName = (data.firstName == undefined || data.firstName == null || data.firstName == '' ? undefined : data.firstName);
        let email = (data.email == undefined || data.email == null || data.email == '' ? undefined : data.email);
        let subscription_id = (data.subscription_id == undefined || data.subscription_id == null || data.subscription_id == '' ? 0 : data.subscription_id);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let payment_response_id = (data.payment_response_id == undefined || data.payment_response_id == null || data.payment_response_id == '' ? undefined : data.payment_response_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        // let start_date = (data.start_date == undefined || data.start_date == null || data.start_date == '' ? undefined : data.start_date);
        // let end_date = (data.end_date == undefined || data.end_date == null || data.end_date == '' ? undefined : data.end_date);
        let amount = (data.amount == undefined || data.amount == null || data.amount == '' ? undefined : data.amount);
        let discount_amt = (data.discount_amt == undefined || data.discount_amt == null || data.discount_amt == '' ? 0 : data.discount_amt);
        let paid_amount = (data.paid_amount == undefined || data.paid_amount == null || data.paid_amount == '' ? undefined : data.paid_amount);
        let frequency_value = (data.frequency_value == undefined || data.frequency_value == null || data.frequency_value == '' ? undefined : data.frequency_value);
        let status = (data.status == undefined || data.status == null) ? undefined : data.status;

        try {

            if (email == undefined) {
                msg = { status: false, message: "Please provide email" };
                return msg;
            }

            if (user_id == undefined) {
                msg = { status: false, message: "Please provide user id" };
                return msg;
            }

            if (subscription_id == undefined) {
                msg = { status: false, message: "Please provide subscription id" };
                return msg;
            }

            if (payment_response_id == undefined) {
                msg = { status: false, message: "Please provide payment response id" };
                return msg;
            }

            if (school_id == undefined) {
                msg = { status: false, message: "Please provide school id" };
                return msg;
            }

            if (class_id == undefined) {
                msg = { status: false, message: "Please provide class id" };
                return msg;
            }
    
            if (frequency_value == undefined) {
                msg = { status: false, message: "Please provide frequency value" };
                return msg;
            }
    
            if (typeof frequency_value !== 'number') {
                msg = { status: false, message: "Please provide valid frequency value" };
                return msg;
            }

            if (amount == undefined) {
                msg = { status: false, message: "Please provide amount" };
                return msg;
            }
               
            if (paid_amount == undefined) {
                msg = { status: false, message: "Please provide paid amount" };
                return msg;
            }
    
            if (status == undefined) {
                msg = { status: false, message: "Please provide status" };
                return msg;
            }
    
            let addSubscriptionData = await addSubscription(data);
            data.subscriptionId = addSubscriptionData.id;
            let addSubDetailsData = await addSubscriptionDetails(data);
            if(addSubscriptionData){
                let mailData = subscriptionMail(firstName, email);
            }
           
            msg = {status: true, message: "Payment done successfully."};
            return msg;

        } catch(error) {
            console.log(error)
            msg = {status: false, message: error.message};
            return msg;
        }
        

    }

    Subscription.remoteMethod(
        'createSubscription',
        {
            http: { path: '/createSubscription', verb: 'post' },
            description: 'Create Subscription',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let addSubscription = (data) => {
        return new Promise((resolve,reject) => {
            let start_date = new Date(); 
            let end_date = new Date();
            end_date.setMonth((end_date.getMonth())+data.frequency_value);
            start_date = dateFormatter(start_date);
            start_date = new Date(start_date);
            end_date = dateFormatter(end_date);
            end_date = new Date(end_date);
            start_date = start_date.getFullYear() + '-' + (start_date.getMonth() + 1) + '-' + start_date.getDate() + ' ' + start_date.getHours() + ":" + start_date.getMinutes();
            end_date = end_date.getFullYear() + '-' + (end_date.getMonth() + 1) + '-' + end_date.getDate() + ' ' + end_date.getHours() + ":" + end_date.getMinutes();
            
            let newSubscription = {
                user_id: data.user_id,
                start_date: start_date,
                end_date: end_date,
                payment_response_id: data.payment_response_id,
                paid_amount: data.paid_amount,
                status: data.status
            }
            // console.log(newSubscription)
    
            Subscription.upsert( newSubscription, function (err, result) {
                if (err) {
                    // console.log(err);
                    //return cb(null, err);
                    reject(err.message);
                } else {
                   resolve(result);
                }
            });
        })
    }

    let addSubscriptionDetails = (data) => {
        return new Promise((resolve,reject) => {
                        
            let subDetails = {
                subscription_id: data.subscriptionId,
                user_id: data.user_id,
                school_id: data.school_id,
                class_id: data.class_id,
                amount: data.amount,
                discount_amt: data.discount_amt,
                total_amount: data.paid_amount
            }
            // console.log(subDetails)
            
            let subscriptionDetails = Subscription.app.models.subscription_details;
            subscriptionDetails.upsert( subDetails, function (err, result) {
                if (err) {
                    // console.log(err);
                    //return cb(null, err);
                    reject(err.message);
                } else {
                   resolve(true);
                }
            });
        });
    }

    Subscription.getUserSubscription = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }

        let cond = '';

        if(school_id !== undefined){
            cond += ` and school_id IN(${school_id})`;
        }

        if(class_id !== undefined){
            cond += ` and class_id IN(${class_id})`;
        }

        var ds = Subscription.dataSource;
      
        // console.log(sql);

        var countSql = `select count(*) as totalCount from subscriptions s 
        join subscription_details sd on s.id = sd.subscription_id
        where s.user_id=${user_id} ${cond}`;
 
        var sql = `select s.* from subscriptions s 
        join subscription_details sd on s.id = sd.subscription_id
        where s.user_id=${user_id} ${cond}
        ORDER BY s.created_on desc LIMIT ${offset},${limit};`

        let params;
        ds.connector.query(countSql, params, function (err, countData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            ds.connector.query(sql, params, function (err, subData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                let countVal = 0;

                if (countData.length > 0) {
                    countVal = countData[0].totalCount;
                }
                let subscriptionData = {};
                subscriptionData.status = true;
                subscriptionData.totalSub = countVal;
                subscriptionData.data = subData;
                cb(null, subscriptionData);
            });
        });        
    }

    Subscription.remoteMethod(
        'getUserSubscription',
        {
            http: { path: '/getUserSubscription', verb: 'post' },
            description: 'Get Subscription',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    // Subscription.getUserSubscriptionData = function (data, cb) {
    //     let msg = {};
    //     let subscription_id = (data.subscription_id == undefined || data.subscription_id == null || data.subscription_id == '' ? undefined : data.subscription_id);

    //     if (subscription_id == undefined) {
    //         msg = { status: false, message: "Please provide user id" };
    //         return cb(null, msg);
    //     }
       
    //     Subscription.findOne({ 
    //         where: { id: subscription_id },
    //         include: [
    //             {
    //                 relation: 'subscription_details',
    //                 scope: {
    //                     fields: ['user_id', 'subscription_id', 'school_id'],
    //                     include:[
    //                         {
    //                             relation: 'school',
    //                             scope:{
    //                                 fields: ['school_name']
    //                             }
    //                         }
    //                     ]
    //                 }
    //             },
    //         ]
    //         }, function (err, result) {
    //             if (err) {
    //                 return cb(null, err);
    //             }
    //             msg = { status: true, data: result};
    //             return cb(null, msg);
    //     });
        

    // }

    // Subscription.remoteMethod(
    //     'getUserSubscriptionData',
    //     {
    //         http: { path: '/getUserSubscriptionData', verb: 'post' },
    //         description: 'Get Subscription',
    //         accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
    //         returns: { root: true, type: 'json' }
    //     }
    // );

    Subscription.chkUserSubscription = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            school_id = 7; //If school id not passed check for OKS School Subscription
        }

        let currDate = new Date();
        currDate = dateFormatter(currDate);
        currDate = new Date(currDate);        
        currDate = currDate.getFullYear() + '-' + (currDate.getMonth() + 1) + '-' + currDate.getDate() + ' ' + currDate.getHours() + ":" + currDate.getMinutes();

        var ds = Subscription.dataSource;
		var sql = `select count(*) from subscriptions s 
        join subscription_details sd on s.id = sd.subscription_id
        where sd.school_id = ${school_id} and sd.class_id=${class_id} 
        and s.user_id=${user_id} and s.status=1 
        and s.start_date <= '${currDate}' and s.end_date >= '${currDate}'`;
		// console.log(sql);

        let params;
		ds.connector.query(sql, params, function (err, res) {
			if (err) {
				console.log(err);
				msg.status = false;
				msg.message = "Invalid Data";
				return cb(null, msg)
			} else {
                // console.log(res)
                msg = { status: true, data: res };
                			
				return cb(null, msg);
			}
		});

    }

    Subscription.remoteMethod(
        'chkUserSubscription',
        {
            http: { path: '/chkUserSubscription', verb: 'post' },
            description: 'Check User Subscription',
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

    let subscriptionMail = (firstName, email) => {        
        // return new Promise((resolve, reject) => {
            let emailMessage = `
            <html>
                <body>
                    <p>Hello ${firstName},</p>
                    <p>Your subscription has been done successfully.</p>
                    <p> Thank you for subscribing.</p>
                                            
                    <p>Best Regards,</p>
                    <div>MarkSharks Team</div>
                </body>
            </html>`;
                // mailPush(email, user.email, "Request for class code", emailMessage);
            mailPush('teacher@marksharks.com', email, "Marksharks Classroom Subscription", emailMessage);
        // });        
    }

    let mailPush = (from, to, subject, description) => {
		let msg = {};
		from = (from == undefined || from == null || from == '') ? undefined : from;
		to = (to == undefined || to == null || to == '') ? undefined : to;
		subject = (subject == undefined || subject == null || subject == '') ? undefined : subject;
		description = (description == undefined || description == null || description == '') ? undefined : entities.decode(entities.decode(description));

		if (from !== undefined && to !== undefined && subject !== undefined && description !== undefined) {
			let data = "api" + ":" + "key-2e1019a3bb874acc2075933c6e57a755";
			let buff;
			if (Buffer.from && Buffer.from !== Uint8Array.from) {
				buff = Buffer.from(data)
			} else {
				buff = Buffer(data);
			}
			
			let encVal = buff.toString('base64');
			// console.log(encVal);
			// let url = `https://api.mailgun.net/v3/portal.marksharks.com/messages`;
			let url = SETTINGS.SETTINGS.mailgun_url;
			// let encVal = btoa(username+":"+password);
			let mailData = {
				from: from,
				to: to,
				subject: subject,
				html: description
			};
			let contentLength = mailData.length;
			// console.log(mailData);

			request.post({
				"headers": {
					"Content-Type": "application/x-www-form-urlencoded",
					"Content-Length": contentLength,
					"Authorization": "Basic " + encVal
				},
				"url": url,
				"form": mailData
			}, function (err, res) {
				if (err) {
					console.log(err);
					msg.status = false;
					msg.message = err.message;
					// cb(null, msg);
				}
				// console.log(res.body);
				/* if (JSON.parse(res.body).exception) {
					msg.status = false;
					msg.message = JSON.parse(res.body).exception;
					cb(null, msg);
				} else {
					msg.status = true;				
				} */
			});
		}
	}
}