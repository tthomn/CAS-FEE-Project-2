
export type AuthType = 'admin' | 'user';

export type AuthUser = {
    id: string;                 // uid of logged-in user
    userName: string;           // email address of logged-in user
    userId: string;             // id of related user in firebase db 'users'
    authType?: AuthType;        // permissions of related user in firebase db 'users': admin | user
    city: string;               // city of related user in firebase db 'users'
    country?: string;           // country of related user in firebase db 'users'
    dob: string;                // date of birth of related user in firebase db 'users'
    houseNumber: string;        // house number of related user in firebase db 'users'
    name: string;               // name of related user in firebase db 'users'
    surname: string;            // surname of related user in firebase db 'users'
    zip: string;                // zip code of related user in firebase db 'users'
    street: string;             // street of related user in firebase db 'users'
    gender: string;             // gender of related user in firebase db 'users'    
    addedAt?: string;          // date/time of user creation in firebase db 'users'             
}
