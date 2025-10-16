/**
 * Fonction de vérification des mots pour le jeu "2 Lettres 1 Mot"
 * Utilise l'API OpenAI pour vérifier si un mot correspond aux critères
 */

interface WordVerificationParams {
  word: string;
  firstLetter: string;
  secondLetter: string;
  theme: string;
}

interface WordVerificationResult {
  isValid: boolean;
  example?: string;
}

/**
 * Vérifie localement que le mot contient les deux lettres (insensible à la casse)
 */
function containsBothLetters(
  word: string,
  firstLetter: string,
  secondLetter: string,
): boolean {
  const w = word.toLowerCase();
  return (
    w.includes(firstLetter.toLowerCase()) &&
    w.includes(secondLetter.toLowerCase())
  );
}

/**
 * Vérifie si un mot correspond aux critères du jeu
 * @param params Les paramètres de vérification
 * @returns Promise<WordVerificationResult> Résultat de la vérification
 */
export async function verifyWord({
  word,
  firstLetter,
  secondLetter,
  theme,
}: WordVerificationParams): Promise<WordVerificationResult> {
  try {
    // Vérification locale avant d'appeler l'API
    if (!containsBothLetters(word, firstLetter, secondLetter)) {
      return { isValid: false, example: undefined };
    }

    // Prompt enrichi avec exemples pour aider l'IA
    const prompt = `
Jeu : 2 lettres, 1 mot.
Règle : Le mot proposé doit contenir les lettres '${firstLetter}' et '${secondLetter}' (dans n'importe quel ordre, insensible à la casse) et correspondre STRICTEMENT au thème '${theme}'.

Exemples :
- Mot : "Bigorneau", Lettres : B, E, Thème : animal → oui
- Mot : "Interview", Lettres : I, W, Thème : marque → non|Ibis
- Mot : "Paris", Lettres : P, S, Thème : ville → oui
- Mot : "Banane", Lettres : B, E, Thème : animal → non|Baleine

Mot à vérifier : '${word}', Lettres : '${firstLetter}', '${secondLetter}', Thème : '${theme}'.

Réponds UNIQUEMENT par 'oui' si le mot est valide.
Si le mot n'est PAS valide, réponds UNIQUEMENT par 'non|exemple', où 'exemple' est UN SEUL mot valide qui respecte toutes les règles.
Ne donne AUCUNE autre information, explication ou ponctuation supplémentaire.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              'Tu es un assistant qui répond uniquement par "oui" ou "non" à la question posée. Si la réponse est non, donne un exemple sous la forme non|exemple.',
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 30,
      }),
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout de la requête API")), 5000);
    });

    const result = await Promise.race([response.json(), timeoutPromise]);

    if (!response.ok) {
      throw new Error(
        `Erreur API: ${result.error?.message || "Erreur inconnue"}`,
      );
    }

    const answer = result.choices[0]?.message?.content?.toLowerCase().trim();

    console.log("API Answer:", answer);

    if (!answer) {
      throw new Error("Réponse invalide de l'API");
    }

    if (answer.startsWith("oui")) {
      return { isValid: true };
    }
    if (answer.startsWith("non")) {
      const example = answer.includes("|")
        ? answer.split("|")[1]?.trim()
        : undefined;
      return { isValid: false, example };
    }
    // fallback for any other unexpected response
    return { isValid: false };
  } catch (error) {
    console.error("Erreur lors de la vérification du mot:", error);
    throw error;
  }
}
