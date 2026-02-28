/**
 * Migration Script: Backfill testCases and cppCodeTemplate for existing LeetCode problems
 * 
 * This script finds problems that were scraped from LeetCode (by detecting
 * "leetcode.com" in the problem statement or checking for the Examples section)
 * and re-fetches the test cases and C++ code template from LeetCode's GraphQL API.
 * 
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/migrateTestCases.js
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'your_mongodb_uri_here';

// Extract title slug from problem title (converts "Two Sum" → "two-sum")
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function fetchLeetCodeData(slug) {
  const graphqlBody = {
    query: `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          content
          exampleTestcases
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
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.question || null;
}

function parseExamplesFromHtml(htmlContent) {
  // Simple regex-based parsing (no cheerio in scripts)
  const examples = [];
  const preRegex = /<pre>([\s\S]*?)<\/pre>/gi;
  let match;
  while ((match = preRegex.exec(htmlContent)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    const inputMatch = text.match(/Input:\s*([\s\S]+?)(?=Output:|$)/i);
    const outputMatch = text.match(/Output:\s*([\s\S]+?)(?=Explanation:|Constraints:|$)/i);
    if (inputMatch && outputMatch) {
      examples.push({
        input: inputMatch[1].trim(),
        output: outputMatch[1].trim(),
      });
    }
  }
  return examples;
}

async function migrateTestCases() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Problem = mongoose.model('Problem', new mongoose.Schema({}, { strict: false }));

    // Find problems that don't have testCases or cppCodeTemplate
    const problems = await Problem.find({
      $or: [
        { testCases: { $exists: false } },
        { testCases: { $size: 0 } },
        { cppCodeTemplate: { $exists: false } },
        { cppCodeTemplate: '' },
      ],
    });

    console.log(`📊 Found ${problems.length} problems without test cases`);

    if (problems.length === 0) {
      console.log('✅ All problems already have test cases!');
      return;
    }

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const problem of problems) {
      const slug = titleToSlug(problem.title);
      console.log(`\n⏳ Processing: "${problem.title}" → slug: "${slug}"`);

      try {
        const data = await fetchLeetCodeData(slug);
        if (!data) {
          console.log(`  ⚠️ Not found on LeetCode, skipping`);
          skipped++;
          continue;
        }

        // Extract C++ template
        const cppSnippet = data.codeSnippets?.find(s => s.langSlug === 'cpp');
        const cppCodeTemplate = cppSnippet?.code || '';

        // Parse examples from HTML
        const examples = parseExamplesFromHtml(data.content || '');

        // Count params for rawInput splitting
        let paramCount = 1;
        if (cppCodeTemplate) {
          const sigMatch = cppCodeTemplate.match(/public:\s*\n\s*[\s\S]*?\(([^)]*)\)/);
          if (sigMatch && sigMatch[1].trim()) {
            let depth = 0, commas = 0;
            for (const ch of sigMatch[1]) {
              if (ch === '<') depth++;
              else if (ch === '>') depth--;
              else if (ch === ',' && depth === 0) commas++;
            }
            paramCount = commas + 1;
          }
        }

        // Split raw test cases
        const rawLines = (data.exampleTestcases || '').split('\n').filter(l => l.trim());
        const rawGroups = [];
        for (let i = 0; i < rawLines.length; i += paramCount) {
          const group = rawLines.slice(i, i + paramCount);
          if (group.length === paramCount) rawGroups.push(group);
        }

        // Build test cases
        const testCases = examples.map((ex, i) => ({
          input: ex.input,
          expectedOutput: ex.output,
          rawInput: rawGroups[i] ? rawGroups[i].join('\n') : '',
        }));

        if (testCases.length === 0 && !cppCodeTemplate) {
          console.log(`  ⚠️ No data extracted, skipping`);
          skipped++;
          continue;
        }

        await Problem.updateOne(
          { _id: problem._id },
          {
            $set: {
              testCases: testCases.length > 0 ? testCases : [],
              cppCodeTemplate: cppCodeTemplate,
            },
          }
        );

        updated++;
        console.log(`  ✅ Updated with ${testCases.length} test cases`);

        // Rate limiting: wait 1.5s between requests
        await new Promise(r => setTimeout(r, 1500));
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
        failed++;
        // Continue with next problem
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log(`\n────────────────────────────────`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`⚠️ Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`────────────────────────────────`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migrateTestCases();
