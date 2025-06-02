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
 * Vérifie si un mot correspond aux critères du jeu
 * @param params Les paramètres de vérification
 * @returns Promise<WordVerificationResult> Résultat de la vérification
 */
export async function verifyWord({
  word,
  firstLetter,
  secondLetter,
  theme
}: WordVerificationParams): Promise<WordVerificationResult> {
  try {
    // Nouveau prompt pour demander un exemple si la réponse est non
    const prompt = `Le mot '${word}' commence-t-il par les lettres ${firstLetter} et ${secondLetter} et est-ce ${theme} ? Réponds uniquement par 'oui' ou 'non'. Si la réponse est 'non', donne un exemple de mot valide sous la forme : non|exemple.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant qui répond uniquement par "oui" ou "non" à la question posée. Si la réponse est non, donne un exemple sous la forme non|exemple.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 15
      })
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout de la requête API')), 5000);
    });

    const result = await Promise.race([
      response.json(),
      timeoutPromise
    ]);

    if (!response.ok) {
      throw new Error(`Erreur API: ${result.error?.message || 'Erreur inconnue'}`);
    }

    const answer = result.choices[0]?.message?.content?.toLowerCase().trim();

    if (!answer) {
      throw new Error('Réponse invalide de l\'API');
    }

    if (answer.startsWith('oui')) {
      return { isValid: true };
    }
    if (answer.startsWith('non|')) {
      const example = answer.split('|')[1]?.trim();
      return { isValid: false, example };
    }
    if (answer === 'non') {
      return { isValid: false };
    }
    // fallback
    return { isValid: false };
  } catch (error) {
    console.error('Erreur lors de la vérification du mot:', error);
    throw error;
  }
} 