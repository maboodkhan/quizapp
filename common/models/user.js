'use strict';

const request = require("request");
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const SETTINGS = require('../../server/system-config');

module.exports = function (Users) {
	Users.userlogin = function (credentials, callback) {
		// Invoke the default login function
		return Users.login(credentials, function (loginErr, loginToken) {
			let errormessage = {};
			if (loginErr) {
				errormessage.status = false;
				errormessage.message = "Login Failed!";
				console.log(loginErr);
				return callback(null, errormessage);
			}

			/* If we got to this point, the login call was successfull and we
			 * have now access to the token generated by the login function.
			 *
			 * This means that now we can add extra logic and manipulate the
			 * token before returning it. Unfortunately, the login function
			 * does not return the user data, so if we need it we need to hit
			 * the datasource again to retrieve it.
			 */

			// If needed, here we can use loginToken.userId to retrieve
			// the user from the datasource
			/*return Users.findById(loginToken.userId, function (findErr, userData) {                
				if (findErr)
					return callback(findErr);
				
				if (userData.status !== 1){
					errormessage.status = false;
					errormessage.message = "Your accound has been deactivated. Please contact administrator.";
					//return callback(loginErr);
					return callback(null,errormessage);
				}

				let userType = Users.app.models.user_types;
				userType.findById(userData.user_type_id, function(err, typeData){
					if(err){
						console.log(err);
					}
					
					userData.token = loginToken.id;				
					userData.ttl = loginToken.ttl;		
					userData.userType = typeData.type_name;
					return callback(null, userData);
				});
			});*/

			return Users.findOne({
				where: { id: loginToken.userId },
				include: [
					{
						relation: "user_Type",
						scope: {
							fields: ['type_name', 'type_order']
						}
					},
					{
						relation: "user_class",
						scope: {}
					},
					{
						relation: "user_countries",
						scope: {
							where: {
								status: 1
							},
							include: [
								{
									relation: "countries",
									scope: {
										where: {
											status: 1
										}
									}
								}
							]
						}
					}
				]
			}, function (err, userData) {
				if (err) {
					console.log(err);
				}
				if (userData.status !== 1) {
					errormessage.status = false;
					errormessage.message = "Your accound has been deactivated. Please contact administrator.";
					//return callback(loginErr);
					return callback(null, errormessage);
				} else {
					userData.token = loginToken.id;
					userData.ttl = loginToken.ttl;
					userData.userType = userData.toJSON().user_Type.type_name;
					return callback(null, userData);
				}
			})
		});
	};

	/** Register a path for the new login function
	 */
	Users.remoteMethod(
		'userlogin',
		{
			http: { path: '/userlogin', verb: 'post' },
			description: 'User login',
			accepts: [{ arg: 'credentials', type: 'object', http: { source: 'body' }, required: true }],
			returns: { root: true, type: 'object' },

		}
	);

	Users.getAllUsers = async function (user_id, data, cb) {

		let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
		let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
		let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
		let username = (data.username == undefined || data.username == null || data.username == '') ? undefined : new RegExp(data.username, "i");
		let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : new RegExp(data.email, "i");
		let user_type_id = (data.user_type_id == undefined || data.user_type_id == null || data.user_type_id == '') ? undefined : data.user_type_id;
		let cond = await usersCond(user_id, school_id, class_id, section_id, username, email, user_type_id);
		let result = await getUsersList(cond);
		return result
	}

	Users.remoteMethod(
		'getAllUsers',
		{
			http: { path: '/getAllUsers', verb: 'post' },
			description: 'Get all users',
			accepts: [
				{ arg: 'user_id', type: 'number' },
				{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: [{ root: true, type: 'json' }],

		}
	);

	let usersCond = (user_id, school_id, class_id, section_id, username, email, user_type_id) => {
		return new Promise((resolve, reject) => {
			Users.findOne({
				where: { id: user_id },
				include: [
					{
						relation: "user_Type",
						scope: {
							where: { status: 1 }
						}
					},
					{
						relation: "user_class",
						scope: {
							where: { status: 1 }
						}
					}
				]
			}, function (err, result) {
				if (err) reject(err);
				// console.log(result);
				let response = JSON.parse(JSON.stringify(result));
				let cond = {};
				let searchCond = {};
				if (response.user_Type.type_order != 3) {

					if (school_id != undefined) {
						searchCond.school_id = { inq: school_id }
					}
					if (class_id != undefined) {
						searchCond.class_id = { inq: class_id }
					}
					if (section_id != undefined) {
						searchCond.section_id = { inq: section_id }
					}
				} else {
					let userSchool = [];
					let userClass = [];
					let userSection = [];
					response.user_class.forEach(element => {
						userSchool.push(element.school_id);
						userClass.push(element.class_id);
						userSection.push(element.section_id);
					});
					if (school_id == undefined) {
						school_id = userSchool
					}
					if (class_id == undefined) {
						class_id = userClass
					}
					if (section_id == undefined) {
						section_id = userSection
					}
					searchCond = {
						school_id: { inq: school_id },
						class_id: { inq: class_id },
						section_id: { inq: section_id }
					}
				}
				let Userclasses = Users.app.models.user_classes;
				// console.log(searchCond);
				Userclasses.find({ where: searchCond }, function (error, res) {
					if (error) reject(error);
					let userIds = [];
					res.forEach(element => {
						userIds.push(element.user_id);
					});
					userIds = userIds.filter((v, i, a) => a.indexOf(v) === i);
					userIds = userIds.filter((v) => { return v != user_id });
					cond = {
						id: { inq: userIds },
						username: username,
						email: email,
						user_type_id: user_type_id
					}
					resolve(cond);
				})
			})
		});
	}

	let getUsersList = (cond) => {
		return new Promise((resolve, reject) => {
			let errorMessage = {};
			Users.find({
				where: cond,
				include: [
					{
						relation: "user_Type",
						scope: {
							where: { status: 1 }
						}
					},
					{
						relation: "assignedTo",
						scope: {
							where: { status: 1 }
						}
					}
				]
			}, function (err, result) {
				if (err) {
					console.log(err);
					errorMessage.status = false;
					errorMessage.message = "Invalid user";
					reject(errorMessage);
				}
				resolve(result);
			});
		})
	}

	Users.getUser = function (user_id, cb) {
		let message = {};

		if (user_id == undefined) {
			message.status = false;
			message.message = "Please provide the user id";
			return cb(null, errorMessage);
		}

		Users.findOne({
			where: { id: user_id },
			include: [
				{
					relation: "user_class",
					scope: {
						include: [
							{
								relation: "school",
								scope: {
								}
							},
							{
								relation: "class",
								scope: {
								}
							}
						]
					}
				},
				{
					relation: "user_countries",
					scope: {
					}
				},
				{
					relation: "quizUser",
					scope: {
						include: [
							{
								relation: "schoolUserData",
								scope: {
									include: [
										{
											relation: 'userDataSchool',
											scope: {
											}
										}
									]
								}
							}
						]
					}
				}
			]
		}, function (err, result) {
			if (err) {
				cb(null, err);
			}
			cb(null, result);
		});
	}

	Users.remoteMethod(
		'getUser',
		{
			http: { path: '/getuser/:id', verb: 'get' },
			description: 'Get user',
			accepts: [{ arg: 'id', type: 'string', required: true }],
			returns: { root: true, type: 'json' },

		}
	);

	Users.updateUser = function (id, data, cb) {
		//console.log(data);
		let msg = {};
		if (id == null || id == undefined || id == null) {
			msg.status = false;
			msg.message = "Please provide user id"
			return cb(null, msg);
		}
		// Users.update({"_id":id},data,function(err,data){           
		Users.upsertWithWhere({ "id": id }, data, function (err, data) {
			if (err) {
				//cb(null,err);
				console.log(err);
			}
			msg.status = true;
			msg.message = "User has been updated successfully.";
			cb(null, msg);

		});
	}

	Users.remoteMethod(
		'updateUser',
		{
			http: { path: '/updateUser/:id', verb: 'post' },
			description: 'Update user',
			accepts: [{ arg: 'id', type: 'string', required: true },
			{ arg: 'data', type: 'object', required: true, http: { source: 'body' } }],
			returns: { arg: 'response', type: 'json' }
		}
	);


	Users.createUser = async function (data, cb) {

		let msg = {};
		let user_id = (data.id == undefined || data.id == null || data.id == '') ? 0 : data.id;
		let firstName = (data.firstName == undefined || data.firstName == null || data.firstName == '') ? undefined : data.firstName;
		let lastName = (data.lastName == undefined || data.lastName == null || data.lastName == '') ? undefined : data.lastName;
		let username = (data.username == undefined || data.username == null || data.username == '') ? undefined : data.username;
		let password = (data.password == undefined || data.password == null || data.password == '') ? undefined : data.password;
		let contactNumber = (data.contactNumber == undefined || data.contactNumber == null || data.contactNumber == '') ? undefined : data.contactNumber;
		let altNumber = (data.altNumber == undefined || data.altNumber == null || data.altNumber == '') ? undefined : data.altNumber;
		let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
		let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' || data.country_id.length < 0) ? undefined : data.country_id;
		let user_type_id = (data.user_type_id == undefined || data.user_type_id == null || data.user_type_id == '') ? undefined : data.user_type_id;
		let status = (data.status == undefined || data.status == null) ? undefined : data.status;
		let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
		let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
		let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
		let assigned_to = (data.assigned_to == undefined || data.assigned_to == null || data.assigned_to == '') ? undefined : data.assigned_to;
		let quiz_user_id = (data.quiz_user_id == undefined || data.quiz_user_id == null || data.quiz_user_id == '') ? undefined : data.quiz_user_id;
		let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
		let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '' ? undefined : data.modified_by);

		if (school_id == undefined) {
			school_id = [0]
		}

		if (class_id == undefined) {
			class_id = [0]
		}

		if (section_id == undefined) {
			section_id = [0]
		}

		if (user_id == 0 && password == undefined) {        // uses only in case of create new user
			msg.status = false;
			msg.message = "Please provide the password";
			return cb(null, msg);
		}

		if (firstName == undefined) {
			msg.status = false;
			msg.message = "Please provide the first Name";
			return cb(null, msg);
		}

		if (lastName == undefined) {
			msg.status = false;
			msg.message = "Please provide the last Name";
			return cb(null, msg);
		}

		if (username == undefined) {
			msg.status = false;
			msg.message = "Please provide the username";
			return cb(null, msg);
		}

		if (contactNumber == undefined) {
			msg.status = false;
			msg.message = "Please provide the contact Number";
			return cb(null, msg);
		}

		if (country_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the Country";
			return cb(null, msg);
		}

		if (user_type_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the user type id";
			return cb(null, msg);
		}

		if (status == undefined) {
			msg.status = false;
			msg.message = "Please provide the status";
			return cb(null, msg);
		}

		// let userObj = {
		// 	username: username,
		// 	password: password,
		// 	firstName: firstName,
		// 	lastName: lastName,
		// 	contactNumber: contactNumber,
		// 	altNumber: altNumber,
		// 	email: email,
		// 	user_type_id: user_type_id,
		// 	assigned_to: assigned_to,
		// 	quiz_user_id: quiz_user_id,
		// 	status: status
		// }

		try {
			if (quiz_user_id == undefined) {
				let quizUser = await getQuizUserId(username);
				if (quizUser) {
					quiz_user_id = quizUser.id;
				} else {
					msg.status = false;
					msg.message = "Please signup the user first.";
					return cb(null, msg);
				}
			}
			let result = await addUser(user_id, username, password, firstName, lastName, contactNumber, altNumber,
				email, user_type_id, assigned_to, quiz_user_id, status, created_by, modified_by)

			if (result.status) {
				if (user_id != 0) {
					let destroyClasses = await destroyClass(user_id);
					await destroyCountry(user_id);
				}

				let userClasscreate = await userClassCreate(school_id, class_id, section_id, result.data, status);
				await userCountry(result.data, country_id, status);

				if (userClasscreate.status) {
					msg.status = true;
					msg.message = "User has added successfully.";
					return cb(null, msg);
				}
			} else {
				return cb(null, result);
			}
		} catch (error) {
			throw error
		}
	}

	Users.remoteMethod(
		'createUser',
		{
			http: { path: '/createUser', verb: 'post' },
			description: 'CreateUser user',
			accepts: [{ arg: 'data', type: 'object', required: true, http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	let getQuizUserId = (username) => {
		return new Promise((resolve, reject) => {
			let msg = {};
			let Quizuser = Users.app.models.quiz_user;
			Quizuser.findOne({ where: { username: username } }, function (err, result) {
				if (err) {
					msg = { status: false, message: err };
					reject(msg);
				}
				resolve(result);
			})
		})
	}

	let addUser = (user_id, username, password, firstName, lastName, contactNumber, altNumber,
		email, user_type_id, assigned_to, quiz_user_id, status, created_by, modified_by) => {
		return new Promise((resolve, reject) => {
			let msg = {};
			let userObj = {
				username: username,
				password: password,
				firstName: firstName,
				lastName: lastName,
				contactNumber: contactNumber,
				altNumber: altNumber,
				email: email,
				user_type_id: user_type_id,
				assigned_to: assigned_to,
				quiz_user_id: quiz_user_id,
				created_by: created_by,
				modified_by: modified_by,
				status: status
			}
			Users.upsertWithWhere({ id: user_id }, userObj, function (err, result) {
				if (err) {
					console.log("im here 522", err);
					msg = { status: false, message: err }
					reject(msg);
				}
				msg = { status: true, data: result }
				resolve(msg);
			});
		})
	}


	let userClassCreate = (school_id, class_id, section_id, result, status) => {
		return new Promise((resolve, reject) => {
			let msg = {};
			// let class_section = Users.app.models.class_sections;
			let Userclasses = Users.app.models.user_classes;
			school_id.forEach((schools_id) => {

				class_id.forEach((classes_id) => {

					section_id.forEach((sections_id) => {

						if (sections_id != 0) {
							let Classsections = Users.app.models.class_sections;
							Classsections.find({ where: { class_id: classes_id } }, function (err, classRes) {
								let tempSectionIds = []
								classRes.forEach((obj) => { tempSectionIds.push(obj.id); });
								let found = tempSectionIds.find(element => element == sections_id);

								let userClassObj = {
									user_id: result.id,
									school_id: schools_id,
									class_id: classes_id,
									section_id: sections_id,
									status: status
								}
								// console.log(userClassObj);
								if (found) {
									Userclasses.upsert(userClassObj, function (err, res) {
										if (err) {
											console.log(err);
											msg.status = false;
											msg.message = err;
											reject(msg);
										}
									});
								}
							});
						}
					});
				});
			});
			msg.status = true;
			msg.message = "User has added successfully.";
			resolve(msg);
		});
	}

	let destroyClass = (user_id) => {
		return new Promise((resolve, reject) => {
			let Userclasses = Users.app.models.user_classes;
			Userclasses.destroyAll({ user_id: user_id }, function (err, res) {
				if (err) {
					reject(err);
				}
				resolve();
			});
		})
	}

	let destroyCountry = (user_id) => {
		return new Promise((resolve, reject) => {
			let Usercountries = Users.app.models.user_countries;
			Usercountries.destroyAll({ user_id: user_id }, function (err, res) {
				if (err) {
					reject(err);
				}
				resolve();
			});
		})
	}

	let userCountry = (result, country_id, status) => {
		return new Promise((resolve, reject) => {
			let msg = {};
			let Usercountries = Users.app.models.user_countries;
			country_id.forEach((countryId) => {
				let userCountryObj = {
					user_id: result.id,
					country_id: countryId,
					status: status
				}
				Usercountries.upsert(userCountryObj, function (err, res) {
					if (err) {
						console.log(err);
						msg = { status: false, message: err }
						reject(msg);
					}
				});
			});
			resolve();
		})
	}


	Users.getTypeUsers = function (data, cb) {
		let user_type_id = (data.user_type_id == undefined || data.user_type_id == null || data.user_type_id == '') ? undefined : data.user_type_id;
		let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
		let msg = {};
		let cond = {}
		if (user_type_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the user type id";
			return cb(null, msg);
		}
		let userType = Users.app.models.user_types;

		userType.findOne({ where: { id: user_type_id } }, function (err, res) {
			if (err) {
				console.log(err);
				cb(null, err);
			}

			userType.find({ where: { type_order: { lt: res.type_order } } }, function (err, result) {
				if (err) {
					console.log(err);
					cb(null, err);
				}
				let userTypeIdArr = [];
				result.forEach(element => {
					userTypeIdArr.push(element.id)
				})

				if (user_id == undefined) {
					cond = {
						"user_type_id": { inq: userTypeIdArr },
						"status": 1
					}
				} else {
					cond = {
						"user_type_id": { inq: userTypeIdArr },
						"id": { neq: user_id },
						"status": 1
					}
				}
				Users.find({
					where: cond,
					include: [{
						relation: "user_Type",
						scope: {
							fields: ['type_name']
						}
					}]
				}, function (err, users) {
					if (err) {
						console.log(err);
						return cb(null, err);
					}
					msg.status = true,
						msg.data = users
					return cb(null, msg);
				});
			})
		});
		// console.log("381",type_order);

	}

	Users.remoteMethod(
		'getTypeUsers',
		{
			http: { path: '/getTypeUsers', verb: 'post' },
			description: 'Users list to assiged someone',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' }, required: true }],
			returns: { root: true, type: 'json' }
		}
	);


	Users.getAssignUsers = async function (data, cb) {
		// console.log(data);
		let msg = {};
		let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;

		if (user_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the user id";
			return msg;
		}
		try {
			let assignedArr = [];
			let userArr = [];
			userArr.push(user_id);
			let userIds = await allUserIds(userArr, assignedArr);
			let userData = await getUsersData(assignedArr);
			return userData;
		} catch (error) {
			throw error;
		}
	}

	Users.remoteMethod(
		'getAssignUsers',
		{
			http: { path: '/getAssignUsers', verb: 'post' },
			description: 'Users list to assiged someone',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' }, required: true }],
			returns: { root: true, type: 'json' }
		}
	);

	let allUserIds = (user_id, assignedArr) => {
		return new Promise((resolve, reject) => {
			let createdIds = [];
			Users.find({
				where: {
					and:
						[
							{ status: 1 },
							{ assigned_to: { inq: user_id } }
						]
				}
			}, function (err, result) {
				if (err) {
					return err;
				}
				if (result.length > 0) {
					for (let i = 0; i < result.length; i++) {
						assignedArr.push(result[i].id);
						createdIds.push(result[i].id);
					}
					resolve(allUserIds(createdIds, assignedArr));
				}
				else {
					resolve(assignedArr);
				}
			});
		});
	}

	let getUsersData = (assignedArr) => {
		return new Promise((resolve, reject) => {
			let msg = {};
			Users.find({
				where: { id: { inq: assignedArr } },
				include: [{
					relation: "user_Type",
					scope: { fields: ['type_name'] }
				}]
			}, function (err, result) {
				if (err) {
					return err;
				}
				msg.status = true,
					msg.data = result
				resolve(msg);
			});
		});
	}

	Users.chkUser = function (email, contactNumber, cb) {
		let msg = {};

		if (contactNumber == "" || contactNumber == undefined || contactNumber == null) {
			msg.status = false;
			msg.message = "Please provide contact number."
			return cb(null, msg);
		}

		if (email == '' || email == undefined || email == null) {
			msg.status = false;
			msg.message = "Please provide email."
			return cb(null, msg);
		} else {
			if (!ValidateEmail(email)) {
				msg.status = false;
				msg.message = "Invalid Email. Please try again."
				return cb(null, msg);
			}
		}

		Users.findOne({
			where: { or: [{ email: email }, { contactNumber: contactNumber.substring(contactNumber.length - 10) }] },
			include: [
				{
					relation: "user_class",
					scope: {
						where: { status: 1 },
						include: [
							{
								relation: "school",
								scope: {
									fields: ["school_name", "school_code"]
								}
							},
							{
								relation: "class",
								scope: {
									fields: ["class_name"]
								}
							}, {
								relation: "class_Section",
								scope: {
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
				}
			]
		}, function (err, result) {
			if (err) {
				msg.status = false;
				msg.message = err.message;
				return cb(null, msg);
			}
			let message = "User does not exits. Please try again.";
			if (result) {
				message = "User exists";
			}
			msg.status = true;
			msg.message = message;
			msg.data = result;
			return cb(null, msg);
		});
	}

	Users.remoteMethod(
		'chkUser',
		{
			http: { path: '/chkUser', verb: 'post' },
			description: 'Check user',
			accepts: [{ arg: 'email', type: 'string', required: true },
			{ arg: 'contactNumber', type: 'string', required: true }],
			returns: { root: true, type: 'json' },

		}
	);

	let ValidateEmail = (mail) => {
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
			return true;
		}
		return false;
	}


	Users.appLogin = function (credentials, callback) {
		let errormessage = {};
		let quizUser = Users.app.models.quiz_user;

		return quizUser.findOne({
			where: {
				username: credentials.username,
				id: credentials.user_id,
				token: credentials.token
			}
		}, function (err, quizUserData) {

			if (err) {
				setImmediate(() => {
					console.log(err);
				})
				errormessage.status = false;
				errormessage.message = "Error! Please try again";
				return callback(null, errormessage);
			}

			if (quizUserData) {
				if (quizUserData.status !== 1) {
					errormessage.status = false;
					errormessage.message = "Your accound has been deactivated. Please contact administrator.";
					return callback(null, errormessage);
				} else {
					return Users.findOne({
						where: { username: credentials.username },
						include: [
							{
								relation: "user_Type",
								scope: {
									fields: ['type_name', 'type_order']
								}
							},
							{
								relation: "user_class",
								scope: {}
							},
							{
								relation: "user_countries",
								scope: {
									where: {
										status: 1
									},
									include: [
										{
											relation: "countries",
											scope: {
												where: {
													status: 1
												}
											}
										}
									]
								}
							}
						]
					}, function (err, userData) {
						if (err) {
							console.log(err);
						}
						if (userData) {
							if (userData.status !== 1) {
								errormessage.status = false;
								errormessage.message = "Your accound has been deactivated. Please contact administrator.";
								//return callback(loginErr);
								return callback(null, errormessage);
							} else {
								userData.token = credentials.token;
								userData.ttl = 1000;
								userData.userType = userData.toJSON().user_Type.type_name;
								return callback(null, userData);
							}
						} else {
							errormessage.status = false;
							errormessage.message = "Invalid credentials. Please try again.";
							//return callback(loginErr);
							return callback(null, errormessage);
						}
					});
				}
			} else {
				errormessage.status = false;
				errormessage.message = "You are not authorized. Please contact administrator.";
				//return callback(loginErr);
				return callback(null, errorMessage);
			}
		});

	};

	/** Register a path for the new login function
	 */
	Users.remoteMethod(
		'appLogin',
		{
			http: { path: '/applogin', verb: 'post' },
			description: 'Auto login',
			accepts: [{ arg: 'credentials', type: 'object', http: { source: 'body' }, required: true }],
			returns: { root: true, type: 'object' },

		}
	);


	Users.chkAdminUser = function (data, cb) {
		let msg = {};
		let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
		let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;

		if (school_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the school id";
			return cb(null, msg);
		}

		if (email == undefined) {
			msg.status = false;
			msg.message = "Please provide email."
			return cb(null, msg);
		} else {
			if (!ValidateEmail(email)) {
				msg.status = false;
				msg.message = "Invalid Email. Please try again."
				return cb(null, msg);
			}
		}

		let Userclasses = Users.app.models.user_classes
		Userclasses.find({ where: { school_id: { inq: school_id } } }, function (err, res) {
			if (err) {
				msg.status = false;
				msg.message = err.message;
				return cb(null, msg);
			}
			let userIds = [];
			res.forEach(element => {
				userIds.push(element.user_id);
			});
			userIds = userIds.filter((v, i, a) => a.indexOf(v) === i);
			let schoolAdmin = [];
			Users.find({ where: { id: { inq: userIds } } }, function (err, response) {
				response.forEach(element => {
					if (element.user_type_id == 4) {
						schoolAdmin.push(element);
					}
				})
				Users.findOne({ where: { email: email } }, function (err, result) {
					if (err) {
						msg.status = false;
						msg.message = err.message;
						return cb(null, msg);
					}
					let message = "User does not exits.";
					if (result) {
						msg.message = "User is already registered. Please login.";
						msg.status = true;
					} else {
						msg.status = false;
						msg.message = message;
						msg.schoolAdmin = schoolAdmin
					}
					return cb(null, msg);
				});
			})
		});
	}

	Users.remoteMethod(
		'chkAdminUser',
		{
			http: { path: '/chkAdminUser', verb: 'post' },
			description: 'Check user',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);

	Users.getClassStudents = function (data, cb) {
		let msg = {};
		let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
		let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
		let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
		let section_name = (data.section_name == undefined || data.section_name == null || data.section_name == '' ? undefined : data.section_name);
		let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : new RegExp(data.email, "i");
		let params;

		let schoolCond = {}
		if (Array.isArray(school_id)) {
			schoolCond = school_id.join();
		} else {
			schoolCond = school_id;
		}

		let classCond = '';
		if (class_id == undefined) {

		} else {
			if (Array.isArray(class_id)) {
				classCond = ` and uc.class_id IN(${class_id.join()})`;
			} else {
				classCond = ` and uc.class_id = ${class_id}`;
			}
		}

		let sectionCond = '';
		if (section_id == undefined) {

		} else {
			console.log("section_id")
			if (Array.isArray(section_id)) {
				sectionCond = ` and uc.section_id IN(${section_id.join()})`;
			} else {
				sectionCond = ` and uc.section_id = ${section_id}`;
			}
		}

		if (section_name == undefined) {

		} else {
			sectionCond += ` and s.section_name = '${section_name}'`;
		}

		var ds = Users.dataSource;
		var sql = `SELECT u.id, u.quiz_user_id, u.firstName, u.lastName, uc.school_id, 
		uc.class_id, uc.section_id FROM user u
		left join user_types ut on u.user_type_id = ut.id
        left join user_classes uc on u.id = uc.user_id
		left join class_sections cs on cs.id = uc.section_id
		left join sections s on s.id = cs.section_id
        where 1=1 and u.status=1 and uc.status=1 and ut.type_name = 'Student'
		and uc.school_id IN(${schoolCond}) ${classCond} ${sectionCond} 
		group by uc.user_id`;
		// console.log(sql);

		ds.connector.query(sql, params, function (err, res) {
			if (err) {
				console.log(err);
				msg.status = false;
				msg.message = "Invalid Data";
				return cb(null, msg)
			} else {
				msg = { status: true, data: res };
				return cb(null, msg);
			}
		});
	}

	Users.remoteMethod(
		'getClassStudents',
		{
			http: { path: '/getClassStudents', verb: 'post' },
			description: 'Get all assigned students to the school/class/section',
			accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
			returns: [{ root: true, type: 'json' }],
		}
	);

	Users.on("resetPasswordRequest", function (value) {
		let userData = value.user;
		let userId = (userData.id == undefined || userData.id == null || userData.id == '') ? undefined : userData.id;
		if (userId == undefined) {
			return false;
		} else {
			// console.log(userId);
			let newPassword = value.options.newPassword;
			userData.password = newPassword;
			// console.log(userData);
			Users.upsertWithWhere({ id: userId }, { password: userData.password }, function (err, userValData) {
				if (err) {
					console.log("Unable to reset");
					// cb(null, err);				
				}
			});
		}
	});

	//For sending class code request to OKS School - admin and school admin
	Users.classCodeMail = function (data, cb) {
		// console.log(data);
		let firstName = (data.firstName == undefined || data.firstName == null || data.firstName == '') ? undefined : data.firstName;
		let lastName = (data.lastName == undefined || data.lastName == null || data.lastName == '') ? '' : data.lastName;
		let contactNumber = (data.contactNumber == undefined || data.contactNumber == null || data.contactNumber == '') ? undefined : data.contactNumber;
		let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
		let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' || data.country_id.length < 0) ? undefined : data.country_id;
		let msg = {};

		if (firstName == undefined) {
			msg.status = false;
			msg.message = "Please enter first name.";
			return cb(null, msg);
		}

		if (email == undefined) {
			msg.status = false;
			msg.message = "Please enter the email address.";
			return cb(null, msg);
		}

		var ds = Users.dataSource;
		let params;
		let school_id = 3 //OKS School
		let user_type_ids = [2,4];
		user_type_ids = user_type_ids.join(); //Admin and School Admin of OKS School

		var sql = `SELECT * FROM user u
        left join user_classes uc on u.id = uc.user_id
        where u.status=1 and u.user_type_id IN(${user_type_ids}) 
		and uc.school_id = ${school_id}
		group by uc.user_id`;

		ds.connector.query(sql, params, function (err, res) {
			if (err) {
				console.log(err);
				msg.status = false;
				msg.message = "Invalid Data";
				return cb(null, msg)
			} else {
				// console.log(res);
				res.forEach(user => {
					let emailMessage = `
				<html>
					<body>
						<p>Hello Admin,</p>
						<p>I'm registered as a trial user on <b>Marksharks Classroom</b>.</p>
						<p> I would like to upgrade my account. 
						So, please upgrade my account.</p>
												
						<p>Best Regards,</p>
						<div>${firstName} ${lastName}</div>
						<div>
							Email: ${email}
						</div>
						<div>
							Contact Number: ${country_id}-${contactNumber}
						</div>
					</body>
				</html>`;
					// mailPush(email, user.email, "Request for class code", emailMessage);
					mailPush('teacher@marksharks.com', user.email, "Request for account upgrade", emailMessage);
				})
				msg = { status: true, message: "Request sent successfully" };
				return cb(null, msg);
			}
		});
	}

	Users.remoteMethod(
		'classCodeMail',
		{
			http: { path: '/classCodeMail', verb: 'post' },
			description: 'class Code request Mail',
			accepts: [{ arg: 'data', type: 'object', required: true, http: { source: 'body' } }],
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

	Users.trialUserInfo = function (data, cb) {
		// console.log(data);
		let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '') ? undefined : data.country_id;
		let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
		let msg = {};

		if (country_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the country";
			return cb(null, msg);
		}

		if (class_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the class";
			return cb(null, msg);
		}

		// var ds = Users.dataSource;
		// let params;
		// var sql = `SELECT cs.id FROM classes c
        // LEFT JOIN class_sections cs on cs.class_id = c.id
        // LEFT JOIN subjects s on s.id = qsyb.subject_id
        // where u.status=1 and u.user_type_id IN(2, 4) and uc.school_id = 7
		// group by uc.user_id`;

		// ds.connector.query(sql, params, function (err, res) {
		// 	if (err) {
		// 		console.log(err);
		// 		msg.status = false;
		// 		msg.message = "Invalid Data";
		// 		return cb(null, msg)
		// 	} else {
		// 		// console.log(res);
		// 		res.forEach(user => {
		// 			let emailMessage = `
		// 		<html>
		// 			<body>
		// 				<p>Hello ${user.username},</p>
		// 				<p> My name is ${firstName} ${lastName} and my emailId is ${email}. Please provide me Class code.</p>
		// 				<p>Thanks and Regards.</p>
		// 			</body>
		// 		</html>`;
		// 			mailPush(email, user.email, "Request for class code", emailMessage);
		// 		})
		// 		msg = { status: true, message: "Mail sent successfully" };
		// 		return cb(null, msg);
		// 	}
		// });
	
		let Schools = Users.app.models.schools;
		let ClassSections = Users.app.models.class_sections;
		let Subjects = Users.app.models.subjects;
		Schools.findOne({where: {school_code: "MRKSTRIAL"}}, function(err, schoolRes){
			ClassSections.findOne({ where: { class_id: class_id, section_id: 1}}, function(err, sectionRes){
				Subjects.find({
					where: {
						and: [
							{class_id: class_id},
							{ or: [{subject_name:"Maths"}, {subject_name:"Science"}]}
						]						
					}
				}, function(err, subjectRes){
					msg = { status: true, school: schoolRes, section: sectionRes, subject: subjectRes };
					return cb(null, msg);
				})
			})
		})
	}

	Users.remoteMethod(
		'trialUserInfo',
		{
			http: { path: '/trialUserInfo', verb: 'post' },
			description: 'class Code request Mail',
			accepts: [{ arg: 'data', type: 'object', required: true, http: { source: 'body' } }],
			returns: { root: true, type: 'json' }
		}
	);
};
