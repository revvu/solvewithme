export interface ProblemNode {
  id: string;
  parent_id: string | null;
  content: {
    text?: string;
    image_url?: string;
  };
  hidden_solution: string;
  hidden_answer?: string;
  target_insight?: string;
  generated_by: 'user_upload' | 'llm_subproblem';
  status: 'active' | 'solved' | 'aborted';
  created_at: string;
}

export interface Attempt {
  id: string;
  problem_node_id: string;
  user_work: {
    image_urls: string[];
  };
  user_text?: string;
  timestamp: string;
}
