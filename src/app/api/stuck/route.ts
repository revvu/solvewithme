import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { llmService } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { problemId, userWorkImages, userText } = await req.json();

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    // 1. Fetch original problem
    const { data: problemNode, error: fetchError } = await supabase
      .from('problem_nodes')
      .select('*')
      .eq('id', problemId)
      .single();

    if (fetchError || !problemNode) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // 2. Call LLM to generate subproblem
    const llmResult = await llmService.generateSubproblem(
      problemNode.content,
      problemNode.hidden_solution,
      { images: userWorkImages, text: userText }
    );

    if (!llmResult.success || !llmResult.data) {
      return NextResponse.json({ error: 'Failed to generate subproblem' }, { status: 500 });
    }

    // 3. Create Subproblem Node
    const { data: subproblemNode, error: createError } = await supabase
      .from('problem_nodes')
      .insert({
        parent_id: problemId,
        content: { text: llmResult.data.subproblem_text },
        hidden_solution: llmResult.data.hidden_subproblem_solution, // In real app, LLM provides this
        hidden_answer: '', // Optional depending on LLM output
        target_insight: llmResult.data.missing_insight,
        generated_by: 'llm_subproblem',
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('Supabase create error:', createError);
      return NextResponse.json({ error: 'Failed to save subproblem' }, { status: 500 });
    }

    // 4. Record Attempt
    await supabase.from('attempts').insert({
      problem_node_id: problemId,
      user_work: { image_urls: userWorkImages || [] },
      user_text: userText,
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
