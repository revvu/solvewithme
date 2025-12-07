import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { llmService } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, text } = await req.json();

    // Support both image upload and direct text input
    if (!imageUrl && !text) {
      return NextResponse.json({ error: 'Either image URL or problem text is required' }, { status: 400 });
    }

    let problemText: string;
    let category: string;
    let title: string;
    let solution: string;
    let answer: string;

    if (imageUrl) {
      // Process image: extract text and solve
      const llmResult = await llmService.processImageProblem(imageUrl);
      if (!llmResult.success || !llmResult.data) {
        return NextResponse.json({ error: 'Failed to process problem image' }, { status: 500 });
      }

      problemText = llmResult.data.problem_text;
      category = llmResult.data.category;
      title = llmResult.data.title;
      solution = llmResult.data.solution;
      answer = llmResult.data.answer;
    } else {
      // Direct text input - just solve it
      const solveResult = await llmService.solveProblem(text);
      if (!solveResult.success || !solveResult.data) {
        return NextResponse.json({ error: 'Failed to solve the problem' }, { status: 500 });
      }

      problemText = text;
      category = 'General'; // Default category for text input
      title = 'Problem';
      solution = solveResult.data.solution;
      answer = solveResult.data.answer;
    }

    // Create ProblemNode in database with extracted text
    const problemNode = await prisma.problemNode.create({
      data: {
        content: {
          text: problemText,
          category,
          title,
          image_url: imageUrl || null,
        },
        hiddenSolution: solution,
        hiddenAnswer: answer,
        generatedBy: 'user_upload',
        status: 'active',
      },
    });

    return NextResponse.json({
      problemId: problemNode.id,
      problemText,
      category,
      title,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
