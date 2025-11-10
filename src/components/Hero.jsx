import React, { useEffect, useMemo, useState } from 'react';
import './Hero.css';

// Syntax highlighting parser
const parseCode = (code) => {
  const tokens = [];
  let i = 0;
  let currentToken = '';
  let inString = false;
  let stringQuote = '';

  const keywords = ['class', 'def', 'end', 'attr_reader', 'private', 'return'];
  const operators = ['=', ':', ',', '{', '}', '[', ']', '(', ')', ';'];

  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1];
    const prevChar = i > 0 ? code[i - 1] : '';

    // Handle string literals
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (inString && char === stringQuote) {
        // End of string
        tokens.push({ text: currentToken + char, type: 'string' });
        currentToken = '';
        inString = false;
        stringQuote = '';
        i++;
        continue;
      } else if (!inString) {
        // Start of string
        if (currentToken) {
          // Check if current token is a keyword or identifier
          if (keywords.includes(currentToken.trim())) {
            tokens.push({ text: currentToken, type: 'keyword' });
          } else if (currentToken.trim() && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(currentToken.trim())) {
            tokens.push({ text: currentToken, type: 'identifier' });
          } else {
            tokens.push({ text: currentToken, type: 'text' });
          }
          currentToken = '';
        }
        inString = true;
        stringQuote = char;
        currentToken = char;
        i++;
        continue;
      }
    }

    if (inString) {
      currentToken += char;
      i++;
      continue;
    }

    // Handle arrow function
    if (char === '=' && nextChar === '>') {
      if (currentToken) {
        if (keywords.includes(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'keyword' });
        } else if (currentToken.trim() && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'identifier' });
        } else {
          tokens.push({ text: currentToken, type: 'text' });
        }
        currentToken = '';
      }
      tokens.push({ text: '=>', type: 'keyword' });
      i += 2;
      continue;
    }

    // Handle Ruby instance variables (@variable)
    if (char === '@' && !inString) {
      if (currentToken) {
        if (keywords.includes(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'keyword' });
        } else if (currentToken.trim() && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'identifier' });
        } else {
          tokens.push({ text: currentToken, type: 'text' });
        }
        currentToken = '';
      }
      // Start collecting instance variable
      currentToken = '@';
      i++;
      continue;
    }

    // Handle Ruby symbols (:symbol)
    if (char === ':' && !inString && nextChar && /[a-zA-Z_]/.test(nextChar)) {
      if (currentToken) {
        if (keywords.includes(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'keyword' });
        } else if (currentToken.trim() && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'identifier' });
        } else {
          tokens.push({ text: currentToken, type: 'text' });
        }
        currentToken = '';
      }
      // Start collecting symbol
      currentToken = ':';
      i++;
      continue;
    }

    // Whitespace and newlines
    if (char === '\n' || char === ' ' || char === '\t') {
      if (currentToken) {
        // Check if it's an instance variable or symbol
        if (currentToken.startsWith('@')) {
          tokens.push({ text: currentToken, type: 'instance-var' });
        } else if (currentToken.startsWith(':')) {
          tokens.push({ text: currentToken, type: 'symbol' });
        } else if (keywords.includes(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'keyword' });
        } else if (currentToken.trim() && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'identifier' });
        } else {
          tokens.push({ text: currentToken, type: 'text' });
        }
        currentToken = '';
      }
      tokens.push({ text: char, type: 'whitespace' });
      i++;
      continue;
    }

    // Check for operators (but skip ':' if it's part of a symbol)
    if (operators.includes(char) && !(char === ':' && currentToken.startsWith(':'))) {
      if (currentToken) {
        // Check if it's an instance variable or symbol
        if (currentToken.startsWith('@')) {
          tokens.push({ text: currentToken, type: 'instance-var' });
        } else if (currentToken.startsWith(':')) {
          tokens.push({ text: currentToken, type: 'symbol' });
        } else if (keywords.includes(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'keyword' });
        } else if (currentToken.trim() && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(currentToken.trim())) {
          tokens.push({ text: currentToken, type: 'identifier' });
        } else {
          tokens.push({ text: currentToken, type: 'text' });
        }
        currentToken = '';
      }
      tokens.push({ text: char, type: 'operator' });
      i++;
      continue;
    }

    // Build token
    currentToken += char;
    i++;
  }

  // Handle remaining token
  if (currentToken) {
    if (inString) {
      tokens.push({ text: currentToken, type: 'string' });
    } else if (currentToken.startsWith('@')) {
      tokens.push({ text: currentToken, type: 'instance-var' });
    } else if (currentToken.startsWith(':')) {
      tokens.push({ text: currentToken, type: 'symbol' });
    } else if (keywords.includes(currentToken.trim())) {
      tokens.push({ text: currentToken, type: 'keyword' });
    } else if (currentToken.trim() && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(currentToken.trim())) {
      tokens.push({ text: currentToken, type: 'identifier' });
    } else {
      tokens.push({ text: currentToken, type: 'text' });
    }
  }

  return tokens;
};

const Typewriter = ({ code, speed = 35, pause = 2200 }) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const tokens = useMemo(() => parseCode(code), [code]);

  useEffect(() => {
    let timeoutId;
    const totalLength = code.length;

    if (displayedLength < totalLength) {
      timeoutId = setTimeout(() => {
        setDisplayedLength((prev) => {
          const nextChar = code[prev];
          const delay = nextChar === '\n' ? speed * 8 : speed;
          return prev + 1;
        });
      }, speed);
    }
    // Once content is fully displayed, stop (no reset)

    return () => clearTimeout(timeoutId);
  }, [displayedLength, code, speed]);

  // Render tokens with syntax highlighting up to displayedLength
  let currentPos = 0;
  const renderedTokens = tokens.map((token, idx) => {
    const tokenStart = currentPos;
    const tokenEnd = currentPos + token.text.length;
    currentPos = tokenEnd;

    if (tokenEnd <= displayedLength) {
      // Fully displayed
      return (
        <span key={idx} className={`code-${token.type}`}>
          {token.text}
        </span>
      );
    } else if (tokenStart < displayedLength) {
      // Partially displayed
      const visiblePart = token.text.substring(0, displayedLength - tokenStart);
      return (
        <span key={idx} className={`code-${token.type}`}>
          {visiblePart}
        </span>
      );
    } else {
      // Not displayed yet
      return null;
    }
  });

  return <span style={{ display: 'block', textAlign: 'left' }}>{renderedTokens}</span>;
};

const Hero = () => {
  const codeSnippet = useMemo(
    () => 
`class AtharvaBanasure

  def initialize
    @title = "Product Engineer @ Sell.do"
    @current_mission = "Building smooth, human-centered
      integrations for the real world"
    @superpowers = ["clean code", "architecture thinking",
      "speed under pressure"]
    @now_playing = explore_side_projects("LLMs, chat automation
      & developer tools")
  end

  private

  def explore_side_projects(topics)
    "Currently exploring #{topics}"
  end
end`,
    []
  );

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Hi, I&apos;m <span className="highlighted-name">Atharva Banasure</span>
          </h1>
          <p className="hero-subtitle">
            I&apos;m a Software Developer who loves building scalable, efficient systems.
          </p>
          <div className="hero-avatar-wrapper">
            <div className="avatar-container">
              <div className="avatar-frame">
                <img
                  src="/avatar.jpg"
                  alt="Atharva Banasure"
                  className="avatar-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="avatar-glow" />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="code-card">
            <div className="code-card-header">
              <span className="code-dot dot-red" />
              <span className="code-dot dot-yellow" />
              <span className="code-dot dot-green" />
              <span className="code-filename">atharvabanasure.rb</span>
            </div>
            <pre className="code-block">
              <code><Typewriter code={codeSnippet} /></code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;