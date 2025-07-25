
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// This is a placeholder for a scheduled function that would run daily.
// It would query for overdue evaluations and send email reminders.
// To deploy this, you would need to set up a billing account for your Firebase project
// and configure an external email service like SendGrid or Mailgun.

export const dailyEPAReminderCheck = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
    console.log("Running daily EPA reminder check...");

    const evaluationsRef = db.collection("appState/singleton_app_state/evaluations");
    const snapshot = await evaluationsRef.where("status", "==", "pending").get();

    if (snapshot.empty) {
        console.log("No pending evaluations found.");
        return null;
    }

    const today = new Date();
    const reminderPromises: Promise<any>[] = [];

    snapshot.forEach(doc => {
        const evaluation = doc.data();
        const activityDate = new Date(evaluation.activityDate);
        const daysSinceActivity = Math.round((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Example reminder logic, using a hardcoded frequency of 3 days.
        // In a real app, this frequency would be read from the appState document.
        const REMINDER_FREQUENCY = 3; 

        if (daysSinceActivity > 0 && daysSinceActivity % REMINDER_FREQUENCY === 0) {
            console.log(`Evaluation ${doc.id} is overdue. Preparing reminder.`);
            
            // In a real implementation, you would get the evaluator's email
            // and use an email service to send a reminder.
            // For example:
            // const evaluatorProfile = await admin.auth().getUser(evaluation.evaluatorId);
            // const email = evaluatorProfile.email;
            // sendReminderEmail(email, evaluation);
            
            const promise = Promise.resolve(`Reminder for eval ${doc.id} would be sent.`);
            reminderPromises.push(promise);
        }
    });

    await Promise.all(reminderPromises);
    console.log("Finished daily EPA reminder check.");
    return null;
});

// Helper function placeholder for sending emails
// async function sendReminderEmail(email: string, evaluation: any) {
//   // Logic to call SendGrid/Mailgun API would go here.
// }
