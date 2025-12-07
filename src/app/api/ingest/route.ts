import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    // 2. Create ProblemNode in Supabase
    const { data: problemNode, error: dbError } = await supabase
      .from('problem_nodes')
      .insert({
        content: { image_url: imageUrl },
        hidden_solution: llmResult.data.solution,
        hidden_answer: llmResult.data.answer,
        generated_by: 'user_upload',
        status: 'active',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      return NextResponse.json({ error: 'Failed to save problem node' }, { status: 500 });
    }

    return NextResponse.json({ problemId: problemNode.id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
