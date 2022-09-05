/* Defines the customer entity */
export interface IUser {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: number;
    altNumber: number;
    user_type_id: string;
    assigned_to: number;
    status: string;
    user_class: [];
    user_countries: [];
  }
