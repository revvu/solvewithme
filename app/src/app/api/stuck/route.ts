import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { llmService } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { problemId, userWorkImages, userText } = await req.json();

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    // 1. Fetch original problem
    const problemNode = await prisma.problemNode.findUnique({
      where: { id: problemId },
    });

    if (!problemNode) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // 2. Call LLM to generate subproblem
    const llmResult = await llmService.generateSubproblem(
      problemNode.content as any,
      problemNode.hiddenSolution,
      { images: userWorkImages, text: userText }
    );

    if (!llmResult.success || !llmResult.data) {
      return NextResponse.json({ error: 'Failed to generate subproblem' }, { status: 500 });
    }

    // 3. Create Subproblem Node
    const subproblemNode = await prisma.problemNode.create({
      data: {
        parentId: problemId,
        content: { text: llmResult.data.subproblem_text },
        hiddenSolution: llmResult.data.hidden_subproblem_solution,
        hiddenAnswer: '',
        targetInsight: llmResult.data.missing_insight,
        generatedBy: 'llm_subproblem',
        status: 'active',
      },
    });

    // 4. Record Attempt
    await prisma.attempt.create({
      data: {
        problemNodeId: problemId,
        userWork: { image_urls: userWorkImages || [] },
        userText: userText,
      },
    });

    return NextResponse.json({
      subproblemId: subproblemNode.id,
      ...llmResult.data,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
