import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

// Configure the model via environment variable (default to gpt-4o)
// Update to 'gpt-5.1' or similar when available
function getModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o';
}

export interface LLMResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const llmService = {
  /**
   * Extract problem text from an image using vision capabilities
   */
  async extractProblemText(imageUrl: string): Promise<LLMResponse> {
    try {
      const response = await getOpenAI().chat.completions.create({
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: `You are an expert at reading and transcribing math and science problems from images.

Your task is to:
1. Carefully read the problem from the image
2. Transcribe it accurately, preserving all mathematical notation
3. Use LaTeX notation for all math expressions (e.g., $x^2$, $\\frac{a}{b}$, $\\int$)
4. Identify the subject/category of the problem

Respond in JSON format:
{
  "problem_text": "The full problem statement with LaTeX math notation. Use <br /> for line breaks if the problem has multiple parts or lines.",
  "category": "The subject category (e.g., 'Number Theory', 'Calculus', 'Algebra', 'Geometry', 'Physics', etc.)",
  "title": "A short descriptive title for the problem (e.g., 'Divisibility Problem', 'Integration by Parts')"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              },
              {
                type: 'text',
                text: 'Please read and transcribe this problem exactly as shown. Use LaTeX for all mathematical expressions.'
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2048,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: 'No response from LLM' };
      }

      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (error) {
      console.error('[LLM] extractProblemText error:', error);
      return { success: false, error: String(error) };
    }
  },

  /**
   * Solve a problem given its text (and optionally image)
   */
  async solveProblem(problemText: string, imageUrl?: string): Promise<LLMResponse> {
    try {
      const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [];

      // Add image if provided
      if (imageUrl) {
        userContent.push({
          type: 'image_url',
          image_url: { url: imageUrl }
        });
      }

      // Add text prompt
      userContent.push({
        type: 'text',
        text: `Please solve this problem completely. Show all steps.\n\nProblem:\n${problemText}`
      });

      const response = await getOpenAI().chat.completions.create({
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: `You are an expert math and science tutor. When given a problem, you must:
1. Carefully read and understand the problem
2. Solve it step by step
3. Provide the final answer

Respond in JSON format:
{
  "solution": "detailed step-by-step solution with LaTeX math notation where appropriate",
  "answer": "the final answer (concise)"
}`
          },
          {
            role: 'user',
            content: userContent
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: 'No response from LLM' };
      }

      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (error) {
      console.error('[LLM] solveProblem error:', error);
      return { success: false, error: String(error) };
    }
  },

  /**
   * Combined: Extract text from image and solve the problem
   */
  async processImageProblem(imageUrl: string): Promise<LLMResponse> {
    try {
      // Step 1: Extract the problem text
      const extractResult = await this.extractProblemText(imageUrl);
      if (!extractResult.success || !extractResult.data) {
        return { success: false, error: 'Failed to extract problem text from image' };
      }

      const { problem_text, category, title } = extractResult.data;

      // Step 2: Solve the problem
      const solveResult = await this.solveProblem(problem_text, imageUrl);
      if (!solveResult.success || !solveResult.data) {
        return { success: false, error: 'Failed to solve the problem' };
      }

      // Combine results
      return {
        success: true,
        data: {
          problem_text,
          category,
          title,
          solution: solveResult.data.solution,
          answer: solveResult.data.answer,
        }
      };
    } catch (error) {
      console.error('[LLM] processImageProblem error:', error);
      return { success: false, error: String(error) };
    }
  },

  async generateSubproblem(
    problemContent: { text?: string; image_url?: string },
    hiddenSolution: string,
    userWork: { images?: string[]; text?: string }
  ): Promise<LLMResponse> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a Socratic tutor helping a student who is stuck on a problem. Your goal is to identify what concept or insight the student is missing and create a simpler subproblem that will help them discover this insight on their own.

You have access to:
1. The original problem
2. The hidden solution (the student cannot see this)
3. The student's work so far

Analyze what the student understands and what they're missing. Then create a targeted subproblem.

Respond in JSON format:
{
  "student_summary": "Brief description of what the student seems to understand",
  "missing_insight": "The key concept or step the student is missing",
  "subproblem_text": "A simpler problem that will help them discover the missing insight. Use LaTeX for math.",
  "tutor_message_intro": "An encouraging message acknowledging their effort (1-2 sentences)",
  "tutor_message_subproblem": "A message introducing the subproblem and why it will help (1-2 sentences)",
  "hidden_subproblem_solution": "The solution to the subproblem (hidden from student)"
}`
        },
        {
          role: 'user',
          content: buildProblemContext(problemContent, hiddenSolution, userWork)
        }
      ];

      const response = await getOpenAI().chat.completions.create({
        model: getModel(),
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 2048,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: 'No response from LLM' };
      }

      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (error) {
      console.error('[LLM] generateSubproblem error:', error);
      return { success: false, error: String(error) };
    }
  },

  async checkThinking(
    problemContent: { text?: string; image_url?: string },
    userWork: { images?: string[]; text?: string }
  ): Promise<LLMResponse> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a supportive math tutor. Review the student's work and provide helpful feedback.

Be encouraging but honest. If they're on the right track, tell them. If there's an error, gently point them toward it without giving away the answer.

Respond in JSON format:
{
  "feedback": "Your feedback to the student (2-4 sentences). Use LaTeX for any math notation."
}`
        },
        {
          role: 'user',
          content: buildCheckContext(problemContent, userWork)
        }
      ];

      const response = await getOpenAI().chat.completions.create({
        model: getModel(),
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 1024,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: 'No response from LLM' };
      }

      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (error) {
      console.error('[LLM] checkThinking error:', error);
      return { success: false, error: String(error) };
    }
  },

  async verifySubproblem(
    originalProblem: { text?: string; image_url?: string } | null,
    subproblem: { text?: string; image_url?: string },
    userAttempt: { images?: string[]; text?: string }
  ): Promise<LLMResponse> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are verifying if a student has correctly solved a subproblem.

Review their work and determine if they've grasped the concept. If they have, provide an encouraging message that helps them connect this insight back to the original problem.

Respond in JSON format:
{
  "solved": true/false,
  "tutor_message": "Feedback for the student. If solved, help them see how this applies to the original problem. If not solved, provide a gentle hint."
}`
        },
        {
          role: 'user',
          content: buildVerifyContext(originalProblem, subproblem, userAttempt)
        }
      ];

      const response = await getOpenAI().chat.completions.create({
        model: getModel(),
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 1024,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: 'No response from LLM' };
      }

      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (error) {
      console.error('[LLM] verifySubproblem error:', error);
      return { success: false, error: String(error) };
    }
  },
};

function buildProblemContext(
  problemContent: { text?: string; image_url?: string },
  hiddenSolution: string,
  userWork: { images?: string[]; text?: string }
): string {
  let context = '## Original Problem\n';
  if (problemContent.text) {
    context += problemContent.text + '\n';
  }
  if (problemContent.image_url) {
    context += `[Problem Image: ${problemContent.image_url}]\n`;
  }

  context += '\n## Hidden Solution (student cannot see this)\n';
  context += hiddenSolution + '\n';

  context += '\n## Student\'s Work So Far\n';
  if (userWork.text) {
    context += userWork.text + '\n';
  }
  if (userWork.images && userWork.images.length > 0) {
    context += `[Student has submitted ${userWork.images.length} image(s) of their work]\n`;
  }
  if (!userWork.text && (!userWork.images || userWork.images.length === 0)) {
    context += 'No work submitted yet - student is stuck at the beginning.\n';
  }

  return context;
}

function buildCheckContext(
  problemContent: { text?: string; image_url?: string },
  userWork: { images?: string[]; text?: string }
): string {
  let context = '## Problem\n';
  if (problemContent.text) {
    context += problemContent.text + '\n';
  }
  if (problemContent.image_url) {
    context += `[Problem Image: ${problemContent.image_url}]\n`;
  }

  context += '\n## Student\'s Work\n';
  if (userWork.text) {
    context += userWork.text + '\n';
  }
  if (userWork.images && userWork.images.length > 0) {
    context += `[Student has submitted ${userWork.images.length} image(s) of their work]\n`;
  }

  return context;
}

function buildVerifyContext(
  originalProblem: { text?: string; image_url?: string } | null,
  subproblem: { text?: string; image_url?: string },
  userAttempt: { images?: string[]; text?: string }
): string {
  let context = '';

  if (originalProblem) {
    context += '## Original Problem\n';
    if (originalProblem.text) {
      context += originalProblem.text + '\n';
    }
    if (originalProblem.image_url) {
      context += `[Problem Image: ${originalProblem.image_url}]\n`;
    }
    context += '\n';
  }

  context += '## Subproblem\n';
  if (subproblem.text) {
    context += subproblem.text + '\n';
  }
  if (subproblem.image_url) {
    context += `[Subproblem Image: ${subproblem.image_url}]\n`;
  }

  context += '\n## Student\'s Attempt\n';
  if (userAttempt.text) {
    context += userAttempt.text + '\n';
  }
  if (userAttempt.images && userAttempt.images.length > 0) {
    context += `[Student has submitted ${userAttempt.images.length} image(s) of their work]\n`;
  }

  return context;
}
