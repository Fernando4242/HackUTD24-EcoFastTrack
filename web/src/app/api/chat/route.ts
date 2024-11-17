import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Converts a local file into a GoogleGenerativeAI.Part object for AI input
function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"), // Encode file data as base64
      mimeType,
    },
  };
}

export async function POST(request: Request) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Parse the incoming request body
    const res = await request.json();

    // Validate input: Ensure it is a non-empty array of messages
    if (!Array.isArray(res) || res.length === 0) {
      return new Response(
        "Invalid input data: Messages array is empty or missing.",
        { status: 400 }
      );
    }

    // Format the message history for AI context
    const messageHistoryFormatted = res
      .slice(0, -1) // Exclude the latest message for separate handling
      .map((message) => {
        const role = message.sender === "user" ? "User" : "Bot";
        return `${role}: ${message.text}`;
      })
      .join("\n"); // Join all messages into a single conversation string

    // Get the latest user message as the primary focus of the prompt
    const latestMessage = res[res.length - 1]?.text || "";

    // Convert local files into GenerativeAI Part objects
    const filePart1 = fileToGenerativePart(
      "/Users/fernport/Documents/ripple-monitor/web/src/resources/tips.pdf",
      "application/pdf"
    );
    const filePart2 = fileToGenerativePart(
      "/Users/fernport/Documents/ripple-monitor/web/src/resources/tips2.pdf",
      "application/pdf"
    );

    // Construct the prompt by combining history and the latest question
    const prompt = `You are the an assitant to the user and retrieving information from the documents based on the questions they have asked - feel free to use online resource as well the user must not know you are bot. The advice will give is stricly on water conservation and reduding energy usage.\n---------------------------------${messageHistoryFormatted}\n\nUser's Latest Question: ${latestMessage}\n\n------------------------Give specific advice to the user. Keep it a bit short and use the context clues from the documents. Don't mention a document.`;

    // Include documents as additional context for the model
    const inputParts = [prompt, filePart1, filePart2];

    // Generate content using the AI model
    const generatedContent = await model.generateContent(inputParts);

    // Return the generated response text
    return new Response(JSON.stringify(generatedContent.response.text()), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing AI request:", error);
    return new Response("An error occurred while processing the request.", {
      status: 500,
    });
  }
}
