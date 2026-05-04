#!/usr/bin/env node

const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const conversationHistory = [];

async function chat(userMessage) {
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8096,
    system: `You are a Caesar cipher expert assistant. You can help users:
1. Encrypt text using Caesar cipher with a specific shift
2. Decrypt text using Caesar cipher by trying all possible shifts
3. Analyze and explain Caesar cipher concepts
4. Demonstrate examples

Always provide clear explanations and actual working results. When asked to encrypt/decrypt, provide both the process and the result.
Format cipher operations clearly with the shift value used.`,
    messages: conversationHistory,
  });

  const assistantMessage = response.content[0].text;
  conversationHistory.push({
    role: "assistant",
    content: assistantMessage,
  });

  return assistantMessage;
}

function caesarEncrypt(text, shift) {
  const normalizedShift = ((shift % 26) + 26) % 26;
  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) {
        return String.fromCharCode(
          ((char.charCodeAt(0) - 97 + normalizedShift) % 26) + 97
        );
      }
      if (/[A-Z]/.test(char)) {
        return String.fromCharCode(
          ((char.charCodeAt(0) - 65 + normalizedShift) % 26) + 65
        );
      }
      return char;
    })
    .join("");
}

function caesarDecryptAllShifts(text) {
  const results = [];
  for (let shift = 0; shift < 26; shift++) {
    const decrypted = caesarEncrypt(text, -shift);
    results.push({ shift, decrypted });
  }
  return results;
}

function displayCipherDemo() {
  console.log("\n=== Caesar Cipher Demo ===\n");

  const originalText = "Hello World";
  const shift = 3;

  console.log(`Original text: "${originalText}"`);
  console.log(`Shift value: ${shift}\n`);

  const encrypted = caesarEncrypt(originalText, shift);
  console.log(`Encrypted: "${encrypted}"\n`);

  console.log("All possible decryptions (shift 0-25):");
  const allDecryptions = caesarDecryptAllShifts(encrypted);
  allDecryptions.forEach(({ shift: s, decrypted }) => {
    const marker = s === 3 ? " ← Original" : "";
    console.log(`  Shift ${s.toString().padStart(2)}: "${decrypted}"${marker}`);
  });

  console.log("\n");
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  displayCipherDemo();

  console.log("Caesar Cipher Chat Assistant");
  console.log("=============================");
  console.log(
    "Ask me about Caesar cipher encryption, decryption, or cryptography!"
  );
  console.log("Type 'exit' to quit.\n");

  const askQuestion = () => {
    rl.question("You: ", async (userInput) => {
      if (userInput.toLowerCase() === "exit") {
        console.log(
          "Goodbye! Thanks for exploring Caesar cipher with me.",
          "assistant_acknowledgement"
        );
        rl.close();
        return;
      }

      if (!userInput.trim()) {
        askQuestion();
        return;
      }

      try {
        const response = await chat(userInput);
        console.log(`\nAssistant: ${response}\n`);
      } catch (error) {
        console.error("Error:", error.message);
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);