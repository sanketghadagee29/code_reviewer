import { useState, useEffect, useRef } from 'react'
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"

// Load all language grammars
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-python"
import "prismjs/components/prism-java"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-sql"
import "prismjs/components/prism-ruby"
import "prismjs/components/prism-go"
import "prismjs/components/prism-rust"
import "prismjs/components/prism-markup-templating"
import "prismjs/components/prism-php"
import "prismjs/components/prism-swift"
import "prismjs/components/prism-kotlin"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-css"

import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from 'axios'
import './App.css'

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: '.js',  dotClass: 'lang-js',  prismKey: 'javascript',
    sample: `function fetchUserData(userId) {\n  var data = null;\n  $.ajax({\n    url: '/api/users/' + userId,\n    async: false,\n    success: function(res) { data = res; }\n  });\n  return data;\n}` },
  { id: 'typescript', label: 'TypeScript', ext: '.ts',  dotClass: 'lang-ts',  prismKey: 'typescript',
    sample: `interface User { id: number; name: string; }\n\nasync function getUser(id: number): Promise<User> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  return res.json();\n}` },
  { id: 'python',     label: 'Python',     ext: '.py',  dotClass: 'lang-py',  prismKey: 'python',
    sample: `def calculate_average(numbers):\n    total = 0\n    for n in numbers:\n        total = total + n\n    avg = total / len(numbers)\n    return avg\n\nresult = calculate_average([10, 20, 30])` },
  { id: 'java',       label: 'Java',       ext: '.java',dotClass: 'lang-java', prismKey: 'java',
    sample: `public class Calculator {\n    public static int divide(int a, int b) {\n        return a / b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(divide(10, 0));\n    }\n}` },
  { id: 'c',          label: 'C',          ext: '.c',   dotClass: 'lang-c',   prismKey: 'c',
    sample: `#include <stdio.h>\n#include <stdlib.h>\n\nchar* readFile(const char* filename) {\n    FILE* f = fopen(filename, "r");\n    char* buf = malloc(1024);\n    fread(buf, 1, 1024, f);\n    return buf;\n}` },
  { id: 'cpp',        label: 'C++',        ext: '.cpp', dotClass: 'lang-cpp', prismKey: 'cpp',
    sample: `#include <iostream>\n#include <vector>\n\nint main() {\n    int arr[] = {5, 2, 8, 1, 9};\n    int n = sizeof(arr) / sizeof(arr[0]);\n    for (int i = 0; i < n; i++)\n        for (int j = 0; j < n-i-1; j++)\n            if (arr[j] > arr[j+1])\n                std::swap(arr[j], arr[j+1]);\n}` },
  { id: 'sql',        label: 'SQL',        ext: '.sql', dotClass: 'lang-sql', prismKey: 'sql',
    sample: `SELECT u.name, COUNT(o.id) as total_orders\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.created_at > '2023-01-01'\nGROUP BY u.id\nORDER BY total_orders DESC;` },
  { id: 'ruby',       label: 'Ruby',       ext: '.rb',  dotClass: 'lang-rb',  prismKey: 'ruby',
    sample: `class BankAccount\n  def initialize(balance)\n    @balance = balance\n  end\n\n  def withdraw(amount)\n    @balance = @balance - amount\n    puts "New balance: #{@balance}"\n  end\nend\n\naccount = BankAccount.new(100)\naccount.withdraw(150)` },
  { id: 'go',         label: 'Go',         ext: '.go',  dotClass: 'lang-go',  prismKey: 'go',
    sample: `package main\n\nimport "fmt"\n\nfunc fibonacci(n int) int {\n    if n <= 1 {\n        return n\n    }\n    return fibonacci(n-1) + fibonacci(n-2)\n}\n\nfunc main() {\n    fmt.Println(fibonacci(40))\n}` },
  { id: 'rust',       label: 'Rust',       ext: '.rs',  dotClass: 'lang-rs',  prismKey: 'rust',
    sample: `fn main() {\n    let s1 = String::from("hello");\n    let s2 = s1;\n    println!("{}", s1); // error: value moved\n}` },
  { id: 'php',        label: 'PHP',        ext: '.php', dotClass: 'lang-php', prismKey: 'php',
    sample: `<?php\n$user = $_GET['username'];\n$query = "SELECT * FROM users WHERE name = '$user'";\n$result = mysqli_query($conn, $query);\necho $result;` },
  { id: 'swift',      label: 'Swift',      ext: '.swift',dotClass: 'lang-sw', prismKey: 'swift',
    sample: `import Foundation\n\nfunc findIndex(in array: [Int], target: Int) -> Int {\n    for i in 0...array.count {\n        if array[i] == target { return i }\n    }\n    return -1\n}` },
  { id: 'kotlin',     label: 'Kotlin',     ext: '.kt',  dotClass: 'lang-kt',  prismKey: 'kotlin',
    sample: `fun main() {\n    val numbers = listOf(1, 2, 3, 4, 5)\n    val doubled = numbers.map { it * 2 }\n    val sum = doubled.reduce { acc, n -> acc + n }\n    println(sum)\n}` },
  { id: 'bash',       label: 'Bash',       ext: '.sh',  dotClass: 'lang-sh',  prismKey: 'bash',
    sample: `#!/bin/bash\n\nFILE=$1\n\nif [ -f $FILE ]; then\n  cat $FILE | grep "error" | awk '{print $2}'\nfi` },
]

export default function App() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0])
  const [code, setCode] = useState(LANGUAGES[0].sample)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const reviewRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (review && reviewRef.current) {
      reviewRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [review])

  function selectLanguage(lang) {
    setSelectedLang(lang)
    setCode(lang.sample)
    setReview('')
    setDropdownOpen(false)
  }

  function highlightCode(code) {
    const grammar = prism.languages[selectedLang.prismKey]
    if (!grammar) return code
    return prism.highlight(code, grammar, selectedLang.prismKey)
  }

  async function reviewCode() {
    if (!code.trim() || loading) return
    setLoading(true)
    setReview('')
    try {
      const response = await axios.post('http://localhost:3000/ai/get-review', {
        code,
        language: selectedLang.label,
      })
      setReview(response.data)
    } catch (err) {
      setReview(`⚠️ **Connection failed.** Make sure your backend is running on port 3000.\n\n\`\`\`\n${err.message}\n\`\`\``)
    } finally {
      setLoading(false)
    }
  }

  function clearCode() {
    setCode('')
    setReview('')
  }

  const lineCount = code.split('\n').length

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="logo-text">CodeReview <span className="logo-ai">AI</span></span>
          </div>
        </div>
      
      </header>

      <main className="main">
        {/* Left Panel — Editor */}
        <div className="panel panel-left">
          <div className="panel-header">
            <div className="panel-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              Code Editor
            </div>
            <div className="panel-actions">
              <span className="char-count">{code.length} chars · {lineCount} lines</span>
              <button className="ghost-btn" onClick={clearCode}>Clear</button>
            </div>
          </div>

          <div className="editor-wrap">
            <div className="line-numbers" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="ln">{i + 1}</div>
              ))}
            </div>
            <div className="editor-inner">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={highlightCode}
                padding={{ top: 16, bottom: 16, left: 12, right: 16 }}
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: 13.5,
                  lineHeight: '1.7',
                  minHeight: '100%',
                  background: 'transparent',
                  color: '#e2e8f0',
                }}
                textareaClassName="code-textarea"
              />
            </div>
          </div>

          {/* Footer with Language Picker */}
          <div className="panel-footer">
            <div className="lang-selector-wrap" ref={dropdownRef}>
              <button
                className="lang-selector-btn"
                onClick={() => setDropdownOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
              >
                <span className={`lang-dot ${selectedLang.dotClass}`} />
                <span>{selectedLang.label}</span>
                <span className="lang-ext">{selectedLang.ext}</span>
                <svg
                  className={`chevron ${dropdownOpen ? 'chevron--up' : ''}`}
                  width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="lang-dropdown" role="listbox">
                  <div className="lang-dropdown-grid">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.id}
                        role="option"
                        aria-selected={lang.id === selectedLang.id}
                        className={`lang-option ${lang.id === selectedLang.id ? 'lang-option--active' : ''}`}
                        onClick={() => selectLanguage(lang)}
                      >
                        <span className={`lang-dot ${lang.dotClass}`} />
                        <span className="lang-option-label">{lang.label}</span>
                        <span className="lang-option-ext">{lang.ext}</span>
                        {lang.id === selectedLang.id && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="check-icon">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className={`review-btn ${loading ? 'review-btn--loading' : ''}`}
              onClick={reviewCode}
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Analyzing…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Review Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel — Review */}
        <div className="panel panel-right" ref={reviewRef}>
          <div className="panel-header">
            <div className="panel-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              AI Review
            </div>
            {review && (
              <button className="ghost-btn" onClick={() => setReview('')}>Clear</button>
            )}
          </div>

          <div className="review-body">
            {!review && !loading && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <p className="empty-title">Ready to review</p>
                <p className="empty-sub">
                  Select a language, paste your code, and click <em>Review Code</em> for AI-powered feedback.
                </p>
                <div className="lang-chips">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.id}
                      className={`lang-chip ${l.id === selectedLang.id ? 'lang-chip--active' : ''}`}
                      onClick={() => selectLanguage(l)}
                    >
                      <span className={`lang-dot-sm ${l.dotClass}`} />
                      {l.label}
                    </button>
                  ))}
                </div>
                <div className="feature-pills">
                  {['Bug detection', 'Performance tips', 'Best practices', 'Security checks'].map(f => (
                    <span key={f} className="pill">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="loading-bars">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="loading-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <div className="loading-lines">
                  {[80, 60, 90, 50, 70].map((w, i) => (
                    <div key={i} className="skeleton-line" style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="loading-text">Analyzing {selectedLang.label} code…</p>
              </div>
            )}

            {review && !loading && (
              <div className="review-content">
                <div className="review-lang-tag">
                  <span className={`lang-dot ${selectedLang.dotClass}`} />
                  {selectedLang.label} Review
                </div>
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}