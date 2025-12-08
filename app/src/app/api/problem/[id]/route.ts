import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid Problem ID format' }, { status: 400 });
    }

    const problem = await prisma.problemNode.findUnique({
      where: { id },
      include: {
        parent: true
      }
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Extract content fields with proper typing
    const content = problem.content as {
      text?: string;
      category?: string;
      title?: string;
      image_url?: string;
    };

    return NextResponse.json({
      id: problem.id,
      text: content.text || '',
      category: content.category || 'General',
      title: content.title || 'Problem',
      imageUrl: content.image_url || null,
      status: problem.status,
      parentId: problem.parentId,
      isSubproblem: problem.generatedBy === 'llm_subproblem',
      targetInsight: problem.targetInsight,
      parent: problem.parent ? {
        id: problem.parent.id,
        content: problem.parent.content,
      } : null,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
