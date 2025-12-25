import { text } from "stream/consumers";
import { inngest } from "./client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";
import { send } from "process";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { getAllUsersForNewsEmail } from "../actions/user.action";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.action";
import { getNews } from "../actions/finnhub.actions";
import { User } from "lucide-react";
import { json } from "better-auth";
import {  getFormattedTodayDate } from "../utils";


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


export const sendDailyNewsSummary = inngest.createFunction(
    {id: 'daily-news-summary'},
    [ {event: 'app/send.daily.news'}, {cron: '0 12 * * *'}],

    async ({ step})=>{
        //get all users
        const users = await step.run("get-all-users", getAllUsersForNewsEmail);

        if(!users || users.length === 0){
            return {
                success: false,
                message: 'No users found for daily news email'
            }
        }
        //for each user, get their preferences

        const results = await step.run('fetch-user-news', async () => {
            const perUser: Array<{ user: UserForNewsEmail ; articles: MarketNewsArticle[] }> = [];
            for (const user of users as UserForNewsEmail[]) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    let articles = await getNews(symbols);
                    // Enforce max 6 articles per user
                    articles = (articles || []).slice(0, 6);
                    // If still empty, fallback to general
                    if (!articles || articles.length === 0) {
                        articles = await getNews();
                        articles = (articles || []).slice(0, 6);
                    }
                    perUser.push({ user, articles });
                } catch (e) {
                    console.error('daily-news: error preparing user news', user.email, e);
                    perUser.push({ user, articles: [] });
                }
            }
            return perUser;
        });

        //generate a news summary based on their preferences

        const userNewsSummeries: {user: UserForNewsEmail , newsContent: string | null}[] = [];
        for(const {user, articles} of results){
            try {
                const prompts = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles , null,2));

                const response = await step.ai.infer(`Summarize-news-${user.email}`, {
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

                const part = response.candidates?.[0]?.content?.parts?.[0];
                const newsContent = (part && 'text' in part ? part.text : null) || 'No market news available today.';

                userNewsSummeries.push({user, newsContent}); 

            } catch (error) {
                console.error('Error generating news summary for', user.email, error); 
                userNewsSummeries.push({user, newsContent:null});
            }
        }
        //send the email

        await step.run("send-news-email", async ()=>{
            await Promise.all(userNewsSummeries.map(async ({user, newsContent})=>{
                if(!newsContent){
                    return false;
                }  

                return await sendNewsSummaryEmail({
                    email: user.email,
                    date: getFormattedTodayDate(),
                    newsContent
                })
            }))
        }
        )

        return {
            success: true, 
            message: 'News email sent successfully'
        }   
    }
)