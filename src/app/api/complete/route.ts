import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { llmService } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { subproblemId, userWorkImages, userText } = await req.json();

    if (!subproblemId) {
      return NextResponse.json({ error: 'Subproblem ID is required' }, { status: 400 });
    }

    // 1. Fetch subproblem with parent
    const subproblem = await prisma.problemNode.findUnique({
      where: { id: subproblemId },
      include: { parent: true },
    });

    if (!subproblem) {
      return NextResponse.json({ error: 'Subproblem not found' }, { status: 404 });
    }

    // 2. Verify attempt
    const llmResult = await llmService.verifySubproblem(
      subproblem.parent?.content,
      subproblem.content,
      { images: userWorkImages, text: userText }
    );

    if (!llmResult.success || !llmResult.data) {
      return NextResponse.json({ error: 'Failed to verify attempt' }, { status: 500 });
    }

    // 3. Update status if solved
    if (llmResult.data.solved) {
      await prisma.problemNode.update({
        where: { id: subproblemId },
        data: { status: 'solved' },
      });
    }

    // 4. Store attempt
    await prisma.attempt.create({
      data: {
        problemNodeId: subproblemId,
        userWork: { image_urls: userWorkImages || [] },
        userText: userText,
      },
    });

    return NextResponse.json(llmResult.data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
