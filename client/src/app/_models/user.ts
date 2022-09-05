/* Defines the User entity */
export class User {
    id: number;
    token: string;
    username: string;
    password: string;
    name: string;
    isAuthenticated: boolean;
    userType:string;
    department:string;
    user_class:object;
    firstName: string;
}