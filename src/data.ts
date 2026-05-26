import { NewsItem, AdItem } from './types';

export const INITIAL_NEWS: NewsItem[] = [
  // AI 大模型 (10 items)
  {
    id: 'ai-1',
    track: 'ai',
    time: '09:15',
    source: '金融联播',
    summary: '微软与 OpenAI 计划投资 1000 亿美元建设“星际之门” (Stargate) 超级计算机，算力规模提升 100 倍。',
    details: '该项目计划于 2028 年前落成，将包含数百万张定制 AI 加速芯片，功耗需求可能突破 5 吉瓦（GW）。这是一笔数倍于目前最先进数据中心的大型算力军备竞赛，将彻底拉开大模型通用人工智能（AGI）时代的算力主权。',
    impact: 'positive',
    symbols: ['MSFT', 'NVDA'],
    keywords: ['星际之门', '超级计算机', '算力基础设施']
  },
  {
    id: 'ai-2',
    track: 'ai',
    time: '10:20',
    source: '科技早报',
    summary: 'Google 推出 Gemini 3.5 旗舰级大模型，推理速度提升 400%，实现毫秒级端侧双向语音与视觉大交互。',
    details: 'Gemini 3.5 采用全新亚线性注意力机制、多物理模态对齐和超低延迟推理引擎，允许在大规模并行上下文下仍保持近乎即时的流式应答。首批测试表明其代码生成和跨逻辑推理能力已超过传统闭源竞品，将在 Pixel 及各级智能硬件中免运流部署。',
    impact: 'positive',
    symbols: ['GOOGL'],
    keywords: ['Gemini 3.5', '端侧模型', '毫秒级响应']
  },
  {
    id: 'ai-3',
    track: 'ai',
    time: '11:45',
    source: '科创板日报',
    summary: 'Anthropic 启动 Claude 4.5 灰度测试，支持超长 100 万 Token 文本分析与实时自主软件工程开发能力。',
    details: 'Claude 4.5 在长文本上下文召回上实现了“无损针”，能直接在单一会话中解析整个项目代码库或数本财报文献。此外其“电脑代理 (Computer Use)”和自主开发组件获得大幅升级，能够执行复杂的网页操作与全栈调试。',
    impact: 'positive',
    symbols: ['AMZN', 'GOOGL'],
    keywords: ['Claude 4.5', '长文本召回', 'AI 代理']
  },
  {
    id: 'ai-4',
    track: 'ai',
    time: '13:10',
    source: '华尔街见闻',
    summary: 'Meta 宣布将完全开源 LLaMA 4 (400B) 旗舰版本，各项性能基准比肩闭源，拉低全球 AGI 商业化门槛。',
    details: '扎克伯格表示，开源是推动 AI 生态走向繁荣的唯一途径。LLaMA 4 引入了端到端多重强化学习对齐（RLAIF），在逻辑推理、复杂数学及科学常识上均与业界最领先的商用模型无异，开源后各行各业的企业可直接本地部署并精调该万亿级参数大模型。',
    impact: 'neutral',
    symbols: ['META'],
    keywords: ['LLaMA 4', '开源模型', 'AGI 商业化']
  },
  {
    id: 'ai-5',
    track: 'ai',
    time: '14:30',
    source: '雷锋网',
    summary: '深度求索 (DeepSeek) 发布 V3-Pro 多模态模型，API 每百万 Token 仅售 0.1 元，引发全行业算力洗牌与价格战。',
    details: 'V3-Pro 采用了改进的 MoE 架构（混合专家模型）和自研的多Token预测（MTP）算法，使得生产算力压缩了 85%。此价格仅为海外竞品的 1/50，使得高额的大模型应用开发成本趋近于零，国内其他大模型厂商已紧急跟进下调价格。',
    impact: 'positive',
    symbols: ['9988.HK', '700.HK'],
    keywords: ['DeepSeek V3-Pro', 'MoE架构', '极致性价比']
  },
  {
    id: 'ai-6',
    track: 'ai',
    time: '15:45',
    source: '36氪',
    summary: '智谱 AI 获得腾讯、美团及国家社保基金等新一轮 30 亿元人民币战略领投，估值突破 200 亿元。',
    details: '本轮融资金额拟投入在自研初代物理感知模型 GLM-5 及高保真多模态空间大模型的研发上。智谱 AI 目前已实现了超千家头部大中型企业私有化部署合作，成为国内领头羊级别的独角兽企业。',
    impact: 'positive',
    symbols: ['700.HK', '3690.HK'],
    keywords: ['智谱 AI', '战略融资', 'GLM']
  },
  {
    id: 'ai-7',
    track: 'ai',
    time: '16:50',
    source: '钛媒体',
    summary: '苹果公司计划在 iOS 19 中全面集成自研 20B 离线端侧模型，升级 Apple Intelligence 深度语义执行力。',
    details: '此 200 亿参数大模型高度适配苹果 M 系列和 A19 Pro 系列端侧 NPU，运行功耗仅为数毫瓦，却能处理涉及个人账户关联、跨应用文件调动的 90% 复杂高维度的多步助理操作。这一离线重度设计将重新夺回苹果对于云服务生态的定价主权。',
    impact: 'positive',
    symbols: ['AAPL'],
    keywords: ['iOS 19', '端侧 NPU', 'Apple Intelligence']
  },
  {
    id: 'ai-8',
    track: 'ai',
    time: '18:15',
    source: 'TechWeb',
    summary: '字节跳动火山引擎发布“豆包大模型 2.0”，日均 Tokens 混合调用量已正式突破 50 亿惊人规模。',
    details: '豆包 2.0 在性能提升 30% 的基础上，服务可用率保障达到了 99.999%。依靠抖音集团海量的电商直播、内容创作、跨文化翻译与搜索等多重落地场景，豆包已成为国内 C 端与 B 端事实上的大模型算力核心消耗级产品。',
    impact: 'neutral',
    symbols: ['字节跳动'],
    keywords: ['豆包 2.0', '火山引擎', '高并发']
  },
  {
    id: 'ai-9',
    track: 'ai',
    time: '20:00',
    source: '极客公园',
    summary: '零一万物发布最新 Yi-Lightning-V2 多模态全能大模型，图像理解与多轮对话性能在标准评测中提升 25%。',
    details: '李开复创办的零一万物本次重大升级大幅减小了图像感知在极限细节上的失真问题，尤其在解读科技图纸、图表与复杂数学符号上效果优异，致力于为中高端投研、法律及工程等方向提供行业特制级大脑支撑。',
    impact: 'neutral',
    symbols: ['零一万物'],
    keywords: ['Yi大模型', '李开复', '图表解读']
  },
  {
    id: 'ai-10',
    track: 'ai',
    time: '21:30',
    source: '界面新闻',
    summary: '月之暗面 (Kimi) 完成 8 亿美元 B 轮融资，阿里领投，将加大在智能长文本搜索与金融研报精解等方向研发。',
    details: 'Kimi 的无损长文本核心场景在文案、法务及投资投研等行业拥有极高的黏度。新一轮巨额资金将用于自研长文本跨模态多模态（声音+视频）的对话模型探索，打造新一代 AGI 搜索。',
    impact: 'positive',
    symbols: ['9988.HK'],
    keywords: ['Kimi', '月之暗面', '文本长上下文']
  },

  // 人形机器人 (10 items)
  {
    id: 'robot-1',
    track: 'robot',
    time: '08:30',
    source: '机器人观察',
    summary: '特斯拉首批 Optimus Gen-3 机器人正式进入德州超级工厂，实现 24 小时汽车组装无人化作业与闭环测试。',
    details: '马斯克日前表示，Optimus Gen-3 的灵巧手关节模组自由度（DOF）提升到 22 个，能完成捡拾极细走线、卡卡槽及电池包插拔等复杂车辆精细工装组配。预计内测结束后，将在 2026 年实现万台级别的大规模超级工厂劳力代替，并计划于 2027 年推向海外零售。',
    impact: 'positive',
    symbols: ['TSLA'],
    keywords: ['Optimus Gen-3', '灵巧手', '工厂流水线']
  },
  {
    id: 'robot-2',
    track: 'robot',
    time: '09:45',
    source: '科创板日报',
    summary: '宇树科技 (Unitree) 推出搭载多模态大模型大脑的 H1-E 人形机器人，售价 9.9 万元人民币，启动全面量产。',
    details: 'H1-E 具有极高稳定的全向平衡及跑跳跳跃能力，能够承受 1500N 极限推力而不倾覆。搭载多模态感知大脑后，它能根据人类口令实时定位物体、完成端茶倒水和库房搬运等中度工作。这是全球首款将价格打入 10 万元以内的商业量产全高度人形双足机器人。',
    impact: 'positive',
    symbols: ['宇树科技'],
    keywords: ['Unitree H1-E', '平民级售价', '商业量产']
  },
  {
    id: 'robot-3',
    track: 'robot',
    time: '11:00',
    source: '中国机械报',
    summary: '傅利叶智能完成新一轮数亿元 C+ 轮融资，其 GR-2 系列人形机器人在多座国内头部车企试水电池包安装。',
    details: 'GR-2 具备出色的触觉、视觉与力觉闭环感知能力。傅利叶本次融资资金将全力押注在关节核心减速机齿轮及微型高能伺服电机的自研及更大吞吐规模的第二工厂建设，保障工业大批量适配稳定性。',
    impact: 'positive',
    symbols: ['傅利叶智能'],
    keywords: ['傅利叶 GR-2', '工业车间', '伺服电机']
  },
  {
    id: 'robot-4',
    track: 'robot',
    time: '12:40',
    source: '36氪',
    summary: '银河通用机器人完成超 1 亿美元 A+ 轮融资，美团战投、启明创投领投，全力加速商业全能移动抓取机器人落地。',
    details: '公司主打具有复杂力学交互、轮足一体、大负载双臂设计的商用人形具身智能机器人。该类型机器人已被部分生鲜超市用于货架整理、分批取货，估值在本轮巨额弹药注入后进入世界具身智能第一阵营。',
    impact: 'positive',
    symbols: ['3690.HK'],
    keywords: ['银河通用', '轮足一体', '具身智能']
  },
  {
    id: 'robot-5',
    track: 'robot',
    time: '14:15',
    source: '雷锋网',
    summary: 'Figure AI 与宝马达成全面深化合作，Figure 02 机器人不仅可完成零件抓取，更可自主诊断装配车间微米级缺陷。',
    details: 'Figure 02 的底层大语言模型能力由 OpenAI 与 Figure 联合调试升级，在实时语言合成及物理因果推导上有突飞猛进。通过集成在躯干的 6 组高清微距相机及边缘端重力感应器，机器人能在装配零件的同时对宝马跑车车间工序进行全实时的微米级质量审计。',
    impact: 'positive',
    symbols: ['BMW.DE', 'MSFT'],
    keywords: ['Figure 02', '质量审计', '工业缺陷检测']
  },
  {
    id: 'robot-6',
    track: 'robot',
    time: '15:30',
    source: '国际机器人快讯',
    summary: '1X Technologies 宣布其家庭主打 NEO 双足软骨骼机器人开启首批北美家庭内测，主打老年日常及贴身看护。',
    details: '1X 的背后投资人包括 OpenAI。NEO 采用独特的液压+空气橡胶肌肉软壳式安全架构，其身躯极其柔软不伤人，能温和安全地帮老人拉拉锁、取药品甚至搀扶行走，极大降低了长期陪伴失能老人的高强度社区医疗看护开支。',
    impact: 'positive',
    symbols: ['1X'],
    keywords: ['NEO 软躯体化', '老年看护', '安全家庭交互']
  },
  {
    id: 'robot-7',
    track: 'robot',
    time: '17:00',
    source: '智东西',
    summary: '逐际动力公布自研全足式滑轮轮足机器人 W1 最新进展，在强化学习加持下，能极速在乱石和泥泞中重载通过。',
    details: 'W1 将传统轮式越野速度与足式抗越障地形相结合。通过融合端到端的强化学习视觉导航算法，W1 不仅能保持 4m/s 快速越障，更在遭遇大断崖或楼梯时一键切入人类足步仿生攀爬姿态，适用于高危巡检与军事输送。',
    impact: 'neutral',
    symbols: ['逐际动力'],
    keywords: ['轮足机器人 W1', '强化学习算法', '重载巡检']
  },
  {
    id: 'robot-8',
    track: 'robot',
    time: '18:40',
    source: '财联社',
    summary: '优必选 (UBTECH) 最新款 Walker S1 已累计签署超万台整机意向订单，与多家新能源整车头部厂商共建标准化车间。',
    details: '优必选目前是港股“具身智能第一股”。其首推的 Walker S1 与吉利、蔚来等车厂深度共调，能完美贴合电池转运及轮胎侧壁精标工作。工业采购批量放量正在大幅分摊前期庞大的研发支出折旧成本。',
    impact: 'positive',
    symbols: ['9880.HK'],
    keywords: ['优必选', 'Walker S', '港股具身智能']
  },
  {
    id: 'robot-9',
    track: 'robot',
    time: '20:15',
    source: '传感器世界',
    summary: '工信部等七部门发布《人形机器人标准化建设行动指南》，计划于 2027 年前建立健全人形机器人全链国家标准。',
    details: '《指南》重点提及了伺服电机功率比、行星减速器背隙、六维力传感器精度、电池高比能量安全以及多模态云脑接口五个核心维度的测评规范。此指南将大幅清除国内供应链中粗制滥造和无标可查的现象，对核心器件龙头属于绝对重大利好。',
    impact: 'positive',
    symbols: ['300750.SZ', '002011.SZ'],
    keywords: ['行业评测标准', '关键元器件', '工信部新政']
  },
  {
    id: 'robot-10',
    track: 'robot',
    time: '21:55',
    source: '华尔街见闻',
    summary: '智元机器人 (Agibot) 发布“远征 A2-Max”重载机器人，双臂最大负载突破 15kg，关节模组自研率 100%。',
    details: '由稚晖君（彭志辉）联合创办的智元机器人展示了这款主打工业场景的暴力举升机器人。A2-Max 关节峰值扭矩高达 450N.m，能独立搬抬重型工业托盘和铸件，全自研的低齿槽力关节电机能使其工作功耗相比前代降低 30%，预计三季度全面铺开出货。',
    impact: 'positive',
    symbols: ['智元机器人'],
    keywords: ['彭志辉', '远征A2', '重载工业关节']
  },

  // 半导体芯片 (10 items)
  {
    id: 'semi-1',
    track: 'semiconductor',
    time: '08:10',
    source: '半导体行业观察',
    summary: '台积电宣布其下一代 2 纳米 A16（含背面供电工艺）已在一期厂区进行高收率流片试产，明年全力抢占苹果、英伟达产能。',
    details: 'A16 率先采用背面电网技术 (Super PowerRail)，将电源线走至晶圆背面，不仅能将芯片布线密度提升 20%，同等功耗下频率更可多压榨 12%。目前 3 纳米产能仍严重供不应求，2026年 2 纳米的流片定价将达到天花板级的 32000 美元/片晶圆，台积电利润率极度有保障。',
    impact: 'positive',
    symbols: ['TSM'],
    keywords: ['2纳米 A16', '背面供电', '晶圆流片定价']
  },
  {
    id: 'semi-2',
    track: 'semiconductor',
    time: '09:50',
    source: '财联社',
    summary: '英伟达 NVIDIA 宣布 Blackwell-V2 Ultra 旗舰加速卡流片成功，升级 HBM4 超宽内存，总算力增 80%。',
    details: 'Blackwell-V2 选用台积电定制的高性能双芯片堆叠 CoWoS-L 2.5D 高密封装技术。通过将存储模组全部升级至每颗晶圆带宽超 1.2TB/s 的最新 8 堆叠 HBM4，不仅彻底打通了万亿级别多模态大模型的极限数据通信瓶颈，其售价与订单预约均打破历史纪录。',
    impact: 'positive',
    symbols: ['NVDA', 'TSM'],
    keywords: ['Blackwell V2', 'HBM4 内存', 'CoWoS 封装']
  },
  {
    id: 'semi-3',
    track: 'semiconductor',
    time: '11:15',
    source: '电子发烧友',
    summary: '三星电子成功向英伟达交付首批 12 层 HBM4 高带宽内存样品，有望今年四季度冲量赶超 SK 海力士。',
    details: '虽然在上一代 HBM3 供货上面临了持久的试样延宕，三星本次 12 堆叠 HBM4 采用了先进的高摩擦铜-铜直接混合键合（Direct Copper-to-Copper Bonding）工艺，能将叠层阻抗降低 45%。通过英伟达的严格评测是三星重新夺回高端存储王座的终极决战。',
    impact: 'positive',
    symbols: ['005930.KS', 'NVDA'],
    keywords: ['三星晶圆', 'HBM4 样品', '混合键合']
  },
  {
    id: 'semi-4',
    track: 'semiconductor',
    time: '13:00',
    source: '21世纪经济报道',
    summary: '长江存储发布最新 3D NAND 技术 XTACKING 4.0，存储颗粒密度与最大读取带宽双升 30%。',
    details: 'XTACKING 4.0 通过在晶圆级上实现外围控制电路与存储阵列的物理分离和精准三维对接堆叠。此技术极大绕开了设备代差困难，在相同设备层级下能够提供直逼国际美光、铠侠最新水平的闪存读取性能，标志国产闪存硬实力重大破局。',
    impact: 'positive',
    symbols: ['长江存储'],
    keywords: ['XTACKING 4.0', '国产闪存', '三维晶圆对拼']
  },
  {
    id: 'semi-5',
    track: 'semiconductor',
    time: '14:45',
    source: '集微网',
    summary: '中芯国际公布一季度财报：营收同比增长 19.7%，12 寸特色高阶成熟制程产能利用率恢复至 95% 年夜高。',
    details: '中芯国际得益于国内车载芯片、家电智能物联 MCU 以及自主射频和 CIS 图形传感器的强劲自主替代风潮。12 寸和 8 寸特色产能基本实现满排。公司预计今年将加大折旧设备扩产投入，稳定应对后市本土半导体长牛市。',
    impact: 'positive',
    symbols: ['688981.SH', '0981.HK'],
    keywords: ['中芯国际', '特色成熟工艺', '产能爆发']
  },
  {
    id: 'semi-6',
    track: 'semiconductor',
    time: '15:55',
    source: '华尔街见闻',
    summary: 'ASML 计划将下一代 High-NA 高数值孔径 EUV 光刻机年产能翻一倍，台积电、英特尔展开激劲备货抢夺。',
    details: 'High-NA EUV 光刻机（EXE:5000 系列）每台造价高达 3.8 亿美元，是晶圆厂跨入 1.4 纳米 (A14) 工艺的终级圣杯。原本对此持保守姿态的台积电在确定背面供电和 A14 节点收率后，已被爆秘密追加多台订单，以防被英特尔捷足先登。',
    impact: 'neutral',
    symbols: ['ASML', 'INTC'],
    keywords: ['High-NA EUV', '光刻机产能', 'ASML 圣杯']
  },
  {
    id: 'semi-7',
    track: 'semiconductor',
    time: '17:20',
    source: '新浪科技',
    summary: '摩尔线程正式启动 IPO 辅导，拟登录 A 股科创板，其自研国产万卡算力集群“夸父”已正式商业部署。',
    details: '摩尔线程是国内极少数具备完全自主高性能全功能通用 GPU 全栈图形处理器研发能力的企业。其“夸父”大模型算力集群已大比例接入国内多座互联网数据中心，能支持大模型分布式训练。此番冲刺科创板将成为国产万卡大牛股。',
    impact: 'positive',
    symbols: ['摩尔线程'],
    keywords: ['夸父万卡集群', '国产 GPU', '科创板IPO']
  },
  {
    id: 'semi-8',
    track: 'semiconductor',
    time: '19:10',
    source: '经济观察网',
    summary: '博通 (Broadcom) 高层透露已揽入 Google TPU v6 及 Meta 下代定制密集人工智能加速 ASIC 独家代工及网络交换合同。',
    details: '作为全球定制 ASIC 芯片之王和 PCIe/以太网交换霸主，博通依靠其超强物理 IP 和重度网络分流（Tomahawk 交换芯片）核心优势，牢牢把控了大厂不愿全部采购英伟达高利润显卡而自研加速卡的红利通道，二季度商业展望极为惊艳。',
    impact: 'positive',
    symbols: ['AVGO', 'GOOGL', 'META'],
    keywords: ['博通ASIC', 'ASIC定制芯片', 'ASPI代工']
  },
  {
    id: 'semi-9',
    track: 'semiconductor',
    time: '20:50',
    source: '集微网',
    summary: '壁仞科技完成新一轮数亿元人民币战略追加投资，用于优化下一代大算力通用型 GPU 的流片备货及工程级落地。',
    details: '壁仞旗下 BR100 系列大算力深度学习芯片在浮点运算和吞吐时延上已达国际一流主流标准。该笔资金将全部押注在新一代针对细分垂直领域定制化智能算力的架构更新中，加速大型私有化科研和重工业部署。',
    impact: 'positive',
    symbols: ['壁仞科技'],
    keywords: ['壁仞BR100', '通用算力GPU', '追加投资']
  },
  {
    id: 'semi-10',
    track: 'semiconductor',
    time: '22:15',
    source: '金融时报',
    summary: 'AMD 发布全新 Instinct MI400 系列高性能加速卡，自研 3D 硅通孔垂直垂直互联封装，带宽突破 10TB/s。',
    details: 'AMD 借此全力进叩英伟达垄断的特大算力中心市场。MI400 选用了极为激进的 3D-V-Cache 式垂直芯片互连：在单片算力顶层上三维直接键合巨大容量 SRAM 和 HBM4。此设计将整体延迟压缩到极限，并对大型超级并行多因子运算集群能耗提升 2 倍。',
    impact: 'positive',
    symbols: ['AMD', 'NVDA'],
    keywords: ['AMD MI400', '3D硅通孔', '高吞吐算力卡']
  }
];

export const ADS: AdItem[] = [
  {
    id: 'ad-1',
    isAd: true,
    category: 'broker',
    brand: '华泰证券',
    title: '【尊享VIP】2026 硬硬科技量化掘金特训营限时开启！新客开户即享 L2 十档高级实时行情 & A股精选极速交易低佣万 1.2 通道，跟上科技主升浪！',
    cta: '立即开户'
  },
  {
    id: 'ad-2',
    isAd: true,
    category: 'etf',
    brand: '华夏基金',
    title: '【科技风向标】大模型井喷，半导体全面缺货！硬科技投资一键上车 —— 芯片 ETF (512760) / 科创 50 连续 5 天见资金超级净流入，拥抱大龙头成长性！',
    cta: '一键申购'
  },
  {
    id: 'ad-3',
    isAd: true,
    category: 'robo',
    brand: '招商银行',
    title: '【智能理财】招行「摩羯智投 3.0」全面深度接入 Gemini 3.5 分析模型。24 小时全网硬科技宏微观投资线索智能研判，动态资产优化自校，做你口袋里的金牌分析师。',
    cta: '免费测额'
  }
];
