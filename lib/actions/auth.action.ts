'use server';

import { headers } from "next/headers";
import { auth } from "../better-auth/auth";
import { inngest } from "../inngest/client";


export const SignUpWithEmail = async ({email, password,fullName, country, investmentGoals, riskTolerance, preferredIndustry}: SignUpFormData)=>{
    try{
        const response = await auth.api.signUpEmail({
            body: {
                email:email,
                password:password,
                name: fullName,
            }
        })

        if(response){
            await inngest.send({
                name: 'app/user.created',
                data: {
                    email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry
                }
            })
        }

        return {
            success: true,
            data: response,
            message: 'User signed up successfully'
        }
    }catch(err){
        console.log("Error during sign up:", err);
        return {success: false, error: err};
    }
}
export const SignInWithEmail = async ({email, password}: SignInFormData)=>{
    try{
        const response = await auth.api.signInEmail({
            body: {
                email:email,
                password:password,
            }

        })
       

        return {
            success: true,
            data: response,
            message: 'User signed in successfully'
        }
    }catch(err){
        console.log("Error during sign in:", err);
        return {success: false, error: err};
    }
}

export const signOut = async ()=>{
    try{
        await auth.api.signOut({
            headers: await headers()
        });

    }catch(err){
        console.log("Error during sign out:", err);
        return {success: false, error: 'Sign out failed. Please try again.'};
    }
}