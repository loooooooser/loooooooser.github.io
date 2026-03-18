// ── Conversation Script ──────────────────────────────────────────────────
// Each turn:
//   bot      → what the "friend" says in Ukrainian
//   correct  → the right English meaning (one of 3 options)
//   decoys   → two wrongbutplausible English options
//   reply    → what the USER types back in Ukrainian
//   replyEn  → English meaning of the reply (shown as hint)

const SCRIPT = [
  {
    bot: "Привіт! Як ти?",
    correct: "Hey! How are you?",
    decoys: ["Goodbye! See you later!", "What's your name?"],
    reply: "Привіт! Все добре, дякую!",
    replyEn: "Hey! All good, thanks!",
  },
  {
    bot: "Де ти зараз?",
    correct: "Where are you right now?",
    decoys: ["What time is it?", "What are you doing?"],
    reply: "Я вдома, чіллю.",
    replyEn: "I'm home, chilling.",
  },
  {
    bot: "Норм. Що плануєш сьогодні?",
    correct: "Cool. What are you planning today?",
    decoys: ["Cool. What did you do yesterday?", "Nice. Where did you go?"],
    reply: "Нічого особливого, може вийду погуляти.",
    replyEn: "Nothing special, maybe go for a walk.",
  },
  {
    bot: "О, топ ідея! Погода сьогодні гарна.",
    correct: "Oh, great idea! The weather is nice today.",
    decoys: ["Oh no! The weather is bad today.", "Hmm, sounds boring honestly."],
    reply: "Точно! Може зустрінемось?",
    replyEn: "True! Maybe we meet up?",
  },
  {
    bot: "Давай! О котрій тобі зручно?",
    correct: "Let's go! What time works for you?",
    decoys: ["No way! I'm busy all day.", "Sure! Where should we eat?"],
    reply: "О четвертій підійде?",
    replyEn: "Would four o'clock work?",
  },
  {
    bot: "Чотири ідеально. Де зустрінемось?",
    correct: "Four is perfect. Where should we meet?",
    decoys: ["Four is too late. Can we do earlier?", "Perfect. See you tomorrow then!"],
    reply: "Біля кав'ярні на розі.",
    replyEn: "By the coffee shop on the corner.",
  },
  {
    bot: "Збочик, ти знову про ту кав'ярню 😂",
    correct: "You're obsessed, on about that café again 😂",
    decoys: ["Great, I love that place too!", "Which corner? I don't know it."],
    reply: "Хайп не без причини там кава топ!",
    replyEn: "The hype is for a reason the coffee is the best!",
  },
  {
    bot: "Окей окей, переконав. До зустрічі!",
    correct: "Okay okay, you convinced me. See you there!",
    decoys: ["Fine, but I'm paying. See you!", "Whatever, I'll be late anyway."],
    reply: "До зустрічі! Не запізнюйся 😄",
    replyEn: "See you! Don't be late 😄",
  },
];
