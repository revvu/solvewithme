import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { llmService } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // 1. Solve the problem using LLM
    const llmResult = await llmService.solveProblem(imageUrl);
    if (!llmResult.success || !llmResult.data) {
      return NextResponse.json({ error: 'Failed to process problem with LLM' }, { status: 500 });
    }

    // 2. Create ProblemNode in database
    const problemNode = await prisma.problemNode.create({
      data: {
        content: { image_url: imageUrl },
        hiddenSolution: llmResult.data.solution,
        hiddenAnswer: llmResult.data.answer,
        generatedBy: 'user_upload',
        status: 'active',
      },
    });

    return NextResponse.json({ problemId: problemNode.id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
