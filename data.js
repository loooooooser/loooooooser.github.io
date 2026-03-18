// ── Conversation Script ──────────────────────────────────────────────────
// All replies use only standard Ukrainian letters and spaces.
// No apostrophes, em-dashes, exclamation marks, emoji, or punctuation
// that requires special key combos.

const SCRIPT = [
  {
    bot: "Привіт! Як ти?",
    correct: "Hey! How are you?",
    decoys: ["Goodbye! See you later!", "What is your name?"],
    reply: "Привіт все добре дякую",
    replyEn: "Hey all good thanks",
  },
  {
    bot: "Де ти зараз?",
    correct: "Where are you right now?",
    decoys: ["What time is it?", "What are you doing?"],
    reply: "Я вдома чіллю",
    replyEn: "I am home chilling",
  },
  {
    bot: "Норм. Що плануєш сьогодні?",
    correct: "Cool. What are you planning today?",
    decoys: ["Cool. What did you do yesterday?", "Nice. Where did you go?"],
    reply: "Нічого особливого може вийду погуляти",
    replyEn: "Nothing special maybe go for a walk",
  },
  {
    bot: "Погода сьогодні гарна. Топ день для прогулянки.",
    correct: "The weather is nice today. Perfect day for a walk.",
    decoys: ["The weather is bad today. Stay inside.", "I am busy today. Maybe tomorrow."],
    reply: "Точно може зустрінемось",
    replyEn: "True maybe we meet up",
  },
  {
    bot: "Давай. О котрій тобі зручно?",
    correct: "Let's go. What time works for you?",
    decoys: ["No way. I am busy all day.", "Sure. Where should we eat?"],
    reply: "О четвертій підійде",
    replyEn: "Would four o clock work",
  },
  {
    bot: "Чотири ідеально. Де зустрінемось?",
    correct: "Four is perfect. Where should we meet?",
    decoys: ["Four is too late. Can we do earlier?", "Perfect. See you tomorrow then."],
    reply: "Біля кафе на розі",
    replyEn: "By the cafe on the corner",
  },
  {
    bot: "Ти знову про те кафе.",
    correct: "You are on about that cafe again.",
    decoys: ["I love that place too.", "Which corner? I do not know it."],
    reply: "Там кава топ повірь мені",
    replyEn: "The coffee there is the best trust me",
  },
  {
    bot: "Окей переконав. До зустрічі.",
    correct: "Okay you convinced me. See you there.",
    decoys: ["Fine but I am paying. See you.", "Whatever I will be late anyway."],
    reply: "До зустрічі не запізнюйся",
    replyEn: "See you do not be late",
  },
];
