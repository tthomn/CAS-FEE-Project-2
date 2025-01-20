import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,createUserWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,User,} from "firebase/auth";
import {AuthUser} from "../types/authUser";
import { getDocRefsBy1Condition,getDocDataBy1Condition } from "../services/firebase/firestoreService";
import { getFunctions, httpsCallable } from "firebase/functions";

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
    email: string;

}

interface AuthContextType {
    user: User | null; 
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
    const [authUser, setAuthUser] = useState<AuthUser | null>(null); 
    const [loading, setLoading] = useState(true); 
    const auth = getAuth();
     
    useEffect(() =>{
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            setUser(user);     
            setLoading(false);    

            if (user) {
                                 
                const fetchedUser = await fetchAuthUser(user?.email);
                if (fetchedUser) {
                    setAuthUser(fetchedUser);
               } else {
               }
               setIsAuthenticated(true);    
              } 
              else {
                setIsAuthenticated(false);
              }
        });
        return unsubscribe;
    }, [auth]);

    
    const assignAdminRole = async (authType:string ,uid:string) => {
      const functions = getFunctions();        
      const setAdmin = httpsCallable(functions, "setAdmin");
    
        try {
            const user = auth.currentUser;    
            if (!user) {
                console.error("No user is logged in.");
                return;
            }              
           const response = await setAdmin({uid: uid, authType: authType});
           console.log("Response from the function:", response);
            const idTokenResult = await user.getIdTokenResult();

            // Check if the admin claim is present
           if (idTokenResult.claims.admin) {
                console.log("User is an admin.");
                // Set admin state in your app
            } else {
             console.log("User is not an admin.");
            }
   
        } catch (error) {
            console.error("Error assigning admin role:", error);
        }
    };

        const fetchAuthUser = async (email: any) => {        
            try
            {            
               const user1 = await getDocRefsBy1Condition("users", "email", "==", email);
               const user2 = await getDocDataBy1Condition<AuthUser>("users", "email", "==", email); 

               if (!user1 || user1.length === 0 || !user2 || user2.length === 0) {
                console.warn("User not found in Firestore for email:", email)                
                return null; }
               
                const userDoc = user2[0];                 
                const authUser: AuthUser = {
                id: user1[0].id ,  
                userName: email,
                userId: userDoc.id,              
                authType: userDoc.authType || "user", // Just in Case => Default is User 
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
                assignAdminRole(authUser.authType, user1[0].id); 
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
            localStorage.removeItem("userDetails");
            
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
                const functions = getFunctions();
                const setAdditionalUserData = httpsCallable(functions, "setAdditionalUserData");
                await setAdditionalUserData({
                uid: user.uid,
                ...additionalData,
                });

                const registeredUser = await fetchAuthUser(user.email);
                if (registeredUser) {
                    setAuthUser(registeredUser);
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
