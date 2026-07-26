-- 考研英语一 · 单词表
CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  phonetic TEXT,
  meaning TEXT NOT NULL,
  example_sentence TEXT,
  example_translation TEXT,
  part_of_speech TEXT,
  difficulty INTEGER DEFAULT 3,
  source TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 考研英语一 · 长难句表
CREATE TABLE IF NOT EXISTS long_sentences (
  id SERIAL PRIMARY KEY,
  english TEXT NOT NULL,
  chinese TEXT NOT NULL,
  analysis TEXT,
  grammar_points TEXT,
  key_vocabulary TEXT[],
  source TEXT,
  difficulty INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学习进度表
CREATE TABLE IF NOT EXISTS study_progress (
  id SERIAL PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('word', 'sentence')),
  item_id INTEGER NOT NULL,
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_type, item_id)
);

-- 插入核心高频单词（前30个）
INSERT INTO words (word, phonetic, meaning, example_sentence, example_translation, part_of_speech, difficulty, category) VALUES
('significant', '/sɪɡˈnɪfɪkənt/', '重要的，有意义的', 'This is a significant breakthrough in medical research.', '这是医学研究中的一个重大突破。', 'adj.', 3, '高频核心'),
('approach', '/əˈproʊtʃ/', '方法，接近', 'We need a new approach to solve this problem.', '我们需要一种新方法来解决这个问题。', 'n./v.', 3, '高频核心'),
('phenomenon', '/fəˈnɑːmɪnən/', '现象', 'This phenomenon is widely observed in nature.', '这种现象在自然界中被广泛观察到。', 'n.', 4, '高频核心'),
('economic', '/ˌiːkəˈnɑːmɪk/', '经济的', 'The country is facing economic challenges.', '这个国家正面临经济挑战。', 'adj.', 3, '高频核心'),
('environmental', '/ɪnˌvaɪrənˈmentl/', '环境的', 'Environmental protection is crucial for our future.', '环境保护对我们的未来至关重要。', 'adj.', 3, '高频核心'),
('available', '/əˈveɪləbl/', '可用的，有效的', 'The data is available for further analysis.', '这些数据可用于进一步分析。', 'adj.', 3, '高频核心'),
('individual', '/ˌɪndɪˈvɪdʒuəl/', '个人的，个体', 'Each individual has the right to express their opinion.', '每个人都有表达自己观点的权利。', 'adj./n.', 3, '高频核心'),
('potential', '/pəˈtenʃl/', '潜力，潜在的', 'The technology has great potential for development.', '这项技术有巨大的发展潜力。', 'n./adj.', 3, '高频核心'),
('identify', '/aɪˈdentɪfaɪ/', '识别，确认', 'Researchers identified the cause of the disease.', '研究人员确定了这种疾病的原因。', 'v.', 3, '高频核心'),
('contribute', '/kənˈtrɪbjuːt/', '贡献，导致', 'Several factors contributed to the economic growth.', '几个因素共同促进了经济增长。', 'v.', 3, '高频核心'),
('analyze', '/ˈænəlaɪz/', '分析', 'We need to analyze the data carefully.', '我们需要仔细分析这些数据。', 'v.', 3, '高频核心'),
('benefit', '/ˈbenɪfɪt/', '好处，受益', 'Regular exercise benefits both physical and mental health.', '定期锻炼对身心健康都有好处。', 'n./v.', 3, '高频核心'),
('establish', '/ɪˈstæblɪʃ/', '建立，确立', 'The company was established in 1990.', '这家公司成立于1990年。', 'v.', 3, '高频核心'),
('maintain', '/meɪnˈteɪn/', '维持，保持', 'It is important to maintain a healthy lifestyle.', '保持健康的生活方式很重要。', 'v.', 3, '高频核心'),
('consequence', '/ˈkɑːnsɪkwens/', '后果，结果', 'The consequences of climate change are severe.', '气候变化的后果是严重的。', 'n.', 4, '高频核心'),
('evidence', '/ˈevɪdəns/', '证据', 'There is strong evidence supporting this theory.', '有强有力的证据支持这一理论。', 'n.', 3, '高频核心'),
('implement', '/ˈɪmplɪment/', '实施，执行', 'The government plans to implement new policies.', '政府计划实施新政策。', 'v.', 4, '高频核心'),
('interpret', '/ɪnˈtɜːrprɪt/', '解释，解读', 'How do you interpret these results?', '你如何解读这些结果？', 'v.', 4, '高频核心'),
('demonstrate', '/ˈdemənstreɪt/', '证明，展示', 'The experiment demonstrates the principle effectively.', '这个实验有效地证明了这一原理。', 'v.', 4, '高频核心'),
('resource', '/ˈriːsɔːrs/', '资源', 'Natural resources should be used wisely.', '自然资源应当被明智地利用。', 'n.', 3, '高频核心'),
('strategy', '/ˈstrætədʒi/', '策略', 'We need a clear strategy for development.', '我们需要一个清晰的发展策略。', 'n.', 3, '高频核心'),
('involve', '/ɪnˈvɑːlv/', '涉及，包含', 'The project involves multiple departments.', '这个项目涉及多个部门。', 'v.', 3, '高频核心'),
('access', '/ˈækses/', '访问，通道', 'Students have access to the online library.', '学生可以访问在线图书馆。', 'n./v.', 3, '高频核心'),
('generate', '/ˈdʒenəreɪt/', '产生', 'The new system generates a lot of data.', '新系统产生了大量数据。', 'v.', 3, '高频核心'),
('perspective', '/pərˈspektɪv/', '视角，观点', 'We should look at this from a different perspective.', '我们应该从不同的角度来看待这个问题。', 'n.', 4, '高频核心'),
('transfer', '/trænsˈfɜːr/', '转移，传输', 'The data transfer was completed successfully.', '数据传输已成功完成。', 'v./n.', 3, '高频核心'),
('achieve', '/əˈtʃiːv/', '实现，达到', 'She achieved her goal of becoming a doctor.', '她实现了成为医生的目标。', 'v.', 3, '高频核心'),
('interact', '/ˌɪntərˈækt/', '互动，相互作用', 'The two systems interact with each other.', '这两个系统相互影响。', 'v.', 4, '高频核心'),
('mechanism', '/ˈmekənɪzəm/', '机制，原理', 'The mechanism of this process is complex.', '这个过程的作用机制很复杂。', 'n.', 4, '高频核心'),
('innovation', '/ˌɪnəˈveɪʃn/', '创新', 'Technological innovation drives economic growth.', '技术创新驱动经济增长。', 'n.', 3, '高频核心');

-- 插入经典长难句
INSERT INTO long_sentences (english, chinese, analysis, grammar_points, key_vocabulary, source, difficulty) VALUES
(
  'That the sea''s solid surface is so near yet so far is a challenge that has preoccupied scholars and explorers since ancient times.',
  '海的固体表面如此之近却又如此之远，这一挑战自古以来就一直困扰着学者和探险家。',
  '主语从句：That the sea''s solid surface is so near yet so far 是整个句子的主语；表语：is a challenge；定语从句：that has preoccupied scholars and explorers since ancient times 修饰 challenge。',
  '主语从句、定语从句、固定搭配',
  ARRAY['preoccupy: 使全神贯注', 'solid: 固体', 'surface: 表面'],
  '考研英语一·2023年·阅读',
  4
),
(
  'The idea that the life of the rich and famous is always a glamorous one is a myth that is reinforced by the media.',
  '认为富人名人的生活总是光彩照人的想法是一个被媒体强化的迷思。',
  '同位语从句：that the life of the rich and famous is always a glamorous one 解释说明 The idea；定语从句：that is reinforced by the media 修饰 myth。',
  '同位语从句、定语从句、被动语态',
  ARRAY['glamorous: 迷人的', 'reinforce: 加强', 'myth: 迷思/误区'],
  '考研英语一·2022年·阅读',
  4
),
(
  'While the government is committed to reducing carbon emissions, critics argue that the measures taken so far are insufficient to meet the targets set by the Paris Agreement.',
  '虽然政府承诺减少碳排放，但批评者认为，迄今采取的措施不足以达到《巴黎协定》设定的目标。',
  '让步状语从句：While...emissions；主句：critics argue；宾语从句：that the measures...Agreement；后置定语：taken so far 修饰 measures；后置定语：set by the Paris Agreement 修饰 targets。',
  '让步状语从句、宾语从句、后置定语',
  ARRAY['be committed to: 致力于', 'carbon emissions: 碳排放', 'insufficient: 不足的'],
  '考研英语一·2023年·阅读',
  3
),
(
  'The rapid development of artificial intelligence has raised concerns about the potential impact on employment, particularly in sectors that rely heavily on routine tasks.',
  '人工智能的快速发展引发了对就业潜在影响的担忧，尤其是在那些严重依赖日常任务的行业。',
  '主语：The rapid development of artificial intelligence；谓语：has raised；宾语：concerns；定语从句：that rely heavily on routine tasks 修饰 sectors。',
  '定语从句、固定搭配：raise concerns about',
  ARRAY['artificial intelligence: 人工智能', 'raise concerns: 引发担忧', 'rely heavily on: 严重依赖'],
  '考研英语一·2024年·阅读',
  3
),
(
  'The researchers found that even when participants were told that their memory would be tested later, those who wrote down their thoughts performed significantly better than those who did not.',
  '研究人员发现，即使参与者被告知稍后会测试他们的记忆，那些写下想法的人的表现也明显好于没有写下的人。',
  '主句：The researchers found；宾语从句：that even when...did not；让步状语从句：even when...later；定语从句：who wrote down their thoughts 修饰 those；比较结构：better than。',
  '宾语从句、让步状语从句、定语从句、比较结构',
  ARRAY['participant: 参与者', 'perform: 表现', 'significantly: 显著地'],
  '考研英语一·2021年·阅读',
  4
);
