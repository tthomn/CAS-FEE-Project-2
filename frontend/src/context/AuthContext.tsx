import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,createUserWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,User, Auth} from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";


import {AuthUser} from "../types/authUser";
import { getDocRefsBy1Condition,getDocDataBy1Condition } from "../services/firebase/firestoreService";



//FIXME: i think this is not needed anymore! 
interface AdditionalData {
    title: string;
    name: string;
    surname: string;
    street: string;
    houseNumber: string;
    zip: string;
    city: string;
    country: string;
    dob: string; 
    addedAt: Date;
    authType: string;

}

interface AuthContextType {
    user: User | null; //This is the User from the Firebase Authentification //TODO: Check if i need it
    authUser: AuthUser | null; 
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, additionalData?: AdditionalData) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    isAuthenticated: boolean;    

}

const AuthContext =  createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {



    //[Is Authentiaced Global State]
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    //[USER]
    const [user, setUser] = useState<User | null>(null); 
    const [authUser, setAuthUser] = useState<AuthUser | null>(null); //User which I've created for from type used to save all information about the user in the DB


   //TODO: For what is loading used => can possible be deleted 
    const [loading, setLoading] = useState(true); 

    //TODO: DO i need this? 
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() =>{
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);              

            if (user) {
            
                console.log("User is signed in");  
                const fetchedUser = await fetchAuthUser(user?.email);
                if (fetchedUser) {
                    setAuthUser(fetchedUser);
               } else {
               }
               setIsAuthenticated(true);    
              } 
              else {
                setIsAuthenticated(false);
                console.log("User is signed out");
              }
        });
        return unsubscribe;
    }, [auth]);

    useEffect(() => {
        console.log("AuthUser:", authUser);
    }, [authUser]);
    

        const fetchAuthUser = async (email: any) => {        
            try
            {
               const user1 = await getDocRefsBy1Condition("users", "email", "==", email);
               const user2 = await getDocDataBy1Condition<AuthUser>("users", "email", "==", email);                                       
                const userDoc = user2[0];                 
                const authUser: AuthUser = {
                id: user1[0].id ,  
                userName: email,
                userId: userDoc.id,              
                authType: userDoc?.authType || "user", // Just in Case => Default is User 
                city: userDoc?.city,
                country: userDoc?.country || "",
                dob: userDoc?.dob || "",
                houseNumber: userDoc?.houseNumber,
                name: userDoc?.name,
                surname: userDoc?.surname,
                zip: userDoc?.zip || "",
                street: userDoc?.street,
                gender: userDoc?.gender || "",
                addedAt: userDoc?.addedAt || undefined , // Date of user creation   
            };
             return authUser; // Return the constructed AuthUser object            
            }
            catch (error) {
              console.error("Error fetchAuthUser:", error);
            }           
        }     


    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);     

        } catch (error: any) {
            throw new Error(error.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            setAuthUser(null);
            
        } catch (error: any) {
            setAuthUser(null);
            throw new Error(error.message || "Failed to logout");
        } finally {
            setLoading(false);
        }
    };


    //Adds additionalData to the user in the firebase db 
    const register = async (email: string, password: string, additionalData?: AdditionalData) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            //TODO: Here i need update my DB with the user data inclusive the aditionalData 
            //TODO: Define User Role (Admin?) ==> Default User is the Standard 

            if (additionalData) {
             
                await setDoc(doc(db, "users", user.uid), {
                    email,
                    ...additionalData,
                });
            }

            await sendEmailVerification(user);
        } catch (error: any) {
            throw new Error(error.message || "Failed to register");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            throw new Error(error.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                loading,
                login,
                logout,
                register,
                resetPassword,
                authUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
