import cron from "node-cron";

export const startCronJob = () => {
  // Runs every 14 minutes
  cron.schedule("*/14 * * * *", async () => {
    try {
      console.log("Sending self-ping to keep server awake...");
      
      // Use BACKEND_URL from env or default to localhost
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;

      const response = await fetch(`${backendUrl}/health`);
      const data = await response.json();

      console.log("Self-ping response:", data);
    } catch (error) {
      console.error("Error running cron job self-ping:", error);
    }
  });
};
