import axios from 'axios';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-7828c2cbf4964bdf89ef3e46e8c21429';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-v4-pro';

const deepseekClient = axios.create({
  baseURL: DEEPSEEK_BASE_URL,
  headers: {
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function analyzeBillWithDeepSeek(billContent: string): Promise<string> {
  try {
    const systemPrompt = `You are an expert financial analyst specializing in bill analysis and cost optimization. 
Your task is to analyze bill documents and provide a comprehensive HTML report with the following sections:

1. Personal Spending Behavior Optimization & Suggestions
2. Immediate Actions Required (cancel subscriptions, call confirmations, complaint letters)
3. Bill Issues & Problems (errors, duplicate charges, unauthorized items)
4. Monthly Savings After Optimization (increased income)

Generate the report in clean, professional HTML format with proper styling. Use semantic HTML tags.
Focus on actionable insights and specific dollar amounts where possible.
Be direct and specific - avoid generic advice.`;

    const userPrompt = `Please analyze the following bill content and provide a detailed analysis report in HTML format:

${billContent}

Generate a comprehensive HTML report with the four sections mentioned. Make sure the HTML is self-contained and can be displayed in a browser.`;

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    const response = await deepseekClient.post<DeepSeekResponse>('/chat/completions', {
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    });

    const report = response.data.choices[0]?.message?.content;

    if (!report) {
      throw new Error('No response from DeepSeek API');
    }

    // Ensure the report is valid HTML
    return wrapHtmlReport(report);
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw new Error('Failed to analyze bill with DeepSeek');
  }
}

function wrapHtmlReport(content: string): string {
  // Check if content is already wrapped in HTML tags
  if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
    return content;
  }

  // If content is just HTML fragments, wrap it properly
  if (content.includes('<h1') || content.includes('<h2') || content.includes('<section')) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bill Analysis Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #0a0e27 0%, #1a0a2e 100%);
      color: #e0e0e0;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(26, 26, 46, 0.95);
      border: 2px solid #ff006e;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 0 30px rgba(255, 0, 110, 0.3);
    }
    h1 {
      color: #ff006e;
      text-shadow: 0 0 10px rgba(255, 0, 110, 0.5);
      margin-bottom: 30px;
      border-bottom: 2px solid #00f5ff;
      padding-bottom: 15px;
    }
    h2 {
      color: #00f5ff;
      text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
      margin-top: 30px;
      margin-bottom: 15px;
    }
    h3 {
      color: #b300ff;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 15px;
      line-height: 1.8;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    li {
      margin-bottom: 8px;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      border-left: 4px solid #00f5ff;
      background: rgba(0, 245, 255, 0.05);
      border-radius: 4px;
    }
    .highlight {
      background: rgba(255, 0, 110, 0.1);
      padding: 2px 6px;
      border-radius: 3px;
      color: #ff006e;
    }
    .savings {
      background: rgba(0, 200, 100, 0.1);
      border: 2px solid #00c864;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      color: #00ff88;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #00f5ff;
      padding: 12px;
      text-align: left;
    }
    th {
      background: rgba(0, 245, 255, 0.1);
      color: #00f5ff;
      font-weight: bold;
    }
    strong {
      color: #ff006e;
    }
    code {
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #00ff88;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;
  }

  // Fallback: wrap plain text in basic HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bill Analysis Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #e0e0e0;
      background: linear-gradient(135deg, #0a0e27 0%, #1a0a2e 100%);
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(26, 26, 46, 0.95);
      border: 2px solid #ff006e;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 0 30px rgba(255, 0, 110, 0.3);
    }
    h1 {
      color: #ff006e;
      text-shadow: 0 0 10px rgba(255, 0, 110, 0.5);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bill Analysis Report</h1>
    <pre>${escapeHtml(content)}</pre>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function extractTextFromBase64(base64: string, fileName: string): Promise<string> {
  // For now, return a placeholder that indicates the file was received
  // In production, you would use a library like pdf-parse, xlsx, or sharp to extract text
  const fileExtension = fileName.split('.').pop()?.toLowerCase();

  if (fileExtension === 'pdf') {
    return `[PDF Document: ${fileName}]\nContent extraction requires server-side PDF parsing library.`;
  } else if (['xls', 'xlsx', 'csv'].includes(fileExtension || '')) {
    return `[Excel/CSV Document: ${fileName}]\nContent extraction requires server-side spreadsheet parsing library.`;
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension || '')) {
    return `[Image: ${fileName}]\nContent extraction requires OCR processing.`;
  }

  return `[File: ${fileName}]\nUnsupported file type for text extraction.`;
}
