import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { llmService } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { subproblemId, userWorkImages, userText } = await req.json();

    if (!subproblemId) {
      return NextResponse.json({ error: 'Subproblem ID is required' }, { status: 400 });
    }

    // 1. Fetch subproblem
    const { data: subproblem, error: subError } = await supabase
      .from('problem_nodes')
      .select('*')
      .eq('id', subproblemId)
      .single();

    if (subError || !subproblem) {
      return NextResponse.json({ error: 'Subproblem not found' }, { status: 404 });
    }

    // 2. Fetch original problem (parent)
    // If this is a deep recursion, we might just need the immediate parent, 
    // but the spec implies bridging back to the "parent problem".
    let originalProblem = null;
    if (subproblem.parent_id) {
      const { data: parent } = await supabase
        .from('problem_nodes')
        .select('*')
        .eq('id', subproblem.parent_id)
        .single();
      originalProblem = parent;
    }

    // 3. Verify attempt
    const llmResult = await llmService.verifySubproblem(
      originalProblem?.content,
      subproblem.content,
      { images: userWorkImages, text: userText }
    );

    if (!llmResult.success || !llmResult.data) {
      return NextResponse.json({ error: 'Failed to verify attempt' }, { status: 500 });
    }

    // 4. Update status if solved
    if (llmResult.data.solved) {
      await supabase
        .from('problem_nodes')
        .update({ status: 'solved' })
        .eq('id', subproblemId);
    }

    // 5. Store attempt
    await supabase.from('attempts').insert({
      problem_node_id: subproblemId,
      user_work: { image_urls: userWorkImages || [] },
      user_text: userText,
    });

    return NextResponse.json(llmResult.data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
