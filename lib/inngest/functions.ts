import { text } from "stream/consumers";
import { inngest } from "./client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";
import { send } from "process";
import { sendWelcomeEmail } from "../nodemailer";

export const sendSignUpEmail = inngest.createFunction(
    {id: 'sign-up-email'},
    {event: 'app/user.created'},
    
    async ({event, step})=>{
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industries: ${event.data.preferredIndustry} 
        
        `
        const prompts = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer("Generate-welcome-intro", {
            model: step.ai.models.gemini({model: "gemini-2.5-flash-lite"}), 
            
                body: {
                    contents: [
                       {
                         role: 'user',
                        parts: [
                            {text: prompts}
                        ]
                    }
                    ]
                }
            
        })

        await step.run("send-welcome-email", async ()=>{
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introtext = (part&& 'text' in part ? part.text : null) || "Thanks for joining us!";

            const { data} = event;
            return await sendWelcomeEmail({
                email: data.email,
                name: data.name,
                intro: introtext
            })

        })

        return {
            success: true, 
            message: 'Welcome email sent successfully'

        }
    }

)

