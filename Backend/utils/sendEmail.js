import { Resend } from "resend";

let resend;

/**
 * Sends a transactional email via Resend API.
 *
 * @param {string} to      - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} text    - Plain-text email body
 * @returns {Promise<object>} - Resend API response
 */
const sendEmail = async (to, subject, text) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set in environment variables.");
    throw new Error("Email service not configured. Please set RESEND_API_KEY.");
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  const fromAddress = process.env.FROM_EMAIL || "onboarding@resend.dev";

  const attemptSend = async () => {
    // Race between actual send and a 10-second timeout guard
    const sendPromise = resend.emails.send({
      from: `HIVORA HRMS <${fromAddress}>`,
      to,
      subject,
      text,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email send timed out after 10 seconds")), 10_000)
    );

    return Promise.race([sendPromise, timeoutPromise]);
  };

  // 1 retry on failure
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await attemptSend();

      if (response.error) {
        throw new Error(`Resend API error: ${response.error.message}`);
      }

      console.log(
        `✅ Email sent to: ${to} | Subject: "${subject}" | ID: ${response.data?.id} | Attempt: ${attempt}`
      );
      return response;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Email attempt ${attempt} failed for ${to}: ${err.message}`);
      if (attempt < 2) {
        // Wait 1s before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  console.error(`❌ All email attempts failed for ${to}:`, lastError.message);
  throw lastError;
};

export default sendEmail;