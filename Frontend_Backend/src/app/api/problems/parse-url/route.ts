import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import * as cheerio from 'cheerio';



export interface ParsedProblem {
  title: string;
  problemStatement: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  difficulty: string;
  topics: string[];
  sourceUrl: string;
  platform: 'leetcode' | 'geeksforgeeks' | 'unknown';
  cppCodeTemplate?: string;
  testCases?: { input: string; expectedOutput: string; rawInput: string }[];
}

// ─── Category Mapping ─────────────────────────────────────────────────────────

const VALID_CATEGORIES = [
  'Basic Maths', 'Basic Recursion', 'Basic Hashing', 'Sorting Algorithms', 'Arrays',
  'Binary Search', 'Strings', 'Linked List', 'Doubly Linked List', 'Recursion',
  'Subsequences', 'Backtracking', 'Bit Manipulation', 'Stack', 'Queue',
  'Monotonic Stack', 'Sliding Window', 'Two Pointers', 'Heap', 'Priority Queue',
  'Greedy Algorithms', 'Binary Tree', 'Tree Traversal', 'Binary Search Tree',
  'Graph', 'BFS', 'DFS', 'Shortest Path', 'Minimum Spanning Tree', 'Topological Sort',
  'Dynamic Programming', 'DP on Arrays', 'DP on Grids', 'DP on Strings', 'DP on Trees',
  'DP on Subsequences', 'Trie', 'Mathematical', 'Geometry', 'Number Theory',
  'Combinatorics', 'Game Theory', 'Matrix', 'Design', 'System Design',
  'Interview Questions', 'Contest Problems', 'Mock Interview',
] as const;

/**
 * Maps arbitrary topic tags from LeetCode/GFG to the app's enum values.
 * Returns the best matching category or a sensible default.
 */
function mapTopicToCategory(topics: string[]): string {
  const normalized = topics.map(t => t.toLowerCase().trim());

  const rules: [RegExp, string][] = [
    [/array/i, 'Arrays'],
    [/string/i, 'Strings'],
    [/hash\s*(table|map|set)?/i, 'Basic Hashing'],
    [/linked.?list/i, 'Linked List'],
    [/doubly.?linked/i, 'Doubly Linked List'],
    [/stack/i, 'Stack'],
    [/queue/i, 'Queue'],
    [/monotonic/i, 'Monotonic Stack'],
    [/heap|priority.?queue/i, 'Heap'],
    [/sliding.?window/i, 'Sliding Window'],
    [/two.?pointer/i, 'Two Pointers'],
    [/binary.?search/i, 'Binary Search'],
    [/binary.?search.?tree|bst/i, 'Binary Search Tree'],
    [/binary.?tree/i, 'Binary Tree'],
    [/tree.?traversal/i, 'Tree Traversal'],
    [/trie/i, 'Trie'],
    [/graph/i, 'Graph'],
    [/bfs|breadth.?first/i, 'BFS'],
    [/dfs|depth.?first/i, 'DFS'],
    [/shortest.?path|dijkstra|bellman/i, 'Shortest Path'],
    [/minimum.?spanning|kruskal|prim/i, 'Minimum Spanning Tree'],
    [/topological/i, 'Topological Sort'],
    [/dynamic.?programming|dp\b/i, 'Dynamic Programming'],
    [/dp.*array/i, 'DP on Arrays'],
    [/dp.*grid/i, 'DP on Grids'],
    [/dp.*string/i, 'DP on Strings'],
    [/dp.*tree/i, 'DP on Trees'],
    [/subsequence/i, 'DP on Subsequences'],
    [/greedy/i, 'Greedy Algorithms'],
    [/backtrack/i, 'Backtracking'],
    [/recursion/i, 'Recursion'],
    [/bit.?manipul/i, 'Bit Manipulation'],
    [/math/i, 'Mathematical'],
    [/geometry/i, 'Geometry'],
    [/number.?theory/i, 'Number Theory'],
    [/combinatorics|combinat/i, 'Combinatorics'],
    [/game.?theory/i, 'Game Theory'],
    [/matrix/i, 'Matrix'],
    [/design/i, 'Design'],
    [/system.?design/i, 'System Design'],
    [/sort/i, 'Sorting Algorithms'],
    [/maths?|basic.?math/i, 'Basic Maths'],
  ];

  for (const topic of normalized) {
    for (const [pattern, category] of rules) {
      if (pattern.test(topic)) {
        return category;
      }
    }
  }

  // Check if any topic directly matches a valid category (case-insensitive)
  for (const topic of topics) {
    const match = VALID_CATEGORIES.find(
      c => c.toLowerCase() === topic.toLowerCase()
    );
    if (match) return match;
  }

  return 'Arrays'; // sensible fallback
}

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \u00A0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function addSectionBreaks(text: string): string {
  return text
    .replace(/\s*(Examples?:|Example\s*\d+\s*:|Input\s*:|Output\s*:|Explanation\s*:|Constraints\s*:|Note\s*:)/gi, '\n$1 ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanupGfgText(text: string): string {
  let cleaned = text;
  const cutoff = cleaned.search(/Expected Complexities|Company Tags|Topic Tags|Related Interview|Related Articles|Editorial|Comments|Submissions/i);
  if (cutoff > 0) cleaned = cleaned.slice(0, cutoff).trim();
  cleaned = cleaned.replace(/\bLog\s*In\b[\s\S]*/i, '').trim();
  return cleaned;
}

function looksLikeJsonBlob(text: string): boolean {
  const lowered = text.toLowerCase();
  if (lowered.includes('"problem_type"') || lowered.includes('"problem_level"') || lowered.includes('custom_input_format')) {
    return true;
  }

  const quoteCount = (text.match(/"/g) || []).length;
  const braceCount = (text.match(/[{}]/g) || []).length;
  if (quoteCount > 40 && braceCount > 10 && text.length > 500) return true;

  return false;
}

function looksLikeSolutionSnippet(text: string): boolean {
  return /class\s+Solution\b/i.test(text) && /\w+\s+\w+\s*\([^)]*\)/.test(text);
}

function normalizeCppTemplate(raw: string): string {
  if (!raw) return '';
  let text = raw;
  if (/<\/?[a-z][\s\S]*?>/i.test(text)) {
    text = cheerio.load(text).text();
  }
  text = text.replace(/\r/g, '').replace(/\u00A0/g, ' ').trim();
  const match = text.match(/class\s+Solution\s*\{[\s\S]*?\};/);
  if (!match) return '';
  const snippet = match[0].replace(/public:\s*/i, 'public:\n    ');
  return snippet.trim();
}

function isLikelyProblemStatement(text: string): boolean {
  return text.length > 80 && /(You are given|Given\b|Input\s*:|Output\s*:|Constraints\s*:|Example\s*\d*\s*:|Examples\s*:|Note\s*:)/i.test(text);
}

function decodeJsonEscapedString(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`);
  } catch {
    return raw
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
  }
}

function extractJsonValue(html: string, key: string): string {
  const regex = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, 'i');
  const match = html.match(regex);
  if (!match) return '';
  return decodeJsonEscapedString(match[1]);
}

function getScriptJson(html: string, scriptId: string): unknown | null {
  const regex = new RegExp(`<script[^>]*id=["']${scriptId}["'][^>]*>([\s\S]*?)<\/script>`, 'i');
  const match = html.match(regex);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}

function extractCppFromObject(obj: unknown, found: { best: string; count: number }): void {
  if (found.count > 20000) return;
  found.count += 1;

  if (typeof obj === 'string') {
    if (!looksLikeSolutionSnippet(obj)) return;
    const template = normalizeCppTemplate(obj);
    if (template && template.length > found.best.length) {
      found.best = template;
    }
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) extractCppFromObject(item, found);
    return;
  }

  if (obj && typeof obj === 'object') {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      extractCppFromObject(value, found);
    }
  }
}

function extractFromObject(obj: unknown, found: { best: string; count: number }): void {
  if (found.count > 20000) return;
  found.count += 1;

  if (typeof obj === 'string') {
    const asText = obj.includes('<') ? normalizeText(cheerio.load(obj).text()) : normalizeText(obj);
    if (asText && !looksLikeJsonBlob(asText) && isLikelyProblemStatement(asText) && asText.length > found.best.length) {
      found.best = asText;
    }
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) extractFromObject(item, found);
    return;
  }

  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (typeof value === 'string') {
        const keyMatch = /problem_statement|problemstatement|problem_description|problemdescription|problem_content|problemcontent|problemtext|questiontext|statement|description/i.test(key);
        const asText = value.includes('<') ? normalizeText(cheerio.load(value).text()) : normalizeText(value);
        if (keyMatch && asText && !looksLikeJsonBlob(asText) && isLikelyProblemStatement(asText) && asText.length > found.best.length) {
          found.best = asText;
        }
      }

      extractFromObject(value, found);
    }
  }
}

function extractFromNextData(html: string): string {
  const data = getScriptJson(html, '__NEXT_DATA__');
  if (!data) return '';
  const found = { best: '', count: 0 };
  extractFromObject(data, found);
  return found.best;
}

function extractCppFromNextData(html: string): string {
  const data = getScriptJson(html, '__NEXT_DATA__');
  if (!data) return '';
  const found = { best: '', count: 0 };
  extractCppFromObject(data, found);
  return found.best;
}

function extractGfgStatementFromApiData(data: unknown): string {
  const found = { best: '', count: 0 };
  extractFromObject(data, found);
  return found.best;
}

function extractGfgCppTemplateFromApiData(data: unknown): string {
  const found = { best: '', count: 0 };
  extractCppFromObject(data, found);
  return found.best;
}

function extractGfgSlug(url: string): string {
  const match = url.match(/geeksforgeeks\.org\/problems\/([^/]+)/i);
  return match?.[1] || '';
}

function extractGfgCppTemplate($: cheerio.CheerioAPI, html: string): string {
  let candidate = '';
  $('pre, code').each((_, el) => {
    const text = $(el).text();
    if (!looksLikeSolutionSnippet(text)) return;
    if (text.length > candidate.length) candidate = text;
  });

  let template = normalizeCppTemplate(candidate);
  if (template) return template;

  template = extractCppFromNextData(html);
  if (template) return template;

  const regexMatch = html.match(/class\s+Solution\s*\{[\s\S]*?\};/);
  if (regexMatch) {
    template = normalizeCppTemplate(regexMatch[0]);
    if (template) return template;
  }

  return '';
}

function extractGfgFromEmbeddedJson(html: string): string {
  const keys = [
    'problem_statement',
    'problemStatement',
    'problem_description',
    'problemDescription',
    'problem_content',
    'problemContent',
    'problemText',
    'questionText',
    'question',
  ];

  for (const key of keys) {
    const raw = extractJsonValue(html, key);
    if (!raw) continue;
    const fragmentText = normalizeText(cheerio.load(raw).text());
    if (!fragmentText || looksLikeJsonBlob(fragmentText)) continue;
    if (!isLikelyProblemStatement(fragmentText)) continue;
    return fragmentText;
  }

  return '';
}

function extractGfgProblemStatement($: cheerio.CheerioAPI, title: string, html: string): string {
  const nextDataStatement = extractFromNextData(html);
  if (nextDataStatement) {
    const cleaned = cleanupGfgText(nextDataStatement);
    return addSectionBreaks(normalizeText(cleaned));
  }

  const jsonStatement = extractGfgFromEmbeddedJson(html);
  if (jsonStatement) {
    const cleaned = cleanupGfgText(jsonStatement);
    return addSectionBreaks(normalizeText(cleaned));
  }

  const selectors = [
    '[class*="problems_problem_content"]',
    '[class*="problem-statement"]',
    '[class*="problemStatement"]',
    '#problem-statement',
    '[data-tab="problem"]',
    '[class*="problem__content"]',
    'article',
    'main',
  ];

  let best = '';

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const text = normalizeText($(el).text());
      if (looksLikeJsonBlob(text)) return;
      if (!isLikelyProblemStatement(text)) return;
      if (text.length > best.length) best = text;
    });
  }

  if (!best) {
    $('div, section').each((_, el) => {
      const text = normalizeText($(el).text());
      if (text.length < 200) return;
      if (looksLikeJsonBlob(text)) return;
      if (!/(Input\s*:|Output\s*:|Example\s*\d+\s*:|Examples\s*:|Constraints\s*:|Note\s*:)/i.test(text)) return;
      if (!isLikelyProblemStatement(text)) return;
      if (text.length > best.length) best = text;
    });
  }

  if (!best) {
    const bodyText = normalizeText($('body').text());
    if (bodyText) {
      let sliced = bodyText;
      if (title) {
        const titleIndex = bodyText.indexOf(title);
        if (titleIndex >= 0) sliced = bodyText.slice(titleIndex + title.length);
      }
      sliced = sliced.replace(/Difficulty:\s*(Easy|Medium|Hard)[\s\S]*?(?=(You are given|Given|Note:|Examples?:|Constraints?:))/i, '').trim();
      if (isLikelyProblemStatement(sliced)) best = sliced;
    }
  }

  if (!best) return '';

  const cleaned = cleanupGfgText(best);
  return addSectionBreaks(normalizeText(cleaned));
}

// ─── LeetCode Scraper ─────────────────────────────────────────────────────────

async function scrapeLeetCode(url: string): Promise<ParsedProblem> {
  // Extract slug from URL
  const slugMatch = url.match(/leetcode\.com\/problems\/([^/]+)/);
  if (!slugMatch) throw new Error('Invalid LeetCode URL');
  const slug = slugMatch[1];

  // LeetCode public GraphQL API
  const graphqlBody = {
    query: `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          content
          difficulty
          topicTags { name }
          exampleTestcases
          hints
          codeSnippets { lang langSlug code }
        }
      }
    `,
    variables: { titleSlug: slug },
  };

  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    body: JSON.stringify(graphqlBody),
    // 10-second timeout
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`LeetCode GraphQL returned ${res.status}`);

  const json = await res.json() as {
    data?: {
      question?: {
        title: string;
        content: string;
        difficulty: string;
        topicTags: { name: string }[];
        exampleTestcases: string;
        codeSnippets: { lang: string; langSlug: string; code: string }[];
      } | null;
    };
    errors?: { message: string }[];
  };

  if (json.errors?.length) throw new Error(json.errors[0].message);
  const q = json.data?.question;
  if (!q) throw new Error('Problem not found on LeetCode');

  // Parse HTML content with cheerio
  const $ = cheerio.load(q.content || '');

  // Extract examples from the HTML
  const examples: { input: string; output: string; explanation?: string }[] = [];
  $('pre').each((_, el) => {
    const text = $(el).text().trim();
    const inputMatch = text.match(/Input:\s*([\s\S]+?)(?=Output:|$)/i);
    const outputMatch = text.match(/Output:\s*([\s\S]+?)(?=Explanation:|Constraints:|$)/i);
    const explanationMatch = text.match(/Explanation:\s*([\s\S]+)$/i);

    if (inputMatch && outputMatch) {
      examples.push({
        input: inputMatch[1].trim(),
        output: outputMatch[1].trim(),
        explanation: explanationMatch?.[1]?.trim(),
      });
    }
  });

  // Extract constraints
  const constraints: string[] = [];
  $('ul li, p').each((_, el) => {
    const text = $(el).text().trim();
    if (/^[\d\-\s]*\d+\s*[<≤≥>]/.test(text) || /\b(constraints?|where)\b/i.test(text)) {
      if (!text || /^constraints:?$/i.test(text)) return;
      if (text.length < 200) constraints.push(text);
    }
  });

  // Clean problem statement - remove example/constraint sections, keep description
  // Remove <pre> blocks (examples) from the main statement
  $('pre').remove();
  // Remove constraint lists
  $('ul').each((_, el) => {
    const text = $(el).text();
    if (/\d+\s*[<≤≥>]/.test(text)) $(el).remove();
  });

  // Get clean problem statement text
  let problemStatement = $.text().trim();
  // Remove "Follow-up:" and anything after
  problemStatement = problemStatement.replace(/Follow-up:[\s\S]*/i, '').trim();
  // Remove empty section headings like "Example 1:" and "Constraints:"
  problemStatement = problemStatement
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^examples?:?$/i.test(trimmed)) return false;
      if (/^example\s*\d+\s*:?$/i.test(trimmed)) return false;
      if (/^constraints:?$/i.test(trimmed)) return false;
      return true;
    })
    .join('\n');
  // Clean up multiple blank lines
  problemStatement = problemStatement.replace(/\n{3,}/g, '\n\n').trim();

  const topics = q.topicTags.map(t => t.name);

  // Extract C++ code template from codeSnippets
  const cppSnippet = q.codeSnippets?.find(s => s.langSlug === 'cpp');
  const cppCodeTemplate = cppSnippet?.code || '';

  // Count parameters from the C++ function signature to split exampleTestcases
  let paramCount = 1;
  if (cppCodeTemplate) {
    const sigMatch = cppCodeTemplate.match(/public:\s*\n\s*[\s\S]*?\(([^)]*)\)/);
    if (sigMatch && sigMatch[1].trim()) {
      // Count commas outside of template brackets
      let depth = 0;
      let commas = 0;
      for (const ch of sigMatch[1]) {
        if (ch === '<') depth++;
        else if (ch === '>') depth--;
        else if (ch === ',' && depth === 0) commas++;
      }
      paramCount = commas + 1;
    }
  }

  // Split exampleTestcases into per-test-case rawInput using parameter count
  const rawLines = (q.exampleTestcases || '').split('\n').filter(l => l.trim() !== '');
  const rawTestCaseGroups: string[][] = [];
  for (let i = 0; i < rawLines.length; i += paramCount) {
    const group = rawLines.slice(i, i + paramCount);
    if (group.length === paramCount) {
      rawTestCaseGroups.push(group);
    }
  }

  // Build structured test cases by matching HTML examples with raw inputs
  const testCases: { input: string; expectedOutput: string; rawInput: string }[] = [];
  for (let i = 0; i < examples.length; i++) {
    testCases.push({
      input: examples[i].input,
      expectedOutput: examples[i].output,
      rawInput: rawTestCaseGroups[i] ? rawTestCaseGroups[i].join('\n') : '',
    });
  }

  return {
    title: q.title,
    problemStatement,
    examples,
    constraints,
    difficulty: q.difficulty,
    topics,
    sourceUrl: url,
    platform: 'leetcode',
    cppCodeTemplate,
    testCases,
  };
}

// ─── GeeksForGeeks Scraper ────────────────────────────────────────────────────

async function scrapeGFG(url: string): Promise<ParsedProblem> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) throw new Error(`GFG returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // Remove noisy script/style content before text extraction
  $('script, style, noscript').remove();

  // Title
  const title = (
    $('h1').first().text() ||
    $('[class*="problem-title"]').first().text() ||
    $('[class*="header-title"]').first().text() ||
    $('title').text().replace(/\s*[-|].*$/, '')
  ).trim();

  let problemStatement = extractGfgProblemStatement($, title, html);
  let cppCodeTemplate = extractGfgCppTemplate($, html);

  if (!problemStatement) {
    // Fallback: grab paragraphs from main content area
    const paragraphs: string[] = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30 && !$(el).parents('header, footer, nav').length) {
        paragraphs.push(text);
      }
    });
    const fallbackText = paragraphs.slice(0, 8).join('\n\n');
    problemStatement = isLikelyProblemStatement(fallbackText) ? fallbackText : '';
  }

  if (!problemStatement || !cppCodeTemplate) {
    const slug = extractGfgSlug(url);
    if (slug) {
      const apiUrl = `https://practiceapi.geeksforgeeks.org/api/v1/problems/${slug}`;
      try {
        const apiRes = await fetch(apiUrl, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(8000),
        });
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          if (!problemStatement) {
            const apiStatement = extractGfgStatementFromApiData(apiJson);
            if (apiStatement) problemStatement = apiStatement;
          }
          if (!cppCodeTemplate) {
            const apiTemplate = extractGfgCppTemplateFromApiData(apiJson);
            if (apiTemplate) cppCodeTemplate = apiTemplate;
          }
        }
      } catch {
        // Ignore API failures and fall back to manual entry
      }
    }
  }

  // Examples
  const examples: { input: string; output: string; explanation?: string }[] = [];
  $('pre, [class*="example"]').each((_, el) => {
    const text = $(el).text().trim();
    const inputMatch = text.match(/Input\s*[:\-]\s*([\s\S]+?)(?=Output|$)/i);
    const outputMatch = text.match(/Output\s*[:\-]\s*([\s\S]+?)(?=Explanation|Note|$)/i);
    const explanationMatch = text.match(/Explanation\s*[:\-]\s*([\s\S]+)$/i);
    if (inputMatch && outputMatch) {
      examples.push({
        input: inputMatch[1].trim(),
        output: outputMatch[1].trim(),
        explanation: explanationMatch?.[1]?.trim(),
      });
    }
  });

  // Topics/tags
  const topics: string[] = [];
  $('[class*="topic-tag"], [class*="tag"], [class*="chip"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 50) topics.push(text);
  });

  // Difficulty
  const difficultyEl = $('[class*="difficulty"], [class*="Difficulty"]').first().text().trim();
  const difficultyMatch = normalizeText($('body').text()).match(/Difficulty\s*:\s*(Easy|Medium|Hard)/i);
  const difficulty = difficultyEl || difficultyMatch?.[1] || 'Medium';

  return {
    title: title || 'Untitled Problem',
    problemStatement: problemStatement || 'Could not extract problem statement. Please paste it manually.',
    examples,
    constraints: [],
    difficulty,
    topics,
    sourceUrl: url,
    platform: 'geeksforgeeks',
    cppCodeTemplate,
  };
}

// ─── Platform Detector ────────────────────────────────────────────────────────

function detectPlatform(url: string): 'leetcode' | 'geeksforgeeks' | 'unknown' {
  if (/leetcode\.com/i.test(url)) return 'leetcode';
  if (/geeksforgeeks\.org/i.test(url)) return 'geeksforgeeks';
  return 'unknown';
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json() as { url?: string };
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const platform = detectPlatform(parsedUrl.href);

    if (platform === 'unknown') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported platform. Currently supports LeetCode and GeeksForGeeks.',
        },
        { status: 400 }
      );
    }

    let parsed: ParsedProblem;

    if (platform === 'leetcode') {
      parsed = await scrapeLeetCode(parsedUrl.href);
    } else {
      parsed = await scrapeGFG(parsedUrl.href);
    }

    // Map topics to app category
    const suggestedCategory = mapTopicToCategory(parsed.topics);

    // Format examples into problem statement appendix
    const examplesText = parsed.examples.length > 0
      ? '\n\nExamples:\n' + parsed.examples.map((ex, i) =>
          `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}${ex.explanation ? `\nExplanation: ${ex.explanation}` : ''}`
        ).join('\n\n')
      : '';

    const constraintsText = parsed.constraints.length > 0
      ? '\n\nConstraints:\n' + Array.from(new Set(parsed.constraints.map(c => c.replace(/^•\s*/, '').replace(/^constraints:?\s*/i, '').trim()).filter(Boolean))).map(c => `• ${c}`).join('\n')
      : '';

    const fullProblemStatement = parsed.problemStatement + examplesText + constraintsText;

    return NextResponse.json({
      success: true,
      data: {
        title: parsed.title,
        problemStatement: fullProblemStatement,
        testCases: parsed.testCases || parsed.examples.map(ex => ({
          input: ex.input,
          expectedOutput: ex.output,
          rawInput: '',
        })),
        constraints: parsed.constraints,
        difficulty: parsed.difficulty,
        topics: parsed.topics,
        suggestedTags: parsed.topics.slice(0, 5),
        suggestedCategory,
        platform: parsed.platform,
        sourceUrl: parsed.sourceUrl,
        cppCodeTemplate: parsed.cppCodeTemplate || '',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Distinguish timeout vs other errors
    if (message.includes('timed out') || message.includes('AbortError')) {
      return NextResponse.json(
        { success: false, error: 'Request timed out. The problem platform may be unavailable.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to parse problem: ${message}` },
      { status: 500 }
    );
  }
}
