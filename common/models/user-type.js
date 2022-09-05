'use strict';

module.exports = function(Usertype) {
    Usertype.getNextTypes = function(user_id,cb){        
        let user = Usertype.app.models.user;
        user.find({where:{id:user_id}},function(err,result){
            let type_id = result[0].user_type_id;            
            Usertype.find({where:{"id":type_id}},function(err,data){                
                let type_order = data[0].type_order;                
                Usertype.find({where:{"type_order":{gte:type_order}},"status":"Active"},function(err,usertype){
                    if(err){
                        cb(null,err);
                    }
                    cb(err,usertype);
                });
            })
        })
    }

    Usertype.remoteMethod(
        'getNextTypes',
        {
            http: {path: '/getNextTypes', verb: 'get'},
            description: 'Get user types lower than his grade',
            accepts: [{arg: 'user_id', type: 'string',required:true }],
            returns: {root: true, type: 'object'},
            
        }
    );


    Usertype.getUserTypes = function(data,cb){
        Usertype.find({},function(err,usertype){
            if(err){
                cb(null,err);
            }
            cb(err,usertype);
        });
    }

    Usertype.remoteMethod(
        'getUserTypes',
        {
            http: {path: '/getUserTypes', verb: 'post'},
            description: 'Get all user types',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
            
        }
    );


    Usertype.createUserType = function(data,cb){
        let msg = {};
        let type_name = (data.type_name == undefined || data.type_name == null || data.type_name == '') ? undefined : data.type_name;
		let type_order = (data.type_order == undefined || data.type_order == null || data.type_order == '') ? undefined : data.type_order;
		let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        
        if (type_name == undefined) {
			msg.status = false;
			msg.message = "Please provide the type name";
			return cb(null, msg);
		}

		if (type_order == undefined) {
			msg.status = false;
			msg.message = "Please provide the type order";
			return cb(null, msg);
		}

		if (status == undefined) {
			msg.status = false;
			msg.message = "Please provide the status";
			return cb(null, msg);
        }

        let typeObj = {
            type_name: type_name,
            type_order: type_order,    
            status: status
        }
        
        Usertype.upsertWithWhere({type_name: type_name}, typeObj, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            msg.status = true;
            msg.message = "User type has added successfully.";
            return cb(null, msg);
        });
    }

    Usertype.remoteMethod(
        'createUserType',
        {
            http: {path: '/createUserType', verb: 'post'},
            description: 'create new user types',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}

        }
    );


    Usertype.UserTypeById = function(data,cb){
        let msg = {};
        let type_id = (data.type_id == undefined || data.type_id == null || data.type_id == '') ? undefined : data.type_id;
        
        if (type_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the user type id";
			return cb(null, msg);
		}
        
        Usertype.findOne({
            where: {id: type_id}
        },function(err,usertype){
            if(err){
                return cb(null,err);
            }
            msg.status = true;
            msg.data = usertype
            return cb(null,msg);
        });
    }

    Usertype.remoteMethod(
        'UserTypeById',
        {
            http: {path: '/UserTypeById', verb: 'post'},
            description: 'Get all user types',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
            
        }
    );


    Usertype.updateUserType = function(data,cb){
        let msg = {};
        let type_id = (data.type_id == undefined || data.type_id == null || data.type_id == '') ? undefined : data.type_id;
        let type_name = (data.type_name == undefined || data.type_name == null || data.type_name == '') ? undefined : data.type_name;
		let type_order = (data.type_order == undefined || data.type_order == null || data.type_order == '') ? undefined : data.type_order;
		let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
      
        if(type_id == undefined ){
            msg = {status:false,message:"Please provide user type id"};
            return cb(null, msg);
        }

        if(type_name == undefined ){
            msg = {status:false,message:"Please provide type name"};
            return cb(null, msg);
        }

        if(type_order == undefined ){
            msg = {status:false,message:"Please provide type order"};
            return cb(null, msg);
        }

        if(status == undefined ){
            msg = {status:false,message:"Please provide status"};
            return cb(null, msg);
        }

        let updateObj = {
            type_name: type_name, 
            type_order:type_order, 
            status: status
        }

        Usertype.update({id: type_id}, updateObj, function(err,result){
            if(err){
                return cb(null, err);
            }
            msg = {status:true,data:result};
            return cb(null, msg);
        });
    }

    Usertype.remoteMethod(
        'updateUserType',
        {
            http: {path: '/updateUserType', verb: 'post'},
            description: 'update UserType',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );

};
