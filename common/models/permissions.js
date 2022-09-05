'use strict';

module.exports = function (Permissions) {

    //API For Adding A New Permission
    Permissions.addNewPermission = function (data, res, cb) {
        let msg = {};
        let parent_id = (data.parent_id == undefined || data.parent_id == null || data.parent_id == '') ? undefined : data.parent_id;
        let label = (data.label == undefined || data.label == null || data.label == '') ? undefined : data.label;
        let description = (data.description == undefined || data.description == null || data.description == '') ? undefined : data.description;
        let link = (data.link == undefined || data.link == null || data.link == '') ? undefined : data.link;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let showStatus = (data.showStatus == undefined || data.showStatus == null ? undefined : data.showStatus);
        let icon = (data.icon == undefined || data.icon == null || data.icon == '') ? undefined : data.icon;
        let menu_order = (data.menu_order == undefined || data.menu_order == null) ? undefined : data.menu_order;
        let externalRedirect = (data.externalRedirect == undefined || data.externalRedirect == null) ? undefined : data.externalRedirect;
        let hrefTargetType = (data.hrefTargetType == undefined || data.hrefTargetType == null) ? undefined : data.hrefTargetType;
        //console.log(data);
        if (label == undefined) {
            msg = { status: false, message: "Please provide label" };
            return cb(null, msg);
        }

        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }

        let obj = {
            parent_id: parent_id,
            label: label,
            description: description,
            link: link,
            menu_order: menu_order,
            externalRedirect: externalRedirect,
            hrefTargetType: hrefTargetType,
            showStatus: showStatus,
            status: status,
            icon: icon
        }
        Permissions.findOne({ where: { parent_id: parent_id, label: label } }, function (err, res) {
            if (res) {
                msg = { status: false, message: "Same label already exist on this id" }
                return cb(null, msg);
            } else {
                Permissions.upsert(obj, function (err, result) {
                    if (err) {
                        console.log(err);
                        return cb(null, err);
                    }
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
            }
        });
    }

    Permissions.remoteMethod(
        'addNewPermission',
        {
            http: { path: '/addNewPermission', verb: 'post' },
            description: 'addNewPermission',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    // API for Getting Permissions List By Parent Id
    Permissions.getPermissions = function (data, res, cb) {
        let parent_id = (data.parent_id == undefined || data.parent_id == null ? undefined : data.parent_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let msg = {};

        if (parent_id == undefined) {
            msg = { status: false, message: "Please provide parent id" };
            return cb(null, msg);
        }

        Permissions.find({
            where: { parent_id: parent_id }
        }, function (err, response) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            Permissions.find({
                where: { parent_id: parent_id },
                order: 'parent_id ASC',
                skip: offset,
                limit: limit
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    msg = { status: false, msg: err };
                    return cb(null, msg);
                }
                // console.log(result)
                msg = { status: true, data: result, totalPermission: response.length };
                return cb(null, msg);
            });
        });
    }

    Permissions.remoteMethod(
        'getPermissions',
        {
            http: { path: '/getPermissions', verb: 'post' },
            description: 'Get parent content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    //API for getting Permission Data
    Permissions.getPermissionsById = function (data, cb) {
        let msg = {};
        let parent_id = (data.parent_id == undefined || data.parent_id == null ? undefined : data.parent_id);
        if (parent_id == undefined) {
            msg = { status: false, message: "Please provide parent id" };
            return cb(null, msg);
        }

        Permissions.findOne({
            where: {
                id: parent_id
            }
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Permissions.remoteMethod(
        'getPermissionsById',
        {
            http: { path: '/getPermissionsById', verb: 'post' },
            description: 'Get parent by id',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    //API for updating any Permission 
    Permissions.updatePermission = function (data, cb) {
        let msg = {};
        let parent_id = (data.parent_id == undefined || data.parent_id == null || data.parent_id == '') ? undefined : data.parent_id;
        let description = (data.description == undefined || data.description == null || data.description == '') ? '' : data.description;
        let label = (data.label == undefined || data.label == null || data.label == '') ? undefined : data.label;
        let link = (data.link == undefined || data.link == null || data.link == '') ? '' : data.link;
        let showStatus = (data.showStatus == undefined || data.showStatus == null ? undefined : data.showStatus);
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let icon = (data.icon == undefined || data.icon == null || data.icon == '') ? '' : data.icon;
        let menu_order = (data.menu_order == undefined || data.menu_order == null) ? undefined : data.menu_order;
        let externalRedirect = (data.externalRedirect == undefined || data.externalRedirect == null) ? undefined : data.externalRedirect;
        let hrefTargetType = (data.hrefTargetType == undefined || data.hrefTargetType == null) ? undefined : data.hrefTargetType;
        //console.log(data);
        if (label == undefined) {
            msg = { status: false, message: "Please provide label" };
            return cb(null, msg);
        }
        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }
        let updatePermission = {
            label: label,
            description: description,
            link: link,
            menu_order: menu_order,
            externalRedirect: externalRedirect,
            hrefTargetType: hrefTargetType,
            showStatus: showStatus,
            status: status,
            icon: icon
        }

        Permissions.findOne({ where: { id: { neq: parent_id }, label: label } }, function (err, res) {
            if (res) {
                msg = { status: false, message: "Same label already exist on this  id" }
                console.log(msg);
                return cb(null, msg);
            }
            else {
                Permissions.update({ id: parent_id }, updatePermission, function (err, result) {
                    if (err) {
                        return cb(null, err);
                    }
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
            }
        });

    }

    Permissions.remoteMethod(
        'updatePermission',
        {
            http: { path: '/updatePermission', verb: 'post' },
            description: 'update Permission',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Permissions.getPrevParentId = function (data, cb) {
        let parent_id = (data.parent_id == undefined || data.parent_id == null ? undefined : data.parent_id);
        let msg = {};

        if (parent_id == undefined) {
            msg = { status: false, message: "Please provide the parent id" }
            return cb(null, msg);
        }

        Permissions.findOne({ where: { id: parent_id } }, function (err, permission) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: permission }
            return cb(null, msg);
        });
    }

    Permissions.remoteMethod(
        'getPrevParentId',
        {
            http: { path: '/getPrevParentId', verb: 'post' },
            description: 'Get Previous Parent Id',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Permissions.getPermission = function (data, cb) {
        let parent_id = (data.parent_id == undefined || data.parent_id == null ? undefined : data.parent_id);
        let loginUserId = (data.loginUserId == undefined || data.loginUserId == null ? undefined : data.loginUserId);
        let loginUserTypeId = (data.loginUserTypeId == undefined || data.loginUserTypeId == null ? undefined : data.loginUserTypeId);
        let user_id = (data.user_id == undefined || data.user_id == null ? undefined : data.user_id);
        let user_type_id = (data.user_type_id == undefined || data.user_type_id == null ? undefined : data.user_type_id);
        let msg = {};

        if (parent_id == undefined) {
            msg = { status: false, message: "Please provide the parent id" }
            return cb(null, msg);
        }

        if (loginUserId == undefined) {
            msg = { status: false, message: "Please provide the loginUserId id" }
            return cb(null, msg);
        }

        if (loginUserTypeId == undefined) {
            msg = { status: false, message: "Please provide the loginUserTypeId" }
            return cb(null, msg);
        }

        if (user_id == undefined && user_type_id == undefined) {
            msg = { status: false, message: "Please provide the user id or user_type_id" }
            return cb(null, msg);
        }

        var ds = Permissions.dataSource;
        let params;

        var sql;
        if (loginUserTypeId == 1) {
            sql = `SELECT p.id, p.parent_id, p.link, p.icon, p.menu_order as menu_order, p.showStatus FROM permissions p 
            where 1=1 and p.parent_id = ${parent_id}
            group by p.id order by p.menu_order`;
        } else {
            sql = `SELECT p.id, p.parent_id, p.link, p.icon, p.menu_order as menu_order, p.showStatus FROM permissions p 
            left join permission_roles pr on p.id = pr.permission_id
            where pr.user_type_id = ${loginUserTypeId} and p.status = 1 and pr.status = 1 
            and p.parent_id = ${parent_id}
            group by p.id
            union
            SELECT p.id, p.parent_id, p.link, p.icon, p.menu_order as menu_order, p.showStatus FROM permissions p 
            left join permission_users pu on p.id = pu.permission_id
            where  pu.user_id = ${loginUserId} and p.status = 1 and pu.status = 1
            and p.parent_id = ${parent_id}
            group by p.id order by menu_order`;
        }

        // console.log(sql);
        ds.connector.query(sql, params, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            let permission_id = [];
            result.forEach(element => { permission_id.push(element.id) });
            Permissions.find({
                where: { id: { inq: permission_id } },
                include: [
                    {
                        relation: "permissionUser",
                        scope: {
                            where: {
                                user_id: user_id,
                                status: 1
                            }
                        }
                    },
                    {
                        relation: "permissionRole",
                        scope: {
                            where: {
                                user_type_id: user_type_id,
                                status: 1
                            }
                        }
                    }
                ]
            }, function (err, permission) {
                if (err) {
                    return cb(null, err);
                }
                msg = { status: true, data: permission }
                return cb(null, msg);
            });
            // msg = { status: true, data: result }
            // return cb(null, msg);
        });
    }

    Permissions.remoteMethod(
        'getPermission',
        {
            http: { path: '/getPermission', verb: 'post' },
            description: 'Get All Permission',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Permissions.getUserPermissions = function (data, cb) {
        let parent_id = (data.parent_id == undefined || data.parent_id == null ? 0 : data.parent_id);
        let user_type_id = (data.user_type_id == undefined || data.user_type_id == null ? undefined : data.user_type_id);
        let user_id = (data.user_id == undefined || data.user_id == null ? undefined : data.user_id);
        let msg = {};

        if (user_type_id == undefined) {
            msg = { status: false, message: "Please provide the user type id" }
            return cb(null, msg);
        }

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide the user id" }
            return cb(null, msg);
        }

        var ds = Permissions.dataSource;
        var sql = `SELECT p.id, p.label, p.parent_id, p.link, p.icon, p.menu_order as menu_order, p.showStatus
        FROM permissions p 
        left join permission_roles pr on p.id = pr.permission_id
        where pr.user_type_id = ${user_type_id} and p.status = 1 
        and pr.status = 1 and p.parent_id = ${parent_id}
        group by p.id
        union
        SELECT p.id, p.label, p.parent_id, p.link, p.icon, p.menu_order as menu_order, p.showStatus
        FROM permissions p 
        left join permission_users pu on p.id = pu.permission_id
        where  pu.user_id = ${user_id} and p.status = 1 and pu.status = 1 and p.parent_id = ${parent_id}
        group by p.id order by menu_order, id`
        // console.log(sql)
        let params;
        ds.connector.query(sql, params, async function (err, result) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            let dataResult = [];
            if (result.length) {
                // console.log(result)
                var i;
                for (i = 0; i < result.length; i++) {
                    // console.log(result.length)
                    result = JSON.stringify(result);
                    result = JSON.parse(result);
                    let paramArr;
                    let permissionArr = [];
                    let hiddenParentVal = false;
                    permissionArr = await getUserAllPermissions(result[i].id, user_id, user_type_id);
                    if (result[i].showStatus == 0) {
                        hiddenParentVal = true;
                    }
                    paramArr = {
                        label: result[i].label,
                        link: result[i].link,
                        icon: result[i].icon,
                        showStatus: result[i].showStatus,
                        items: permissionArr,
                        hidden: hiddenParentVal
                    }
                    dataResult.push(paramArr);
                }
                // result.forEach(async (permVal)=> {  
                //     try {
                //         permissionArr = await getUserAllPermissions(permVal.id, user_id, user_type_id);
                //         if(permissionArr.length<1){
                //             permissionArr = [];
                //         }
                //         paramArr = {
                //             label: permVal.label,
                //             link: permVal.link,
                //             faIcon: permVal.icon,
                //             items: permissionArr
                //         }

                //         dataResult.push(paramArr);
                //         console.log(dataResult)
                //         return dataResult;
                //         // console.log(dataResult)
                //     } catch (error) {
                //         console.log(error)
                //         return false;
                //     }  
                // });
            }
            // console.log(dataResult);
            // let commonLinksArr = commonLinks(user_type_id); //For adding common links to the menu
            // dataResult = [...commonLinksArr,...dataResult];
            // console.log(dataResult);
            msg = { status: true, data: dataResult };
            return cb(null, msg);
        });
    }

    Permissions.remoteMethod(
        'getUserPermissions',
        {
            http: { path: '/getUserPermissions', verb: 'post' },
            description: 'Get All User Permissions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getUserAllPermissions = (parent_id, user_id, user_type_id, permissionArr = []) => {
        return new Promise((resolve, reject) => {
            var ds = Permissions.dataSource;
            var sql = `SELECT p.id, p.parent_id, p.label, p.link, p.icon, p.menu_order as menu_order, p.showStatus
            FROM permissions p 
            left join permission_roles pr on p.id = pr.permission_id
            where pr.user_type_id = ${user_type_id} and p.status = 1 
            and pr.status = 1 and p.parent_id = ${parent_id}
            group by p.id
            union
            SELECT p.id, p.parent_id, p.label, p.link, p.icon, p.menu_order as menu_order, p.showStatus
            FROM permissions p 
            left join permission_users pu on p.id = pu.permission_id
            where  pu.user_id = ${user_id} and p.status = 1 and pu.status = 1 
            and p.parent_id = ${parent_id}
            group by p.id`

            let params;
            ds.connector.query(sql, params, function (err, result) {
                if (err) {
                    reject(err.message);
                }
                // console.log("parent",parent_id,' : ',result.length)
                if (result.length > 0) {
                    result.forEach(permVal => {
                        result = JSON.stringify(result);
                        result = JSON.parse(result);
                        let hiddenVal = false;
                        if (permVal.showStatus == 0) {
                            hiddenVal = true;
                        }
                        let paramArr = {
                            label: permVal.label,
                            link: permVal.link,
                            icon: permVal.icon,
                            showStatus: permVal.showStatus,
                            hidden: hiddenVal
                        }
                        // console.log(paramArr);
                        permissionArr.push(paramArr);
                        resolve(getUserAllPermissions(permVal.id, user_id, user_type_id, permissionArr));
                    });
                }
                resolve(permissionArr);
            });
        });
    }

    Permissions.allowedLinks = function (data, cb) {
        let parent_id = 10;
        let msg = {};

        if (parent_id == undefined) {
            msg = { status: false, message: "Please provide the parent id" }
            return cb(null, msg);
        }

        Permissions.find({ where: { parent_id: parent_id } }, function (err, permission) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: permission }
            return cb(null, msg);
        });
    }

    Permissions.remoteMethod(
        'allowedLinks',
        {
            http: { path: '/allowedLinks', verb: 'post' },
            description: 'Get all allowed links',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Permissions.updateMenuOrder = function (data, cb) {
        let msg = {};
        let parent_id = (data.parent_id == undefined || data.parent_id == null || data.parent_id == '') ? undefined : data.parent_id;
        let menu_order = (data.menu_order == undefined || data.menu_order == null) ? undefined : data.menu_order;
        //console.log(data);

        if (menu_order == undefined) {
            msg = { status: false, message: "Please provide menu order" };
            return cb(null, msg);
        }

        let updateMenuOrder = {
            menu_order: menu_order,
        }
        Permissions.update({ id: parent_id }, updateMenuOrder, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Permissions.remoteMethod(
        'updateMenuOrder',
        {
            http: { path: '/updateMenuOrder', verb: 'post' },
            description: 'update Menu Order',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let commonLinks = (user_type_id) => {
        let linkArr = [];
        linkArr.push({
            label: 'Dashboard',
            link: 'dashboard',
            icon: 'home',
            showStatus: 1,
            hidden: false,
            enable: true
        });
        if(user_type_id != 8){ //To show the link only to the teachers and admins not to the students
            linkArr.push({
                label: 'School Content Management',
                link: 'content',
                icon: 'book',
                showStatus: 1,
                hidden: false,
                enable: false
            });
        }
        return linkArr;
    }

    Permissions.chkUserPermission = function (data, cb) {
        let link = (data.link == undefined || data.link == null || data.link == '' ? undefined : data.link);
        let user_type_id = (data.user_type_id == undefined || data.user_type_id == null || data.user_type_id == '' ? undefined : data.user_type_id);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let msg = {};

        if (user_type_id == undefined) {
            msg = { status: false, message: "Please provide the user type id." }
            return cb(null, msg);
        }

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide the user id." }
            return cb(null, msg);
        }

        if (link == undefined) {
            msg = { status: false, message: "Please provide the permission." }
            return cb(null, msg);
        }

        var ds = Permissions.dataSource;
        var sql = `SELECT p.id, p.label, p.parent_id, p.link, p.icon, p.menu_order as menu_order, p.showStatus
        FROM permissions p 
        left join permission_roles pr on p.id = pr.permission_id
        where pr.user_type_id = ${user_type_id} and p.status = 1 
        and pr.status = 1 and p.link = '${link}'
        group by p.id
        union
        SELECT p.id, p.label, p.parent_id, p.link, p.icon, p.menu_order as menu_order, p.showStatus
        FROM permissions p 
        left join permission_users pu on p.id = pu.permission_id
        where  pu.user_id = ${user_id} and p.status = 1 and pu.status = 1 and p.link = '${link}'
        group by p.id order by menu_order, id`
        // console.log(sql)
        let params;
        ds.connector.query(sql, params, async function (err, result) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            
            if (result.length) {
                // console.log(result)    
                msg.status = true;
                msg.message = "Found permission";
                return cb(null, msg);            
            } else {
                msg.status = false;
                msg.message = "Invalid permission";
                return cb(null, msg);
            }
        });
    }

    Permissions.remoteMethod(
        'chkUserPermission',
        {
            http: { path: '/chkUserPermission', verb: 'post' },
            description: 'Chk User Permission',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );
};
