import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);

    // Fetch recent user-uploaded problems with their latest attempt
    const problems = await prisma.problemNode.findMany({
      where: {
        generatedBy: 'user_upload',
      },
      include: {
        attempts: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 10), // Cap at 10 max
    });

    // Transform data for the frontend
    const recentProblems = problems.map((problem) => {
      const content = problem.content as {
        text?: string;
        category?: string;
        title?: string;
        image_url?: string;
      };

      // Determine last active time: latest attempt or createdAt
      const lastAttempt = problem.attempts[0];
      const lastActiveAt = lastAttempt?.timestamp || problem.createdAt;

      return {
        id: problem.id,
        title: content.title || 'Untitled Problem',
        category: content.category || 'General',
        status: problem.status,
        lastActiveAt: lastActiveAt.toISOString(),
        createdAt: problem.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ problems: recentProblems });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
