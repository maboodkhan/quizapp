'use strict';
const request = require("request");
var FCM = require('fcm-push');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const SETTINGS = require('../../server/system-config');
var voucher_codes = require('voucher-code-generator');

module.exports = function (Quizuser) {
	Quizuser.updateUser = async function (id, data, cb) {
		let msg = {};
		try {
			if (id == null || id == undefined || id == null) {
				msg.status = false;
				msg.message = "Please provide user id"
				return msg;
			}

			if (data.username == "" || data.username == undefined || data.username == null) {
				msg.status = false;
				msg.message = "Please provide username."
				return msg;
			}

			if (data.password == "" || data.password == undefined || data.password == null) {
				msg.status = false;
				msg.message = "Please provide password."
				return msg;
			}

			if (data.contactNumber == "" || data.contactNumber == undefined || data.contactNumber == null) {
				msg.status = false;
				msg.message = "Please provide contact number."
				return msg;
			}

			if (data.email == '' || data.email == undefined || data.email == null) {
				msg.status = false;
				msg.message = "Please provide email."
				return msg;
			} else {
				if (!ValidateEmail(data.email)) {
					msg.status = false;
					msg.message = "Invalid Email. Please try again."
					return msg;
				}
			}

			// if(data.fcm_id=="" || data.fcm_id==undefined || data.fcm_id==null){
			// 	msg.status = false;
			// 	msg.message = "Please provide fcm id."
			// 	return msg;
			// }

			data.id = id;
			let chkOtherQuizUserCountVal = await chkOtherQuizUserCount(data);
			// console.log(chkOtherQuizUserCountVal)
			if (1 >= chkOtherQuizUserCountVal) {
				let userCountData = await chkQuizUserCount(data);
				if (1 == userCountData.length) {
					let updateQuizUserDataVal = await updateQuizUserData(data);
				} else {
					let generatedCode = await generateCode(new Date().getTime());
					data.userReferralCode = generatedCode;
					if(data.referredBy != undefined || data.referredBy!=null || data.referredBy !=''){
						let getUserIdByRefId = await getUserByRefId(data.referredBy);
						data.referredBy = getUserIdByRefId.id;
					}
					
					let addQuizUserDataVal = await addQuizUser(data);					
				}
				let updateUserDataVal = await updateUserData(data);
				let updateFcmDataVal = await updateFcmData(data);
				let updateUserDetailsVal = await updateUserDetails(data);
				msg.status = true;
				msg.data = updateUserDataVal;
				msg.message = "User has been updated successfully.";
			} else {
				msg.status = true;
				msg.message = "Email/Username/Contact Number already exists. Please try again.";
			}
			return msg;
		} catch (error) {
			msg.status = false;
			msg.message = error;
			return msg;
		}
	}

	Quizuser.remoteMethod(
		'updateUser',
		{
			http: { path: '/updateUser/:id', verb: 'post' },
			description: 'Update user',
			accepts: [{ arg: 'id', type: 'string', required: true },
			{ arg: 'data', type: 'object', required: true, http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	let ValidateEmail = (mail) => {
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
			return true;
		}
		return false;
	}


	Quizuser.getStudentData = function (data, cb) {
		let msg = {};
		let student_id = (data.student_id == undefined || data.student_id == null || data.student_id == '' ? undefined : data.student_id);

		if (student_id == undefined) {
			msg.status = false;
			msg.message = "Please provide student id.";
			return cb(null, msg);
		}
		Quizuser.findOne({
			where: { id: student_id }
		}, function (err, userData) {
			if (err) {
				msg.status = false;
				msg.message = err;
				return cb(null, msg);
			}
			msg.status = true;
			msg.data = userData;
			return cb(null, msg);
		})
	}

	Quizuser.remoteMethod(
		'getStudentData',
		{
			http: { path: '/getStudentData', verb: 'post' },
			description: 'Get Student Detail',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	let chkOtherQuizUserCount = (data) => {
		return new Promise((resolve, reject) => {
			Quizuser.count(
				{
					id: { neq: data.id },
					or: [
						{ email: data.email },
						{ username: data.username },
						{ contactNumber: data.contactNumber }
					]
				}, function (err, countData) {
					let userData = Quizuser.app.models.user_data;
					if (err) {
						//cb(null,err);
						console.log(err);
						reject(err.message);
					}
					resolve(countData);
				});
		});
	}

	let chkQuizUserCount = (data) => {
		return new Promise((resolve, reject) => {
			Quizuser.find(
				{
					where: {
						id: data.id,
						or: [
							{ email: data.email },
							{ username: data.username },
							{ contactNumber: data.contactNumber }
						]
					}					
				}, function (err, countData) {
					let userData = Quizuser.app.models.user_data;
					if (err) {
						//cb(null,err);
						console.log(err);
						reject(err.message);
					}
					resolve(countData);
				});
		});
	}

	let addQuizUser = (data) => {
		return new Promise((resolve, reject) => {
			let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
			let id = (data.id == undefined || data.id == null || data.id == '') ? undefined : data.id;
			if (id == undefined) {
				reject("Please provide id");
			}
			if (email == undefined) {
				reject("Please provide email");
			}
			Quizuser.upsertWithWhere({ "id": data.id }, data, function (err, quizUserData) {
				if (err) {
					//cb(null,err);
					console.log(err);
					reject(err.message);
				}
				resolve(quizUserData);
			});
		});
	}

	let updateQuizUserData = (data) => {
		return new Promise((resolve, reject) => {
			let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
			let id = (data.id == undefined || data.id == null || data.id == '') ? undefined : data.id;
			if (id == undefined) {
				reject("Please provide id");
			}
			if (email == undefined) {
				reject("Please provide email");
			}
			Quizuser.update({ "id": id }, data, function (err, quizUserData) {
				if (err) {
					//cb(null,err);
					console.log(err);
					reject(err.message);
				}
				// console.log(quizUserData);
				resolve(quizUserData);
			});
		});
	}

	let updateUserData = (data) => {
		return new Promise((resolve, reject) => {
			let userData = Quizuser.app.models.user_data;
			let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
			let id = (data.id == undefined || data.id == null || data.id == '') ? undefined : data.id;
			if (id == undefined) {
				reject("Please provide id");
			}
			if (email == undefined) {
				reject("Please provide email");
			}
			let valData = { user_id: data.id };

			userData.update({ "email": email }, valData, function (err, userDataResult) {
				if (err) {
					//cb(null,err);
					console.log(err);
					reject(err.message);
				}
				userData.find({ where: { "email": email } }, function (err, result) {
					if (err) {
						//cb(null,err);
						console.log(err);
						reject(err.message);
					}
					resolve(result);
				});
			});
		});
	}

	let updateFcmData = (data) => {
		return new Promise((resolve, reject) => {
			let userFcmData = Quizuser.app.models.quiz_user_fcm;
			let id = (data.id == undefined || data.id == null || data.id == '') ? undefined : data.id;
			let packageName = (data.packageName == undefined || data.packageName == null || data.packageName == '') ? undefined : data.packageName;
			let fcm_id = (data.fcm_id == undefined || data.fcm_id == null || data.fcm_id == '') ? undefined : data.fcm_id;
			if (id == undefined) {
				reject("Please provide id");
			}

			let classIdArr = [
				{
					'com.oksedu.marksharks.cbse.g07': 7,
					'com.oksedu.marksharks.cbse.g08.s02': 8,
					'com.oksedu.marksharks.cbse.g09.s02': 9,
					'com.oksedu.marksharks.cbse.g10': 10
				}
			];
			let class_id = classIdArr[0][packageName];

			if (class_id == undefined) {
				reject("Please provide packageName");
			}
			// if(fcm_id == undefined){
			// 	reject("Please provide fcm_id");
			// }
			let valData = { user_id: id, class_id: class_id, packageName: packageName, fcm_id: fcm_id };
			// console.log(valData);
			userFcmData.upsertWithWhere({ user_id: data.id, class_id }, valData, function (err, fcmResult) {
				if (err) {
					//cb(null,err);
					console.log(err);
					reject(err.message);
				}
				resolve(fcmResult);
			});
		});
	}

	let updateUserDetails = (data) => {
		return new Promise((resolve, reject) => {
			let userDetails = Quizuser.app.models.quiz_user_details;
			let id = (data.id == undefined || data.id == null || data.id == '') ? undefined : data.id;
			let packageName = (data.packageName == undefined || data.packageName == null || data.packageName == '') ? undefined : data.packageName;
			let deviceId = (data.deviceId == undefined || data.deviceId == null || data.deviceId == '') ? undefined : data.deviceId;
			let appOpenedAt = (data.appOpenedAt == undefined || data.appOpenedAt == null || data.appOpenedAt == '') ? undefined : data.appOpenedAt;
			let appClosedAt = (data.appClosedAt == undefined || data.appClosedAt == null || data.appClosedAt == '') ? undefined : data.appClosedAt;
			let duration = (data.duration == undefined || data.duration == null || data.duration == '') ? undefined : data.duration;
			let paidStatus = (data.paidStatus == undefined || data.paidStatus == null || data.paidStatus == '') ? undefined : data.paidStatus;

			if (id == undefined) {
				reject("Please provide id");
			}

			let classIdArr = [
				{
					'com.oksedu.marksharks.cbse.g07': 7,
					'com.oksedu.marksharks.cbse.g08.s02': 8,
					'com.oksedu.marksharks.cbse.g09.s02': 9,
					'com.oksedu.marksharks.cbse.g10': 10
				}
			];
			let class_id = classIdArr[0][packageName];

			if (class_id == undefined) {
				reject("Please provide packageName");
			}
			// if(fcm_id == undefined){
			// 	reject("Please provide fcm_id");
			// }
			let valData = { 
				user_id: id, 
				class_id: class_id, 
				packageName: packageName, 
				deviceId: deviceId,
				appOpenedAt: appOpenedAt,
				appClosedAt: appClosedAt,
				duration: duration,
				paidStatus: paidStatus
			};
			// console.log(valData);
			userDetails.upsertWithWhere({ user_id: data.id, class_id }, valData, function (err, fcmResult) {
				if (err) {
					//cb(null,err);
					console.log(err);
					reject(err.message);
				}
				resolve(fcmResult);
			});
		});
	}

	Quizuser.getUserDetails = async function (username, cb) {
		let msg = {};

		try {
			if (username == undefined) {
				msg.status = false;
				msg.message = "Please provide the username.";
				return msg;
			}

			let userDetailsData = await userDetails(username);
			let countryCode = userDetailsData.contactNumber;
			countryCode = countryCode.substring(0,3);
			let userCountry = await getUserCountry(countryCode);
			let user_id = userDetailsData.id;
			let userSchoolsData = await userSchools(user_id);
			userDetailsData.userSchools = userSchoolsData;
			msg.status = true;
			msg.data = userDetailsData;
			let countryName = '';
			if(userCountry){
				countryName = userCountry.countryName;
			}
			msg.country = countryName;
			msg.countryDetail = userCountry;
			msg.message = "";
			return msg;
		} catch(error) {
			msg.status = false;
			msg.message = error;
			return msg;			
		}
	}

	Quizuser.remoteMethod(
		'getUserDetails',
		{
			http: { path: '/getuserdetails', verb: 'post' },
			description: 'Get user by username',
			accepts: [{ arg: 'username', type: 'string' }],
			returns: { root: true, type: 'json' }
		}
	);

	let userDetails = (username) => {
		return new Promise((resolve, reject) => {
			Quizuser.findOne({
				where: { username: username },
				include: [
					{
						relation: "userData",
						scope: {
							where: {
								section_id: { neq: 0 },
							},
							order: "section_id asc",
							include: [
								{
									relation: "school",
									scope: {
										where:{
											status: 1
										},
										fields: [
											"school_name", 
											"school_code", 
											"publish_status",
											"school_logo"
										]
									}
								},
								{
									relation: "class",
									scope: {
										fields: ["class_name"]
									}
								}, {
									relation: "section",
									scope: {
										fields: ['class_id', 'section_id'],
										include: [
											{
												relation: "class_section",
												scope: {
													fields: ["section_name"]
												}
											}
										]
									}
								}
							]
						}
					},
					{
						relation: "quiz_user_fcms",
						scope: {
							where: {
								status: 1
							}
						}
					},
					{
						relation: "quiz_user_details",
						scope: {
							where: {
								status: 1
							}
						}
					},
					{
						relation: "user_assigned_subjects",
						scope: {
							where: {
								status: 1
							},
							include:[
								{
									relation: 'subject',
									scope:{
										where: {
											status: 1,
										},
										fields:['subject_name','class_id']
									}
								}
							]
						}
					},
					{
						relation: "adminUser",
						scope: {
							where: {
								status: 1
							},
							include:[
								{
									relation: 'user_Type',
									scope: {
										where: {
											status: 1
										}
									}
								}
							]
						}
					},
				]
			}, function (err, result) {
				if (err) {
					//cb(null,err);
					// message = { status: false, message: "Error! Please try again." };
					reject(err.message);
				}
				let message = '';
				if (result) {
					// message = { status: true, data: result, message: "" };
					message = result;
				} else {
					reject('No user found');
					// message = { status: true, data: {}, message: "User not found." };
					// message = "User not found.";
				}
				// console.log(result);		
				resolve(message);
			});
		});
	}

	let getUserCountry = (countryCode) => {
		return new Promise((resolve, reject) => {
			let Country = Quizuser.app.models.countries;
			Country.findOne(
				{
					where: { countryCode: countryCode}
				},
				function(err, countryData){
					if(err){
						reject(err.message);
					}
					resolve(countryData);
				}
			);
		});
	}

	Quizuser.getSuggestData = function (data, cb) {
		let msg = {};
		let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : new RegExp(data.email, "i");
		let contactNumber = (data.contactNumber == undefined || data.contactNumber == null || data.contactNumber == '') ? undefined : new RegExp(data.contactNumber, "i");

		Quizuser.find({ where: { email: email, contactNumber: contactNumber } }, function (err, result) {
			if (err) {
				return cb(null, err);
			}
			msg.status = true;
			msg.data = result;
			return cb(null, msg);
		});
	}

	Quizuser.remoteMethod(
		'getSuggestData',
		{
			http: { path: '/getSuggestData', verb: 'post' },
			description: 'Get User Details',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	Quizuser.markAppLogin = function (username, password, cb) {
		// console.log("here is error");
		let msg = {};
		let data = username + ':' + password;
		let buff = new Buffer(data);
		let encVal = buff.toString('base64');
		// let url = `https://sp.marksharks.com/api/jsonws/markshark-services-portlet.msuser/get-student-by-email2`;
		let url = SETTINGS.SETTINGS.liferay_login_url;
		// let encVal = btoa(username+":"+password);
		let userData = {
			email: username
		};
		let contentLength = userData.length;
		// console.log(subsriptionData);
		request.post({
			"headers": {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": contentLength,
				"Authorization": "Basic " + encVal
			},
			"url": url,
			"form": userData
		}, function (err, res) {
			if (err) {
				console.log(err);
				msg.status = false;
				msg.message = err.message;
				cb(null, msg);
			}
			// console.log(res);
			if (JSON.parse(res.body).exception) {
				
				//  console.log(JSON.parse(res.body).exception);
				// reject(JSON.parse(res.body).exception);
				msg.status = false;
				msg.message = JSON.parse(res.body).exception;
				cb(null, msg);
			} else {
				msg.status = true;
				let response = JSON.parse(res.body);
				let token = generate_random_string();
				response.token = token;
				if (response.userId) {
					Quizuser.findOne({
						where: {id: response.userId}
					},function(err, userVal){
						if (err) {
							console.log(err);
							msg.status = false;
							msg.message = err.message;
							return cb(null, msg);
						}

						if(userVal){
							if(userVal.status == 0){
								msg.status = false;
								msg.message = "Registration Verification Pending";
								return cb(null, msg);
							} else if(userVal.status == 2){
								msg.status = false;
								msg.message = "Account deactivated. Please contact administrator.";
								return cb(null, msg);
							} else if(userVal.status == 1){
								Quizuser.update({ id: response.userId }, { token: token }, function (err, data) {
									if (err) {
										console.log(err);
										msg.status = false;
										msg.message = "Invalid token";
									}
									
									/***** User password update till login is from liferay  *****/
									updatePassword(response.userId, username, password);
									///////////////////////////////////////////////////////////////
									
									response.headerVal = encVal;
									msg.data = response;
									cb(null, msg);
								});
							} else {
								msg.status = false;
								msg.message = "Invalid credentials. Please try again.";
								return cb(null, msg);
							}
						} else {
							msg.status = false;
							msg.message = "Invalid login credentials";
							return cb(null, msg);
						}
					});
					
				} else {
					msg.status = false;
					msg.message = "Invalid login credentials";
					return cb(null, msg);
				}
			}
		});
	}

	Quizuser.remoteMethod(
		'markAppLogin',
		{
			http: { path: '/applogin', verb: 'post' },
			description: 'Login in client app',
			accepts: [{ arg: 'username', type: 'string' },
			{ arg: 'password', type: 'string' }],
			returns: { root: true, type: 'json' }
		}
	);

	Quizuser.chkUserToken = function (user_id, token, cb) {
		let msg = {};
		user_id = (user_id == undefined || user_id == null || user_id == '' ? undefined : user_id);
		token = (token == undefined || token == null || token == '' ? undefined : token);

		if (user_id == undefined || token == undefined) {
			msg.status = false;
			msg.message = "Invalid Request.";
			return cb(null, msg);
		}

		Quizuser.findOne({
			where: { id: user_id, token: token }
		}, function (err, userData) {
			if (err) {
				msg.status = false;
				msg.message = err;
				return cb(null, msg);
			}
			if (userData) {
				msg.status = true;
			} else {
				msg.status = false;
			}
			return cb(null, msg);
		})
	}

	Quizuser.remoteMethod(
		'chkUserToken',
		{
			http: { path: '/chkUserToken', verb: 'post' },
			description: 'Check user token',
			accepts: [{ arg: 'user_id', type: 'number' },
			{ arg: 'token', type: 'string' }],
			returns: { root: true, type: 'json' }
		}
	);

	Quizuser.sendNotification = async function (data, cb) {
		let msg = {};
		let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length < 1 ? undefined : data.class_id);
		let packageName = (data.packageName == undefined || data.packageName == null || data.packageName == '' || data.packageName.length < 1 ? undefined : data.packageName);
		let contactNumber = (data.contactNumber == undefined || data.contactNumber == null || data.contactNumber == '' ? undefined : data.contactNumber.split(','));
		let email = (data.email == undefined || data.email == null || data.email == '' ? undefined : data.email.split(','));
		let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
		let message = (data.message == undefined || data.message == null || data.message == '' ? undefined : data.message);
		let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
		let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
		let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
		let webNotify = true;
		let cond = [];
		let userCond = [];
		// console.log(data);
		try {
			if (title === undefined) {
				msg = {
					status: false,
					message: "Please provide title"
				};
				return msg;
			}

			if (message === undefined) {
				msg = {
					status: false,
					message: "Please provide message"
				};
				return msg;
			}
			if (class_id !== undefined) {
				cond.push({ class_id: { inq: class_id } });
			}

			// if (packageName !== undefined) {
			//     userCond.push({ packageName: { inq: packageName } });
			// }

			if (contactNumber !== undefined && contactNumber.length > 0) {
				userCond.push({ contactNumber: { inq: contactNumber } });
			}

			if (email !== undefined && email.length > 0) {
				userCond.push({ email: { inq: email } });
			}

			if (userCond.length < 1) {
				userCond.push({ contactNumber: { neq: '' } });
			}
			// console.log(userCond);
			let studentsData = await getStudents(cond, userCond, title, message, webNotify, deep_link, image_url, created_by);

			msg.status = true;
			msg.message = studentsData;
			return msg;
		} catch (err) {
			console.log(err);
			msg.status = false;
			msg.message = err.message;
			return msg;
		}
	}

	Quizuser.remoteMethod(
		'sendNotification',
		{
			http: { path: '/sendNotification', verb: 'post' },
			description: 'Send push notification to users',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'object' },

		}
	);


	let getStudents = (cond, userCond, title, message, webNotify, deep_link, image_url, created_by) => {
		return new Promise((resolve, reject) => {
			// console.log(userCond);
			Quizuser.find({
				where: {
					and: userCond
				},
				fields: ['email', 'contactNumber', 'packageName', 'id'],
				include: [
					{
						relation: 'quiz_user_fcms',
						scope: {
							where: {
								status: 1,
								and: cond
							}
						}
					}
				]
			}, function (err, studentData) {

				if (err) {
					console.log(err)
					reject(err);
				}
				// console.log(studentData);
				if (studentData !== undefined) {
					if (studentData.length > 0) {
						studentData.forEach((studentVal) => {
							// console.log(studentVal);
							let userData = studentVal.toJSON().quiz_user_fcms;
							let userFcm = JSON.stringify(userData);
							// console.log(userFcm);
							if (userFcm != undefined) {
								userFcm = JSON.parse(userFcm);
								if (userFcm) {
									userFcm.forEach((fVal) => {
										//let fcmId = userFcm[0].fcm_id;
										let fcmId = fVal.fcm_id;
										let sent_to = fVal.user_id
										let class_id = fVal.class_id
										deep_link = deep_link.replace('{Grade}', class_id);
										// console.log(fcmId);
										// console.log(deep_link);
										fcmPush(fcmId, title, message, webNotify, deep_link, image_url, sent_to, class_id, created_by);
										deep_link = deep_link.replace('/'+class_id+'/','/{Grade}/'); //Replace in case of multiple class ids
									});
								}
							}
						});
						resolve('Push notification sent successfully.');
					} else {
						resolve('No record found.');
					}
				} else {
					resolve('No record found.');
				}
			})
		});
	}

	// let fcmPush = (fcmId, title, message, webNotify, deep_link, image_url, sent_to, class_id, created_by) => {
	// 	var serverKey = 'AAAAj9KKx6c:APA91bEW46zFqX4Fj2djDFrkuNF7JPY65p_8JLYokX5Vw0E8qtMwM8JL5NFjyGIx-B2tflxVr4NIYI1V028uzSSw6vLBhS5pGsEkZyZ9nK_k7GVLDaQEvec_I4t3SWBxkcawV-UFdX0j';
	// 									// let sent_to = fVal.user_id
	// 									let class_id = fVal.class_id
	// 									// console.log(fcmId);
	// 									deep_link = deep_link.replace('{Grade}', class_id);
	// 									fcmPush(fcmId, title, message, webNotify, deep_link, image_url);
	// 								});                                    
    //                             }
    //                         }
    //                     });
    //                     resolve('Push notification sent successfully.');
    //                 } else {
    //                     resolve('No record found.');
    //                 }
    //             } else {
    //                 resolve('No record found.');
    //             }
    //         })
    //     });
    // }

    let fcmPush = (fcmId, title, message, webNotify, deep_link, image_url, sent_to, class_id, created_by) => {
        var serverKey = 'AAAAj9KKx6c:APA91bEW46zFqX4Fj2djDFrkuNF7JPY65p_8JLYokX5Vw0E8qtMwM8JL5NFjyGIx-B2tflxVr4NIYI1V028uzSSw6vLBhS5pGsEkZyZ9nK_k7GVLDaQEvec_I4t3SWBxkcawV-UFdX0j';
		var fcm = new FCM(serverKey);
		let logMsg = message;
		let nwMessage = {
			title: title,
			message: message,
			deep_link: deep_link,
			image_url: image_url
		};
		if(image_url == '') {
			nwMessage = {
				title: title,
				message: message,
				deep_link: deep_link
			};
		}
		
		if(webNotify){
			nwMessage = {
				mp_message: message,
				mp_icnm: "ic_notification_bar",
				mp_title: title,
				deep_link: deep_link,
				image_url: image_url
			};
			if(image_url == ''){
				nwMessage = {
					mp_message: message,
					mp_icnm: "ic_notification_bar",
					mp_title: title,
					deep_link: deep_link
				};
			}
		}
		// console.log(nwMessage);
        var message = {
            to: fcmId, // required fill with device token or topics
            collapse_key: 'type_a',
            data: nwMessage
        };

		//callback style
		fcm.send(message, function (err, response) {
			let result;
			let notifyMessage;
            if (err) { 
				notifyMessage = "Not Sent";
				result = err; 
			} else { 
				result = response; 
				notifyMessage = "Not Sent";
				if(JSON.parse(result).success == 1){					
					notifyMessage = "Sent";
				}
			}
			let Pushnotificationlogs = Quizuser.app.models.push_notification_logs;
			let logObj = {
				module: "User Notification",
				class_id: class_id,
				sent_to: sent_to,
				notification_message: notifyMessage,
				title: title,
				message: logMsg,
				response: result,
				sent_by: created_by
			}
			Pushnotificationlogs.upsert(logObj, function (error, res) { });
				// console.log("Successfully sent with response: ", response, fcmId);
				// Successfully sent with response:  {"multicast_id":2877455301450114404,"success":1,"failure":0,"canonical_ids":0,"results":[{"message_id":"0:1597306162344681%548dba2acccfb49c"}]}
		});
	}


	function generate_random_string(string_length = 10) {
		let random_string = '';
		let random_ascii;
		for (let i = 0; i < string_length; i++) {
			random_ascii = Math.floor((Math.random() * 25) + 97);
			random_string += String.fromCharCode(random_ascii)
		}
		return random_string
	}

	function getRandomNo() {
		let random_no;
		random_no = Math.floor((Math.random() * 25));
		return random_no;
	}

	Quizuser.getAppUser = function (data, cb) {
		let msg = {};
		let cond = {};
		let name = (data.name == undefined || data.name == null || data.name == '') ? undefined : new RegExp(data.name, "i");
        let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : new RegExp(data.email, "i");
        let contactNumber = (data.contactNumber == undefined || data.contactNumber == null || data.contactNumber == '') ? undefined : new RegExp(data.contactNumber, "i");
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
		
		cond = {
			and: [
				{or: [{firstName: name}, {lastName: name}]},
				{email: email},
				{contactNumber: contactNumber}
			]
        };

		Quizuser.find({ where: cond },function(err, count){
			Quizuser.find({
				where: cond,
				limit: limit,
				skip: offset,
				include: [
					{
						relation: "quiz_user_details",
						scope: {
							order: "class_id asc",
							where: {
								status: 1
							}
						}
					},
				]
			}, function (err, userData) {
				if (err) {
					msg = {status: false, message: err}
					return cb(null, msg);
				}
				msg = {status: true, data: userData, totalUser: count.length}
				return cb(null, msg);
			})
		})
		
	}

	Quizuser.remoteMethod(
		'getAppUser',
		{
			http: { path: '/getAppUser', verb: 'post' },
			description: 'Get App User Detail',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	Quizuser.deleteUser = function (data, cb) {
		let msg = {};
		let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
		
		if(user_id == undefined){
			msg = {status: false, message: "Please provide user_id"}
			return cb(null, msg);
		}

		Quizuser.destroyAll({id: user_id}, function (err, response) {
			if (err) {
				msg = {status: false, message: err}
				return cb(null, msg);
			}
			msg = {status: true, data: response}
			return cb(null, msg);
		})
	}

	Quizuser.remoteMethod(
		'deleteUser',
		{
			http: { path: '/deleteUser', verb: 'post' },
			description: 'Delete App User',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	Quizuser.appUserDetail = function (data, cb) {
		let msg = {};
		let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
		
		if(user_id == undefined){
			msg = {status: false, message: "Please provide user_id"}
			return cb(null, msg);
		}

		Quizuser.findOne({ 
			where: {id: user_id},
			include: [
				{
					relation: "quiz_user_details",
					scope: {
						order: "class_id asc",
						where: {
							status: 1
						}
					}
				},
			]}, function (err, response) {
			if (err) {
				msg = {status: false, message: err}
				return cb(null, msg);
			}
			msg = {status: true, data: response}
			return cb(null, msg);
		})
	}

	Quizuser.remoteMethod(
		'appUserDetail',
		{
			http: { path: '/appUserDetail', verb: 'post' },
			description: 'Get App User Detail',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	Quizuser.generateOtp = function (data, cb) {
		let msg = {};
		let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
		// let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
		// let firstName = (data.firstName == undefined || data.firstName == null || data.firstName == '') ? undefined : data.firstName;
		
		if(user_id == undefined){
			msg = {status: false, message: "Please provide user id."}
			return cb(null, msg);
		}

		Quizuser.findOne({where: {id: user_id, emailVerified:0, status:0}}, function(err, userVal){
			if (err) {
				msg = {status: false, message: err.message}
				return cb(null, msg);
			}
			// console.log(userVal);

			if(userVal){

				let otp_received = Math.floor((Math.random() * 1000000) + 1);
				let emailMessage;
				let encUserId = `user_id=${user_id}`;
				encUserId = Buffer.from(encUserId, 'utf-8');
				// decode buffer as Base64
				encUserId = encUserId.toString('base64');
				// let verificationUrl = `https://support.marksharks.com/#/user-verification?${encUserId}`;
				let verificationUrl = SETTINGS.SETTINGS.user_verification_url+`?${encUserId}`;
				emailMessage = `
				<html>
					<body>
						<p>Dear ${userVal.firstName},</p>
						<p>Thank you for registering with Marksharks.</p>
						<p>Click on the below mentioned link and enter the OTP provided for user verification</p>
						<p>${verificationUrl}</p>
						<p>
							<label>OTP: </label>
							<strong>${otp_received}</strong>
						</p>
						<p>Best Regards,</p>
						<p>Marksharks Team</p>
					</body>
				</html>`;

				Quizuser.update({id: user_id}, {otp_received: otp_received, userVerification:0, status: 0}, function (err, response) {
					if (err) {
						msg = {status: false, message: err.message};
						return cb(null, msg);
					}
					// console.log("Response",response);
					if(response.count > 0){
						mailPush('teacher@marksharks.com', userVal.email, "Marksharks Registration Verification", emailMessage)
						msg = {status: true, message: "OTP and verification link sent to your email address. Please verify."}
					} else {
						msg = {status: true, message: 'Error in OTP generation. <a href="###OTP_URL###">Click</a> here to regenerate OTP.'};
					}
					
					return cb(null, msg);
				});
			} else {
				msg = {status: false, message: "User is already registered. Please login again"};
				return cb(null, msg);
			}
		});
	}

	Quizuser.remoteMethod(
		'generateOtp',
		{
			http: { path: '/generateOtp', verb: 'post' },
			description: 'Generate OTP for a user',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	Quizuser.userVerification = function (data, cb) {
		let msg = {};
		let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
		let trialUser = (data.trialUser == undefined || data.trialUser == null || data.trialUser == '') ? undefined : data.trialUser;
		// let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
		// let firstName = (data.firstName == undefined || data.firstName == null || data.firstName == '') ? undefined : data.firstName;
		let otp_received = (data.otp_received == undefined || data.otp_received == null || data.otp_received == '') ? undefined : data.otp_received;

		if(user_id == undefined){
			msg = {status: false, message: "Please provide user id."}
			return cb(null, msg);
		}

		// if(email == undefined){
		// 	msg = {status: false, message: "Please provide your email address."}
		// 	return cb(null, msg);
		// }

		// if(firstName == undefined){
		// 	msg = {status: false, message: "Please provide your first name."}
		// 	return cb(null, msg);
		// }
		let User = Quizuser.app.models.user;
		Quizuser.findOne({where: {id: user_id, emailVerified:0, status:0}}, function(err, userVal){
			if (err) {
				msg = {status: false, message: err.message}
				return cb(null, msg);
			}

			if(userVal){
				let emailMessage;
				
				// let msPlusUrl = `https://support.marksharks.com/#/login`;
				let msPlusUrl = SETTINGS.SETTINGS.msplus_login_url;
				emailMessage = `
				<html>
					<body>
						<p>Dear ${userVal.firstName},</p>
						<p>Thank you for registration with Marksharks.</p>
						<p>The verification has been done successfully.</p>
						<p>Click on the below mentioned link and enter your login credentials 
						for login into <strong>Marksharks Classroom</strong></p>
						<p>${msPlusUrl}</p>
						<p>Best Regards,</p>
						<p>Marksharks Team</p>
					</body>
				</html>`

				let status=0;
				if(userVal.userType==1 || trialUser){
					status = 1
				}else{ status = 2}
				Quizuser.update({id: user_id, otp_received: otp_received}, {emailVerified: 1, status: status}, function (err, response) {
					if (err) {
						msg = {status: false, message: err.message}
						return cb(null, msg);
					}
					if(response.count > 0){
						mailPush('teacher@marksharks.com', userVal.email, "Marksharks Successful Registration Verification", emailMessage);
						let message = `
						You have been verified successfully. <a href="${msPlusUrl}">Click</a> here to login.</>
						`;

						msg = {status: true, message: message};
					} else {
						msg = {status: false, message: "Invalid OTP. Please try again."};
					}
					return cb(null, msg);
				});
			} else {
				msg = {status: false, message: "User is already registered."};
				return cb(null, msg);
			}
		});
	}

	Quizuser.remoteMethod(
		'userVerification',
		{
			http: { path: '/userVerification', verb: 'post' },
			description: 'Verify user',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	let mailPush = (from, to, subject, description) => {
        let msg = {};
        from = (from == undefined || from == null || from == '') ? undefined : from;
        to = (to == undefined || to == null || to == '') ? undefined : to;
        subject = (subject == undefined || subject == null || subject == '') ? undefined : subject;
        description = (description == undefined || description == null || description == '') ? undefined : entities.decode(entities.decode(description));

        if (from !== undefined && to !== undefined && subject !== undefined && description !== undefined) {
            let data = "api" + ":" + "key-2e1019a3bb874acc2075933c6e57a755";
            let buff = Buffer(data);
            let encVal = buff.toString('base64');
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
            // console.log(subsriptionData);


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
                // console.log(res);
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

	let getUserDetail = (user_id) => {
		return new Promise((resolve, reject) => {
			Quizuser.findOne({
				where: {id: user_id},
			}, function (err, result) {
				//console.log(result);
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	}

	Quizuser.markAppSignup = function (data, cb){
		let msg = {};
		// let url = `https://sp.marksharks.com/api/jsonws/markshark-services-portlet.msuser/add-student3`;
		let url = SETTINGS.SETTINGS.liferay_registration_url;
		// console.log(url);
		let userData = {
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			password: data.password,
			facebookId: 0,
			signUpType: "Email",
			gPlusId: "567hbgj",
			phoneNumber: data.contactNumber,
			deviceId: "xyz",
			packageName: "abc",
		};
		request.post({
			"headers": {
				"Content-Type": "application/json",
			},
			"url": url,
			"form": userData
		}, async function (err, res) {
			if (err) {
				console.log(err);
				msg.status = false;
				msg.message = err.message;
				cb(null, msg);
			}
			if (JSON.parse(res.body).exception) {
				msg.status = false;
				msg.message = JSON.parse(res.body).exception;
				cb(null, msg);
			} else {
				msg.status = true;
				let response = JSON.parse(res.body);
				let token = generate_random_string();
				response.token = token;
				if (response.userId) {
					//response.userId = getRandomNo();
					//let userDetail = await getUserDetail(response.userId);

					msg.data = response;
					cb(null, msg);
				} else {
					msg.status = false;
					msg.message = "Invalid login credentials";
				}
			}
		});
	}

	Quizuser.remoteMethod(
		'markAppSignup',
		{
			http: { path: '/appsignup', verb: 'post' },
			description: 'signup in client app',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	let userSchools = (user_id) => {
		return new Promise((resolve,reject) => {
			// console.log(cond);
			var ds = Quizuser.dataSource;
			let params;

			var sql = `SELECT sch.id, sch.school_name, sch.school_code, sch.school_logo, sch.publish_status from school_user_classes suc 
			left join schools sch on suc.school_id = sch.id
			where 1=1 and suc.status=1 and suc.user_id = ${user_id} and sch.status=1
			group by suc.school_id`;
			// console.log(sql);
			ds.connector.query(sql, params, function (err, res) {
				if (err) {
					reject(err.message)
				}
				resolve(res);
			});
		});
	} 

	let generateCode = (randNumber) => {
		// console.log(randNumber.toString().substr(randNumber.length - 2, randNumber.length));
		return new Promise((resolve, reject) => {
			let userRefCode = voucher_codes.generate({
				length: 12,
				count: 1,
				postfix: randNumber.toString().substr(randNumber.length - 2, randNumber.length) //last 2 digits of phone number 
			});
			userRefCode = userRefCode[0];
			//console.log(userRefCode);
			resolve(userRefCode);
		});
	}

	let getUserByRefId = (data) => {
		return new Promise((resolve, reject) => {
			Quizuser.find(
				{
					where: {
						userReferralCode: data.referredBy
					}					
				}, function (err, userData) {
					if (err) {
						//cb(null,err);
						console.log(err);
						reject(err.message);
					}
					resolve(userData);
				});
		});
	}

	/* 
	 * For updating users' password for whom password is not updated in the user table
	 */
	let updatePassword = (user_id, username, password) => {
		let User = Quizuser.app.models.user;
		User.resetPassword({
			email:username,
			newPassword:password
		}, function(err, passData) {
			if(err){
				console.log(err)
			}
			// console.log(passData)
			return passData;
		});
		Quizuser.resetPassword({
			email:username,
			newPassword:password
		}, function(err, passData) {
			if(err){
				console.log(err)
			}
			// console.log(passData)
			return passData;
		});
	}

	Quizuser.on("resetPasswordRequest",function(value){
		
		let userData = value.user;
		// let username = (userData.username == undefined || userData.username == null || userData.username == '') ? undefined : userData.username;
		let userId = (userData.id == undefined || userData.id == null || userData.id == '') ? undefined : userData.id;
		if(userId == undefined){
			return false;
		} else {
			// console.log(userId);
			let newPassword = value.options.newPassword;
			userData.password = newPassword;
			// console.log(userData.password);
			// console.log(userData);
			Quizuser.update({id:userId},{password: userData.password},function(err,userValData){
				if(err){
					console.log(err)
					console.log("Unable to reset");							
				}
			});	
		}			
	});

	Quizuser.chkUserExists = function (username, cb) {
		let msg = {};
		username = (username == undefined || username == null || username == '' ? undefined : username);
		

		if (username == undefined) {
			msg.status = false;
			msg.message = "Invalid Request.";
			return cb(null, msg);
		}

		Quizuser.findOne({
			where: { username: username }
		}, function (err, userData) {
			if (err) {
				msg.status = false;
				msg.message = err;
				return cb(null, msg);
			}
			if (userData) {
				msg.status = true;
			} else {
				msg.status = false;
			}
			return cb(null, msg);
		})
	}

	Quizuser.remoteMethod(
		'chkUserExists',
		{
			http: { path: '/chkUserExists', verb: 'post' },
			description: 'Check user existence',
			accepts: [{ arg: 'username', type: 'string' }],
			returns: { root: true, type: 'json' }
		}
	);
};
