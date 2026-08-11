import type { Conversation } from "../types";


export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "Taylor Swift",
    avatarColor: "#ff2d55",
    status: "Online",
    unread: true,
    messages: [
      { id: 1, text: "Hey! Are we still on for the studio recording session tomorrow?", sender: "them", timestamp: "5:23 PM" },
      { id: 2, text: "Yeah absolutely! I've been refining the lyrics for the chorus.", sender: "me", timestamp: "5:25 PM" },
      { id: 3, text: "Amazing, can't wait to hear it! Bring the acoustic guitar too.", sender: "them", timestamp: "5:26 PM" }
    ],
    replies: [
      "That sounds perfect! Let's aim for 2 PM.",
      "Awesome. I'll ask the team to pre-configure the mics.",
      "Let's write another hit! 🎶"
    ]
  },
  {
    id: 2,
    name: "Elon Musk",
    avatarColor: "#5856d6",
    status: "Active 1h ago",
    unread: false,
    messages: [
      { id: 1, text: "The Starship flight test telemetry looks incredibly clean.", sender: "them", timestamp: "Yesterday" },
      { id: 2, text: "That is huge! When is the next orbital launch attempt?", sender: "me", timestamp: "Yesterday" },
      { id: 3, text: "Aiming for late next month. Multi-planetary species is the goal.", sender: "them", timestamp: "Yesterday" }
    ],
    replies: [
      "Exactly. Raptor engine thrust profile is optimized now.",
      "Mars is the target. Let's make life multiplanetary!",
      "Also, Tesla FSD v13 release is going to blow minds."
    ]
  },
  {
    id: 3,
    name: "Steve Jobs (Legacy AI)",
    avatarColor: "#34c759",
    status: "Active 5m ago",
    unread: false,
    messages: [
      { id: 1, text: "Details matter, it's worth waiting to get it right.", sender: "them", timestamp: "Wednesday" },
      { id: 2, text: "We are polishing the UI animations right now.", sender: "me", timestamp: "Wednesday" },
      { id: 3, text: "Design is not just what it looks like and feels like. Design is how it works.", sender: "them", timestamp: "Wednesday" }
    ],
    replies: [
      "Stay hungry, stay foolish.",
      "Simplify, simplify, simplify. That's the secret.",
      "Make it so beautiful that people want to lick it."
    ]
  },
  {
    id: 4,
    name: "Clever Assistant",
    avatarColor: "#007aff",
    status: "Online",
    unread: false,
    messages: [
      { id: 1, text: "Hi there! I am your assistant. How can I help you today?", sender: "them", timestamp: "Monday" }
    ],
    replies: [
      "I can help you design layouts, write clean code, or solve issues!",
      "Tell me more about your project goals.",
      "I am always ready to help you pair program."
    ]
  },
  {
    id: 5,
    name: "Sam Altman",
    avatarColor: "#af52de",
    status: "Active 12m ago",
    unread: false,
    messages: [
      { id: 1, text: "We just deployed the new reasoning reasoning model.", sender: "them", timestamp: "Aug 8" },
      { id: 2, text: "Oh nice, how is the latency profile?", sender: "me", timestamp: "Aug 8" },
      { id: 3, text: "A bit higher but the planning depth is outstanding.", sender: "them", timestamp: "Aug 8" }
    ],
    replies: [
      "AGI is coming faster than people think.",
      "The next cluster is going to be insane.",
      "Thanks for building with our API!"
    ]
  }
];
