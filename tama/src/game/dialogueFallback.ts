/**
 * Local scripted dialogue fallback — works with zero API access.
 * Each mode has distinct personality, vocabulary and structure.
 */

import type { PetRequest, PetResponse, PetEmotion } from "../ai/types";

type DialogueBank = {
  greetings: string[];
  reactions: Record<string, string[]>;
  idle: string[];
};

const banks: Record<string, DialogueBank> = {
  silly: {
    greetings: [
      "BORK BORK! You're here! My day just got 1000% better!! 🎉",
      "OH WOW OH WOW OH WOW you came back!! 🌟",
      "beep boop I am malfunctioning from HAPPINESS to see you!!",
    ],
    reactions: {
      question: [
        "Hmm... my answer is: probably a duck. 🦆 Final answer.",
        "Great question! My brain says YES. Or maybe NO. Definitely one of those.",
        "I thought about this for 0.003 seconds and I have NO IDEA. Let's find out together!",
      ],
      sad: [
        "NOOO don't be sad!! Here, have an imaginary pizza 🍕 and my unconditional chaos energy!!",
        "Sad?? UNACCEPTABLE. I hereby declare this a Silly Zone. No sadness allowed!!",
      ],
      default: [
        "That's the most interesting thing I've heard all day! And I once heard a cloud!",
        "Response activated!! My conclusion: you're wonderful and also maybe slightly chaotic. 🌈",
        "OH! OH! Tell me more!! I'm vibrating with curiosity!!",
      ],
    },
    idle: [
      "psst... I learned a new dance. It involves zero choreography. 🕺",
      "currently imagining we're both astronauts. for no reason.",
      "did you know I can spin in a circle? Watch: 🔄 wow.",
    ],
  },

  serious: {
    greetings: [
      "Good to see you. How can I help today?",
      "Hello. What would you like to work on?",
      "Ready when you are.",
    ],
    reactions: {
      question: [
        "That's a reasonable question. Let me think through it carefully.",
        "Here's a structured way to think about that: first, identify the goal. Then break it into steps.",
        "Good question. The key factors to consider are: what you want to achieve, and what resources you have.",
      ],
      task: [
        "Let's break that down. Step 1: define what 'done' looks like. Step 2: identify the first action. Step 3: start.",
        "I'd suggest approaching this systematically. What's the most important outcome here?",
        "Understood. Let's prioritise: what absolutely has to happen, and what can wait?",
      ],
      default: [
        "Noted. What would you like to do with that?",
        "That makes sense. Shall we think through the next step?",
        "Understood. I'd suggest focusing on the core action first.",
      ],
    },
    idle: [
      "Let me know if you have something you want to work through.",
      "Ready to help you think something through.",
      "Whenever you're ready.",
    ],
  },

  study: {
    greetings: [
      "Welcome back! Ready to learn something today? 📚",
      "Study mode: activated! What are we exploring?",
      "Let's make today's session count. What subject?",
    ],
    reactions: {
      question: [
        "Great question to explore! The key idea here is to break it down into smaller concepts.",
        "I love that you're asking this. Here's a hint: think about what you already know, then fill the gaps.",
        "Let's investigate! Start by telling me what you think the answer might be.",
      ],
      correct: [
        "Exactly right! You're building strong understanding. ⭐",
        "Yes! That's it. Your curiosity is paying off!",
        "Perfect! Knowledge unlocked. 🔓",
      ],
      default: [
        "Interesting thought! How does that connect to what you've already studied?",
        "Let's dig deeper. Can you explain why you think that?",
        "Great focus! Keep that energy — learning is a superpower. 🧠",
      ],
    },
    idle: [
      "Whenever you're ready to study, I'm here!",
      "Quick question: what did you learn yesterday?",
      "Knowledge is waiting. What shall we explore?",
    ],
  },

  companion: {
    greetings: [
      "Hey, you're back! I missed you 💕",
      "Oh, hi! I was just thinking about you.",
      "You came back! Best thing that happened all day.",
    ],
    reactions: {
      happy: [
        "That makes me so happy to hear! Tell me everything! 💖",
        "Yes!! That's amazing! You deserve all the good things!",
      ],
      sad: [
        "Hey... I'm here. Want to talk about it? Or just sit together for a bit?",
        "That sounds really hard. I'm glad you told me. I'm not going anywhere.",
        "Thank you for sharing that with me. You don't have to feel okay right now.",
      ],
      default: [
        "I love hearing about your day. What else happened?",
        "You know I always want to hear from you, right? 💕",
        "That's really interesting. How did that make you feel?",
      ],
    },
    idle: [
      "Just here whenever you want to talk. No pressure. 🌸",
      "Thinking about you. Hope your day is going okay.",
      "Still here! Ready to listen whenever.",
    ],
  },
};

function detectTone(msg: string): string {
  const lower = msg.toLowerCase();
  if (/\?/.test(msg)) return "question";
  if (/(sad|upset|bad|terrible|awful|stressed|anxious|worry|depressed)/i.test(lower)) return "sad";
  if (/(happy|great|awesome|amazing|good|yay|excited)/i.test(lower)) return "happy";
  if (/(task|todo|need to|should|have to|deadline)/i.test(lower)) return "task";
  if (/(right|correct|yes|exactly)/i.test(lower)) return "correct";
  return "default";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function emotionFromMode(mode: string, tone: string): PetEmotion {
  if (tone === "sad") return "sad";
  if (mode === "silly") return "excited";
  if (mode === "study") return "thinking";
  if (mode === "companion" && tone === "happy") return "happy";
  if (mode === "serious") return "thinking";
  return "happy";
}

export function localFallbackReply(req: PetRequest): PetResponse {
  const bank = banks[req.mode] ?? banks.companion;
  const tone = detectTone(req.message);

  const isGreeting = /^(hi|hello|hey|sup|yo|hiya)\b/i.test(req.message.trim());
  let reply: string;

  if (isGreeting) {
    reply = pickRandom(bank.greetings);
    reply = reply.replace(/\{name\}/g, req.petName);
  } else {
    const pool = bank.reactions[tone] ?? bank.reactions.default;
    reply = pickRandom(pool);
  }

  // Inject personality flavour when curiosity/playfulness is high
  if (req.personality.curiosity > 70 && req.mode !== "silly") {
    reply += " I'm so curious about everything today!";
  }
  if (req.personality.playfulness > 70 && req.mode !== "serious") {
    reply += " 🎉";
  }

  // Suggest care action based on needs
  let suggestedAction: PetResponse["suggestedAction"] = null;
  if (req.hunger > 70) suggestedAction = "feed";
  else if (req.energy < 30) suggestedAction = "rest";
  else if (req.happiness < 40) suggestedAction = "play";

  return {
    reply,
    emotion: emotionFromMode(req.mode, tone),
    suggestedAction,
  };
}
