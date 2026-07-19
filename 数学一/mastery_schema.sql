-- 考研数学一 · 题目掌握记录表
-- 用于追踪每道题的掌握程度，支持多次记录、日期排序、删除

CREATE TABLE IF NOT EXISTS problem_mastery (
  id SERIAL PRIMARY KEY,
  chapter_id TEXT NOT NULL,           -- 如 'ch01', 'ch02'
  problem_index INTEGER NOT NULL,     -- 题号在数组中的索引（0-based）
  mastery_level INTEGER NOT NULL CHECK (mastery_level BETWEEN 0 AND 100),  -- 0-100
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- 用户选的日期（默认今天）
  note TEXT,                          -- 可选备注
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 加速按 chapter + problem 查最新记录的查询
CREATE INDEX IF NOT EXISTS idx_problem_mastery_lookup
  ON problem_mastery(chapter_id, problem_index, record_date DESC);

-- ===== 启用 RLS（行级安全）=====
ALTER TABLE problem_mastery ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读写（个人学习项目，无需鉴权）
DROP POLICY IF EXISTS "anon_read"   ON problem_mastery;
DROP POLICY IF EXISTS "anon_insert" ON problem_mastery;
DROP POLICY IF EXISTS "anon_delete" ON problem_mastery;
DROP POLICY IF EXISTS "anon_update" ON problem_mastery;

CREATE POLICY "anon_read"   ON problem_mastery FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON problem_mastery FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete" ON problem_mastery FOR DELETE TO anon USING (true);
CREATE POLICY "anon_update" ON problem_mastery FOR UPDATE TO anon USING (true);

-- ===== 测试数据（可选，用于验证）=====
-- INSERT INTO problem_mastery (chapter_id, problem_index, mastery_level, record_date, note) VALUES
--   ('ch01', 0, 60, '2026-07-15', '第一次做对了提示 1-3'),
--   ('ch01', 0, 80, '2026-07-18', '二刷掌握更扎实');

-- 查所有记录（验证用）
-- SELECT * FROM problem_mastery ORDER BY record_date DESC;
