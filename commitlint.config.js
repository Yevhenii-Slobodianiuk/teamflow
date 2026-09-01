module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Нова функціональність
        "fix", // Виправлення бага
        "docs", // Зміни в документації/README
        "style", // Форматування коду, відступи (без зміни логіки)
        "refactor", // Рефакторинг коду
        "perf", // Оптимізація швидкодії
        "test", // Тести
        "chore", // Конфіги, залежності, білд
        "ci", // Налаштування CI/CD
      ],
    ],
    "subject-case": [0], // Дозволяє будь-який регістр для опису
  },
};
