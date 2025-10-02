// Revision Algorithm with Confidence Decay

export interface Problem {
  _id: string;
  title: string;
  category: string;
  Confidence: number;
  lastRevised: Date | string;
  revisionCount?: number;
  createdAt?: Date | string;
}

export interface ProblemWithScore extends Problem {
  adjustedConfidence: number;
  priorityScore: number;
  daysSinceRevision: number;
  confidenceDecay: number;
}

/**
 * Calculate confidence decay based on time since last revision
 * Reduces confidence by 10% every 2 weeks (14 days)
 */
export function calculateConfidenceDecay(lastRevisedDate: Date | string): number {
  const now = new Date();
  const lastRevised = new Date(lastRevisedDate);
  const daysSinceRevision = Math.floor((now.getTime() - lastRevised.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate number of 2-week periods that have passed
  const twoWeekPeriods = Math.floor(daysSinceRevision / 14);
  
  // 10% decay per 2-week period, capped at 50% decay
  const decayPercentage = Math.min(twoWeekPeriods * 0.10, 0.50);
  
  return decayPercentage;
}

/**
 * Calculate adjusted confidence after applying time decay
 */
export function calculateAdjustedConfidence(
  originalConfidence: number,
  lastRevisedDate: Date | string
): number {
  const decay = calculateConfidenceDecay(lastRevisedDate);
  const adjustedConfidence = originalConfidence * (1 - decay);
  
  // Ensure confidence doesn't go below 1
  return Math.max(1, adjustedConfidence);
}

/**
 * Calculate priority score for a problem
 * Lower score = Higher priority for revision
 * Score considers: adjusted confidence and days since revision
 */
export function calculatePriorityScore(problem: Problem): number {
  const now = new Date();
  const lastRevised = new Date(problem.lastRevised);
  const daysSinceRevision = Math.floor((now.getTime() - lastRevised.getTime()) / (1000 * 60 * 60 * 24));
  
  const adjustedConfidence = calculateAdjustedConfidence(problem.Confidence, problem.lastRevised);
  
  // Priority formula:
  // - Lower confidence = Higher priority (inverse)
  // - More days since revision = Higher priority
  const confidenceWeight = 0.7;
  const timeWeight = 0.3;
  
  const confidenceComponent = adjustedConfidence * confidenceWeight;
  const timeComponent = Math.min(daysSinceRevision / 30, 1) * 10 * timeWeight; // Normalize to 0-10 scale
  
  // Lower score = needs more revision
  const priorityScore = confidenceComponent - timeComponent;
  
  return priorityScore;
}

/**
 * Process problems and add revision metadata
 */
export function processProblemsForRevision(problems: Problem[]): ProblemWithScore[] {
  return problems.map(problem => {
    const now = new Date();
    const lastRevised = new Date(problem.lastRevised);
    const daysSinceRevision = Math.floor((now.getTime() - lastRevised.getTime()) / (1000 * 60 * 60 * 24));
    const confidenceDecay = calculateConfidenceDecay(problem.lastRevised);
    const adjustedConfidence = calculateAdjustedConfidence(problem.Confidence, problem.lastRevised);
    const priorityScore = calculatePriorityScore(problem);
    
    return {
      ...problem,
      adjustedConfidence,
      priorityScore,
      daysSinceRevision,
      confidenceDecay
    };
  });
}

/**
 * Sort problems by priority (lowest score first = highest priority)
 */
export function sortByPriority(problems: ProblemWithScore[]): ProblemWithScore[] {
  return [...problems].sort((a, b) => a.priorityScore - b.priorityScore);
}

/**
 * Filter problems that need revision based on criteria
 */
export function getProblemsNeedingRevision(
  problems: ProblemWithScore[],
  options: {
    minConfidence?: number;
    minDaysSinceRevision?: number;
    maxProblems?: number;
  } = {}
): ProblemWithScore[] {
  const {
    minConfidence = 7, // Problems with confidence < 7 need revision
    minDaysSinceRevision = 7, // Or haven't been revised in 7 days
    maxProblems = 50
  } = options;
  
  const needsRevision = problems.filter(problem => 
    problem.adjustedConfidence < minConfidence || 
    problem.daysSinceRevision >= minDaysSinceRevision
  );
  
  return sortByPriority(needsRevision).slice(0, maxProblems);
}

/**
 * Group problems by confidence level
 */
export function groupByConfidenceLevel(problems: ProblemWithScore[]) {
  return {
    urgent: problems.filter(p => p.adjustedConfidence < 4), // Very low confidence
    high: problems.filter(p => p.adjustedConfidence >= 4 && p.adjustedConfidence < 6),
    medium: problems.filter(p => p.adjustedConfidence >= 6 && p.adjustedConfidence < 8),
    low: problems.filter(p => p.adjustedConfidence >= 8) // Doesn't need much revision
  };
}

/**
 * Get revision statistics
 */
export function getRevisionStats(problems: ProblemWithScore[]) {
  const total = problems.length;
  const groups = groupByConfidenceLevel(problems);
  
  const avgConfidence = problems.reduce((sum, p) => sum + p.adjustedConfidence, 0) / total || 0;
  const avgDaysSinceRevision = problems.reduce((sum, p) => sum + p.daysSinceRevision, 0) / total || 0;
  
  return {
    total,
    urgent: groups.urgent.length,
    high: groups.high.length,
    medium: groups.medium.length,
    low: groups.low.length,
    avgConfidence: Math.round(avgConfidence * 10) / 10,
    avgDaysSinceRevision: Math.round(avgDaysSinceRevision),
    needsImmediateRevision: groups.urgent.length + groups.high.length
  };
}
