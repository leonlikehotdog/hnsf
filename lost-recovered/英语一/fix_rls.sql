-- 禁用 RLS 以允许匿名访问数据
ALTER TABLE words DISABLE ROW LEVEL SECURITY;
ALTER TABLE long_sentences DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress DISABLE ROW LEVEL SECURITY;

-- 额外确保如果有策略也不会干扰
DROP POLICY IF EXISTS "Allow public read" ON words;
DROP POLICY IF EXISTS "Allow public read" ON long_sentences;
DROP POLICY IF EXISTS "Allow public read" ON study_progress;

-- 也可以选择开启并添加策略（更安全，但目前先禁用以快速解决问题）
-- ALTER TABLE words ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read" ON words FOR SELECT TO anon USING (true);
