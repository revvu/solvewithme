import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { llmService } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { problemId, userWorkImages, userText } = await req.json();

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    // 1. Fetch problem
    const problemNode = await prisma.problemNode.findUnique({
      where: { id: problemId },
    });

    if (!problemNode) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // 2. Call LLM
    const llmResult = await llmService.checkThinking(
      problemNode.content as any,
      { images: userWorkImages, text: userText }
    );

    if (!llmResult.success) {
      return NextResponse.json({ error: 'Failed to check thinking' }, { status: 500 });
    }

    // 3. Log attempt
    await prisma.attempt.create({
      data: {
        problemNodeId: problemId,
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
