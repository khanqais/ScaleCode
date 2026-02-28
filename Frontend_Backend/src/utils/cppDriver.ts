// ─── C++ Driver Code Generator ────────────────────────────────────────────────
// Generates a complete C++ program that wraps the user's Solution class
// with input parsing, function invocation, and output formatting
// for automated testing against LeetCode-style test cases.

export interface FunctionSignature {
  returnType: string;
  functionName: string;
  params: { type: string; name: string }[];
}

// ─── Signature Parsing ────────────────────────────────────────────────────────

/**
 * Parse a C++ function signature from a LeetCode code template.
 * E.g. from:
 *   class Solution {
 *   public:
 *       vector<int> twoSum(vector<int>& nums, int target) { }
 *   };
 * Extracts: { returnType: "vector<int>", functionName: "twoSum", params: [...] }
 */
export function parseCppSignature(cppTemplate: string): FunctionSignature | null {
  // Extract the function line between "public:" and the first "{"
  const match = cppTemplate.match(/public:\s*\n\s*([\s\S]*?)\s*\{/);
  if (!match) return null;

  const sigLine = match[1].trim().replace(/\s+/g, ' ');
  return parseSignatureLine(sigLine);
}

function parseSignatureLine(sig: string): FunctionSignature | null {
  const parenIdx = sig.indexOf('(');
  if (parenIdx === -1) return null;

  const beforeParen = sig.substring(0, parenIdx).trim();
  const paramsStr = sig.substring(parenIdx + 1, sig.lastIndexOf(')')).trim();

  // Split return type and function name
  const lastSpaceIdx = findLastSpaceOutsideTemplates(beforeParen);
  if (lastSpaceIdx === -1) return null;

  const returnType = beforeParen.substring(0, lastSpaceIdx).trim();
  const functionName = beforeParen.substring(lastSpaceIdx + 1).trim();

  // Parse parameters
  const params: { type: string; name: string }[] = [];
  if (paramsStr) {
    const paramParts = splitByCommaRespectingTemplates(paramsStr);
    for (const part of paramParts) {
      const param = parseSingleParam(part.trim());
      if (param) params.push(param);
    }
  }

  return { returnType, functionName, params };
}

function findLastSpaceOutsideTemplates(s: string): number {
  let depth = 0;
  let lastSpace = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '<') depth++;
    else if (s[i] === '>') depth--;
    else if (s[i] === ' ' && depth === 0) lastSpace = i;
  }
  return lastSpace;
}

function splitByCommaRespectingTemplates(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of s) {
    if (ch === '<') depth++;
    else if (ch === '>') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function parseSingleParam(paramStr: string): { type: string; name: string } | null {
  const clean = paramStr.replace(/\bconst\b/g, '').replace(/&/g, '').replace(/\s+/g, ' ').trim();
  const lastSpace = findLastSpaceOutsideTemplates(clean);
  if (lastSpace === -1) return null;
  const type = clean.substring(0, lastSpace).trim();
  const name = clean.substring(lastSpace + 1).trim();
  return { type, name };
}

// ─── Type → Parser / Formatter Mapping ────────────────────────────────────────

function normalizeType(type: string): string {
  return type.replace(/\s+/g, ' ').trim();
}

const TYPE_PARSERS: Record<string, string> = {
  'int': '__parseInt',
  'long long': '__parseLongLong',
  'long': '__parseLong',
  'double': '__parseDouble',
  'float': '__parseFloat',
  'bool': '__parseBool',
  'string': '__parseString',
  'char': '__parseChar',
  'vector<int>': '__parseVectorInt',
  'vector<long long>': '__parseVectorLongLong',
  'vector<long>': '__parseVectorLong',
  'vector<double>': '__parseVectorDouble',
  'vector<float>': '__parseVectorFloat',
  'vector<string>': '__parseVectorString',
  'vector<char>': '__parseVectorChar',
  'vector<bool>': '__parseVectorBool',
  'vector<vector<int>>': '__parseVectorVectorInt',
  'vector<vector<char>>': '__parseVectorVectorChar',
  'vector<vector<string>>': '__parseVectorVectorString',
  'ListNode*': '__parseListNode',
  'TreeNode*': '__parseTreeNode',
};

const TYPE_FORMATTERS: Record<string, string> = {
  'int': '__formatInt',
  'long long': '__formatLongLong',
  'long': '__formatLong',
  'double': '__formatDouble',
  'float': '__formatFloat',
  'bool': '__formatBool',
  'string': '__formatString',
  'char': '__formatChar',
  'vector<int>': '__formatVectorInt',
  'vector<long long>': '__formatVectorLongLong',
  'vector<long>': '__formatVectorLong',
  'vector<double>': '__formatVectorDouble',
  'vector<float>': '__formatVectorFloat',
  'vector<string>': '__formatVectorString',
  'vector<char>': '__formatVectorChar',
  'vector<bool>': '__formatVectorBool',
  'vector<vector<int>>': '__formatVectorVectorInt',
  'vector<vector<char>>': '__formatVectorVectorChar',
  'vector<vector<string>>': '__formatVectorVectorString',
  'ListNode*': '__formatListNode',
  'TreeNode*': '__formatTreeNode',
};

// ─── C++ Helper Code ──────────────────────────────────────────────────────────
// All input parsers and output formatters, plus ListNode/TreeNode structs.

const CPP_HELPERS = `#include <bits/stdc++.h>
using namespace std;

// ---- Helper Structs ----
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

// ---- Trim ----
string __trim(const string& s) {
    size_t a = s.find_first_not_of(" \\t\\n\\r");
    size_t b = s.find_last_not_of(" \\t\\n\\r");
    return (a == string::npos) ? "" : s.substr(a, b - a + 1);
}

// ---- Input Parsers ----
int __parseInt(const string& s) { return stoi(__trim(s)); }
long long __parseLongLong(const string& s) { return stoll(__trim(s)); }
long __parseLong(const string& s) { return stol(__trim(s)); }
double __parseDouble(const string& s) { return stod(__trim(s)); }
float __parseFloat(const string& s) { return stof(__trim(s)); }
bool __parseBool(const string& s) { return __trim(s) == "true"; }

string __parseString(const string& s) {
    string t = __trim(s);
    if (t.size() >= 2 && t.front() == '"' && t.back() == '"')
        return t.substr(1, t.size() - 2);
    return t;
}

char __parseChar(const string& s) {
    string t = __trim(s);
    if (t.size() >= 3 && t[0] == '"' && t[2] == '"') return t[1];
    if (t.size() >= 3 && t[0] == '\\'' && t[2] == '\\'') return t[1];
    return t.empty() ? ' ' : t[0];
}

vector<int> __parseVectorInt(const string& s) {
    string t = __trim(s);
    vector<int> r;
    if (t.size() < 2 || t.front() != '[') return r;
    t = t.substr(1, t.size() - 2);
    if (t.empty()) return r;
    stringstream ss(t); string item;
    while (getline(ss, item, ',')) r.push_back(stoi(__trim(item)));
    return r;
}

vector<long long> __parseVectorLongLong(const string& s) {
    string t = __trim(s);
    vector<long long> r;
    if (t.size() < 2 || t.front() != '[') return r;
    t = t.substr(1, t.size() - 2);
    if (t.empty()) return r;
    stringstream ss(t); string item;
    while (getline(ss, item, ',')) r.push_back(stoll(__trim(item)));
    return r;
}

vector<long> __parseVectorLong(const string& s) {
    string t = __trim(s);
    vector<long> r;
    if (t.size() < 2 || t.front() != '[') return r;
    t = t.substr(1, t.size() - 2);
    if (t.empty()) return r;
    stringstream ss(t); string item;
    while (getline(ss, item, ',')) r.push_back(stol(__trim(item)));
    return r;
}

vector<double> __parseVectorDouble(const string& s) {
    string t = __trim(s);
    vector<double> r;
    if (t.size() < 2 || t.front() != '[') return r;
    t = t.substr(1, t.size() - 2);
    if (t.empty()) return r;
    stringstream ss(t); string item;
    while (getline(ss, item, ',')) r.push_back(stod(__trim(item)));
    return r;
}

vector<float> __parseVectorFloat(const string& s) {
    string t = __trim(s);
    vector<float> r;
    if (t.size() < 2 || t.front() != '[') return r;
    t = t.substr(1, t.size() - 2);
    if (t.empty()) return r;
    stringstream ss(t); string item;
    while (getline(ss, item, ',')) r.push_back(stof(__trim(item)));
    return r;
}

vector<string> __parseVectorString(const string& s) {
    string t = __trim(s);
    vector<string> r;
    if (t.size() < 2 || t.front() != '[') return r;
    t = t.substr(1, t.size() - 2);
    if (t.empty()) return r;
    bool inStr = false;
    string cur;
    for (char c : t) {
        if (c == '"') { inStr = !inStr; }
        else if (c == ',' && !inStr) { r.push_back(cur); cur.clear(); }
        else cur += c;
    }
    if (!cur.empty() || !r.empty()) r.push_back(cur);
    return r;
}

vector<char> __parseVectorChar(const string& s) {
    auto vs = __parseVectorString(s);
    vector<char> r;
    for (auto& str : vs) r.push_back(str.empty() ? ' ' : str[0]);
    return r;
}

vector<bool> __parseVectorBool(const string& s) {
    string t = __trim(s);
    vector<bool> r;
    if (t.size() < 2 || t.front() != '[') return r;
    t = t.substr(1, t.size() - 2);
    if (t.empty()) return r;
    stringstream ss(t); string item;
    while (getline(ss, item, ',')) r.push_back(__trim(item) == "true");
    return r;
}

vector<vector<int>> __parseVectorVectorInt(const string& s) {
    string t = __trim(s);
    vector<vector<int>> r;
    if (t.size() < 2) return r;
    t = t.substr(1, t.size() - 2);
    int depth = 0; string cur;
    for (char c : t) {
        if (c == '[') { depth++; if (depth == 1) { cur.clear(); continue; } }
        else if (c == ']') { depth--; if (depth == 0) { r.push_back(__parseVectorInt("[" + cur + "]")); cur.clear(); continue; } }
        else if (c == ',' && depth == 0) continue;
        cur += c;
    }
    return r;
}

vector<vector<char>> __parseVectorVectorChar(const string& s) {
    string t = __trim(s);
    vector<vector<char>> r;
    if (t.size() < 2) return r;
    t = t.substr(1, t.size() - 2);
    int depth = 0; string cur;
    for (char c : t) {
        if (c == '[') { depth++; if (depth == 1) { cur.clear(); continue; } }
        else if (c == ']') { depth--; if (depth == 0) { r.push_back(__parseVectorChar("[" + cur + "]")); cur.clear(); continue; } }
        else if (c == ',' && depth == 0) continue;
        cur += c;
    }
    return r;
}

vector<vector<string>> __parseVectorVectorString(const string& s) {
    string t = __trim(s);
    vector<vector<string>> r;
    if (t.size() < 2) return r;
    t = t.substr(1, t.size() - 2);
    int depth = 0; string cur;
    for (char c : t) {
        if (c == '[') { depth++; if (depth == 1) { cur.clear(); continue; } }
        else if (c == ']') { depth--; if (depth == 0) { r.push_back(__parseVectorString("[" + cur + "]")); cur.clear(); continue; } }
        else if (c == ',' && depth == 0) continue;
        cur += c;
    }
    return r;
}

ListNode* __parseListNode(const string& s) {
    auto v = __parseVectorInt(s);
    ListNode dummy;
    ListNode* cur = &dummy;
    for (int x : v) { cur->next = new ListNode(x); cur = cur->next; }
    return dummy.next;
}

TreeNode* __parseTreeNode(const string& s) {
    string t = __trim(s);
    if (t.size() < 2 || t == "[]") return nullptr;
    t = t.substr(1, t.size() - 2);
    vector<string> tokens;
    stringstream ss(t); string item;
    while (getline(ss, item, ',')) tokens.push_back(__trim(item));
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(stoi(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < (int)tokens.size()) {
        TreeNode* node = q.front(); q.pop();
        if (i < (int)tokens.size() && tokens[i] != "null") {
            node->left = new TreeNode(stoi(tokens[i]));
            q.push(node->left);
        }
        i++;
        if (i < (int)tokens.size() && tokens[i] != "null") {
            node->right = new TreeNode(stoi(tokens[i]));
            q.push(node->right);
        }
        i++;
    }
    return root;
}

// ---- Output Formatters ----
string __formatInt(int v) { return to_string(v); }
string __formatLongLong(long long v) { return to_string(v); }
string __formatLong(long v) { return to_string(v); }
string __formatDouble(double v) {
    ostringstream o; o << fixed << setprecision(5) << v;
    string s = o.str();
    size_t dot = s.find('.');
    if (dot != string::npos) {
        size_t last = s.find_last_not_of('0');
        if (last == dot) return s.substr(0, dot);
        return s.substr(0, last + 1);
    }
    return s;
}
string __formatFloat(float v) { return __formatDouble((double)v); }
string __formatBool(bool v) { return v ? "true" : "false"; }
string __formatString(const string& v) { return "\\"" + v + "\\""; }
string __formatChar(char v) { return string(1, v); }

string __formatVectorInt(const vector<int>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += to_string(v[i]); }
    return s + "]";
}
string __formatVectorLongLong(const vector<long long>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += to_string(v[i]); }
    return s + "]";
}
string __formatVectorLong(const vector<long>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += to_string(v[i]); }
    return s + "]";
}
string __formatVectorDouble(const vector<double>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += __formatDouble(v[i]); }
    return s + "]";
}
string __formatVectorFloat(const vector<float>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += __formatFloat(v[i]); }
    return s + "]";
}
string __formatVectorString(const vector<string>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += "\\"" + v[i] + "\\""; }
    return s + "]";
}
string __formatVectorChar(const vector<char>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += "\\""; s += v[i]; s += "\\""; }
    return s + "]";
}
string __formatVectorBool(const vector<bool>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += v[i] ? "true" : "false"; }
    return s + "]";
}
string __formatVectorVectorInt(const vector<vector<int>>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += __formatVectorInt(v[i]); }
    return s + "]";
}
string __formatVectorVectorChar(const vector<vector<char>>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += __formatVectorChar(v[i]); }
    return s + "]";
}
string __formatVectorVectorString(const vector<vector<string>>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += __formatVectorString(v[i]); }
    return s + "]";
}

string __formatListNode(ListNode* head) {
    string s = "[";
    bool first = true;
    while (head) {
        if (!first) s += ",";
        s += to_string(head->val);
        first = false;
        head = head->next;
    }
    return s + "]";
}

string __formatTreeNode(TreeNode* root) {
    if (!root) return "[]";
    string s = "[";
    queue<TreeNode*> q;
    q.push(root);
    vector<string> tokens;
    while (!q.empty()) {
        TreeNode* node = q.front(); q.pop();
        if (node) {
            tokens.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            tokens.push_back("null");
        }
    }
    while (!tokens.empty() && tokens.back() == "null") tokens.pop_back();
    for (int i = 0; i < (int)tokens.size(); i++) { if (i) s += ","; s += tokens[i]; }
    return s + "]";
}
`;

// ─── Program Generator ───────────────────────────────────────────────────────

/**
 * Generate a complete C++ program that:
 * 1. Includes all helper code (parsers, formatters, structs)
 * 2. Includes the user's Solution class
 * 3. Has a main() that reads T test cases from stdin,
 *    calls the solution function, and prints results.
 */
export function generateCppProgram(
  userCode: string,
  signature: FunctionSignature,
): string {
  // Validate types are supported
  for (const param of signature.params) {
    const nt = normalizeType(param.type);
    if (!TYPE_PARSERS[nt]) {
      throw new Error(`Unsupported parameter type: ${param.type}`);
    }
  }
  if (signature.returnType !== 'void') {
    const nt = normalizeType(signature.returnType);
    if (!TYPE_FORMATTERS[nt]) {
      throw new Error(`Unsupported return type: ${signature.returnType}`);
    }
  }

  // Build main()
  let main = '\nint main() {\n';
  main += '    int __T;\n';
  main += '    string __line;\n';
  main += '    getline(cin, __line);\n';
  main += '    __T = stoi(__trim(__line));\n\n';
  main += '    while (__T--) {\n';

  // Parse each parameter
  for (const param of signature.params) {
    const parser = TYPE_PARSERS[normalizeType(param.type)];
    main += '        getline(cin, __line);\n';
    main += `        ${param.type} ${param.name} = ${parser}(__line);\n`;
  }

  // Call function and format output
  const args = signature.params.map(p => p.name).join(', ');

  if (signature.returnType === 'void') {
    main += `        Solution().${signature.functionName}(${args});\n`;
    // For void return, print the first vector/list parameter (common LeetCode pattern)
    const mutableParam = signature.params.find(p =>
      p.type.startsWith('vector') || p.type === 'ListNode*' || p.type === 'TreeNode*'
    );
    if (mutableParam) {
      const formatter = TYPE_FORMATTERS[normalizeType(mutableParam.type)];
      main += `        cout << ${formatter}(${mutableParam.name}) << endl;\n`;
    } else {
      main += '        cout << "void" << endl;\n';
    }
  } else {
    const formatter = TYPE_FORMATTERS[normalizeType(signature.returnType)];
    main += `        auto __result = Solution().${signature.functionName}(${args});\n`;
    main += `        cout << ${formatter}(__result) << endl;\n`;
  }

  main += '        if (__T > 0) cout << "---TESTCASE_DELIMITER---" << endl;\n';
  main += '    }\n';
  main += '    return 0;\n';
  main += '}\n';

  // Clean user code: remove includes/namespace/struct defs that conflict with helpers
  let cleanCode = userCode;
  cleanCode = cleanCode.replace(/#include\s*<[^>]+>\s*/g, '');
  cleanCode = cleanCode.replace(/using\s+namespace\s+std\s*;\s*/g, '');
  // Remove user-defined ListNode/TreeNode (with optional preceding comment block)
  cleanCode = cleanCode.replace(/\/\*\*[\s\S]*?\*\/\s*struct\s+(ListNode|TreeNode)\s*\{[\s\S]*?\};\s*/g, '');
  cleanCode = cleanCode.replace(/\/\/[^\n]*\nstruct\s+(ListNode|TreeNode)\s*\{[\s\S]*?\};\s*/g, '');
  cleanCode = cleanCode.replace(/struct\s+(ListNode|TreeNode)\s*\{[\s\S]*?\};\s*/g, '');

  return CPP_HELPERS + '\n// ---- User Solution ----\n' + cleanCode.trim() + '\n\n// ---- Auto-generated Main ----' + main;
}

/**
 * Build stdin string for the execution engine.
 * Format: first line is test case count, then each test case's rawInput.
 */
export function buildStdin(testCases: { rawInput: string }[]): string {
  let stdin = `${testCases.length}\n`;
  for (const tc of testCases) {
    stdin += tc.rawInput + '\n';
  }
  return stdin;
}

/**
 * Parse stdout from the executed program into per-test-case outputs.
 */
export function parseOutput(stdout: string, testCaseCount: number): string[] {
  const delimiter = '---TESTCASE_DELIMITER---';
  return stdout.split(delimiter).map(s => s.trim()).slice(0, testCaseCount);
}

/**
 * Normalize output for comparison: trim, remove all whitespace, lowercase.
 */
export function normalizeForComparison(output: string): string {
  return output.trim().replace(/\s+/g, '').toLowerCase();
}
