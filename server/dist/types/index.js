"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoles = exports.Permission = void 0;
var Permission;
(function (Permission) {
    Permission["USER_READ"] = "user:read";
    Permission["USER_WRITE"] = "user:write";
    Permission["USER_DELETE"] = "user:delete";
    Permission["ADMIN_READ"] = "admin:read";
    Permission["ADMIN_WRITE"] = "admin:write";
    Permission["ADMIN_DELETE"] = "admin:delete";
    Permission["SYSTEM_CONFIG"] = "system:config";
    Permission["SYSTEM_LOGS"] = "system:logs";
    Permission["ROLE_READ"] = "role:read";
    Permission["ROLE_WRITE"] = "role:write";
    Permission["ROLE_DELETE"] = "role:delete";
})(Permission || (exports.Permission = Permission = {}));
var UserRoles;
(function (UserRoles) {
    UserRoles["SUPER_ADMIN"] = "super_admin";
    UserRoles["ADMIN"] = "admin";
    UserRoles["MODERATOR"] = "moderator";
    UserRoles["USER"] = "user";
    UserRoles["GUEST"] = "guest";
})(UserRoles || (exports.UserRoles = UserRoles = {}));
//# sourceMappingURL=index.js.map