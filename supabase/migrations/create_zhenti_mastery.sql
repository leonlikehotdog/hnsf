-- 考研数学一 · 真题掌握程度表
-- question_id: "2025-01" 格式的题目唯一标识
-- level: new / learning / familiar / mastered / expert
CREATE TABLE IF NOT EXISTS zhenti_mastery (
  question_id TEXT NOT NULL PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('new', 'learning', 'familiar', 'mastered', 'expert')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE zhenti_mastery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read"   ON zhenti_mastery;
DROP POLICY IF EXISTS "anon_insert" ON zhenti_mastery;
DROP POLICY IF EXISTS "anon_update" ON zhenti_mastery;
DROP POLICY IF EXISTS "anon_delete" ON zhenti_mastery;

CREATE POLICY "anon_read"   ON zhenti_mastery FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON zhenti_mastery FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON zhenti_mastery FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete" ON zhenti_mastery FOR DELETE TO anon USING (true);
