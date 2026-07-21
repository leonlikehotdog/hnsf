-- 考研数学一 · 题目掌握记录表
-- 用于追踪每道题的掌握程度，支持多次记录、日期排序、删除
CREATE TABLE IF NOT EXISTS problem_mastery (
  id SERIAL PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  problem_index INTEGER NOT NULL,
  mastery_level INTEGER NOT NULL CHECK (mastery_level BETWEEN 0 AND 100),
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problem_mastery_lookup
  ON problem_mastery(chapter_id, problem_index, record_date DESC);

ALTER TABLE problem_mastery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read"   ON problem_mastery;
DROP POLICY IF EXISTS "anon_insert" ON problem_mastery;
DROP POLICY IF EXISTS "anon_delete" ON problem_mastery;
DROP POLICY IF EXISTS "anon_update" ON problem_mastery;

CREATE POLICY "anon_read"   ON problem_mastery FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON problem_mastery FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete" ON problem_mastery FOR DELETE TO anon USING (true);
CREATE POLICY "anon_update" ON problem_mastery FOR UPDATE TO anon USING (true);

-- 考研数学一 · 题目笔记表（每道题一条记录，直接覆盖）
CREATE TABLE IF NOT EXISTS problem_notes (
  chapter_id TEXT NOT NULL,
  problem_index INTEGER NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chapter_id, problem_index)
);

ALTER TABLE problem_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read"   ON problem_notes;
DROP POLICY IF EXISTS "anon_insert" ON problem_notes;
DROP POLICY IF EXISTS "anon_update" ON problem_notes;
DROP POLICY IF EXISTS "anon_delete" ON problem_notes;

CREATE POLICY "anon_read"   ON problem_notes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON problem_notes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON problem_notes FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete" ON problem_notes FOR DELETE TO anon USING (true);
