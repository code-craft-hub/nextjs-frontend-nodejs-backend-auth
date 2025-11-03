/**
 * Advanced Job Matching Algorithm
 * Calculates match percentage between search keywords and job description
 * Returns a score between 0-100%
 */

class JobMatcher {
  private stopWords;
  constructor() {
    // Common words to filter out (stop words)
    this.stopWords = new Set([
      "a",
      "an",
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "as",
      "is",
      "was",
      "are",
      "be",
      "been",
      "has",
      "have",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "should",
      "could",
      "may",
      "might",
      "can",
      "this",
      "that",
      "these",
      "those",
    ]);
  }

  /**
   * Normalize text: lowercase, remove special chars, collapse spaces
   */
  normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/([^\w\s]|_)/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Extract meaningful keywords (filter stop words, sort by length)
   */
  extractKeywords(text: string): string[] {
    const normalized = this.normalize(text);
    const words = normalized
      .split(" ")
      .filter((word) => word.length > 0 && !this.stopWords.has(word));

    // Remove duplicates and sort by length (longer = more specific)
    return [...new Set(words)].sort((a, b) => b.length - a.length);
  }

  /**
   * Calculate Term Frequency score for a word in text
   */
  calculateTF(word: string, text: string) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;

    // Logarithmic scaling to prevent over-weighting repeated terms
    return count > 0 ? 1 + Math.log10(count) : 0;
  }

  /**
   * Calculate position-based score (earlier appearances = more relevant)
   */
  calculatePositionScore(word: string, text: string) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    const match = regex.exec(text);

    if (!match) return 0;

    const position = match.index / text.length;
    // Earlier positions get higher scores (1.0 at start, 0.5 at end)
    return 1 - position * 0.5;
  }

  /**
   * Calculate word importance based on length and uniqueness
   */
  calculateWordWeight(word: string, allWords: string[]) {
    // Longer words are typically more specific and important
    const lengthWeight = Math.min(word.length / 10, 1);

    // Less common words in the keyword set are more distinctive
    const frequency = allWords.filter((w) => w === word).length;
    const uniquenessWeight = 1 / frequency;

    return lengthWeight * uniquenessWeight;
  }

  /**
   * Check for phrase/bigram matches (consecutive word pairs)
   */
  findPhraseMatches(keywords: string[], description: string) {
    // const descWords = this.normalize(description).split(' ');
    let phraseScore = 0;

    for (let i = 0; i < keywords.length - 1; i++) {
      const phrase = `${keywords[i]} ${keywords[i + 1]}`;
      const phraseRegex = new RegExp(`\\b${phrase}\\b`, "i");

      if (phraseRegex.test(description)) {
        // Bonus for finding consecutive words together
        phraseScore += 15;
      }
    }

    return Math.min(phraseScore, 30); // Cap at 30 points
  }

  /**
   * Main matching function
   */
  calculateMatch(searchQuery: string, jobDescription: string) {
    const keywords = this.extractKeywords(searchQuery);
    const descNormalized = this.normalize(jobDescription);

    if (keywords.length === 0) {
      return {
        score: 0,
        details: "No valid keywords found in search query",
        breakdown: {},
      };
    }

    let totalScore = 0;
    let maxPossibleScore = 0;
    const wordScores: {
      word: string;
      found: boolean;
      occurrences: number;
      score: number;
      weight: number;
    }[] = [];

    // Score each keyword
    keywords.forEach((word) => {
      const weight = this.calculateWordWeight(word, keywords);
      const tfScore = this.calculateTF(word, descNormalized);
      const positionScore = this.calculatePositionScore(word, descNormalized);

      const wordScore =
        tfScore > 0 ? (tfScore * 4 + positionScore * 3) * weight : 0;
      const maxWordScore = 10 * weight;

      totalScore += Math.min(wordScore, maxWordScore);
      maxPossibleScore += maxWordScore;

      wordScores.push({
        word,
        found: tfScore > 0,
        occurrences:
          descNormalized.match(new RegExp(`\\b${word}\\b`, "gi"))?.length || 0,
        score: Math.round(Math.min(wordScore, maxWordScore) * 10) / 10,
        weight: Math.round(weight * 100) / 100,
      });
    });

    const phraseBonus = this.findPhraseMatches(keywords, descNormalized);
    totalScore += phraseBonus;
    maxPossibleScore += 30;

    // Calculate match percentage
    const matchedCount = wordScores.filter((w) => w.found).length;
    const matchRatio = matchedCount / keywords.length;

    // Base score
    let finalScore = Math.min(
      Math.round((totalScore / maxPossibleScore) * 100),
      100
    );

    // Boost for sparse keywords (1-3 keywords) when ALL match
    if (keywords.length <= 3 && matchRatio === 1.0) {
      const sparseBoost = Math.min(40, (4 - keywords.length) * 20);
      finalScore = Math.min(finalScore + sparseBoost, 100);
    }

    // Penalty if not all keywords match
    if (matchRatio < 1.0) {
      finalScore = Math.round(finalScore * (0.5 + matchRatio * 0.5));
    }

    return {
      score: finalScore,
      matchedKeywords: matchedCount,
      totalKeywords: keywords.length,
      wordBreakdown: wordScores,
      phraseBonus: Math.round(phraseBonus),
      details: `Matched ${matchedCount}/${keywords.length} keywords`,
    };
  }
}

export const jobMatcher = new JobMatcher();
