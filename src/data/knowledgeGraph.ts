import { KnowledgeNode, StudentRecord } from '../types/math';

export const KNOWLEDGE_GRAPH_NODES: KnowledgeNode[] = [
  // --- LỚP 10 ---
  {
    id: 'k10_set_logic',
    grade: 10,
    subjectCategory: 'algebra',
    title: 'Mệnh đề & Tập hợp',
    description: 'Nền tảng logic toán học, các phép toán giao, hợp, hiệu và mệnh đề chứa biến.',
    prerequisites: [],
    nextNodes: ['k10_inequality_2var', 'k10_quadratic_func'],
    realWorldApplication: {
      field: 'Khoa học máy tính & Cơ sở dữ liệu',
      icon: '💻',
      headline: 'Truy vấn dữ liệu SQL & Đại số quan hệ',
      explanation: 'Các phép toán tập hợp $\\cap, \\cup, \\setminus$ chính là nền tảng của lệnh INNER JOIN, UNION trong cơ sở dữ liệu xử lý hàng triệu người dùng.'
    },
    sampleFormulas: ['A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}', 'A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}'],
    masteryLevel: 92,
    status: 'mastered'
  },
  {
    id: 'k10_inequality_2var',
    grade: 10,
    subjectCategory: 'algebra',
    title: 'Bất phương trình & Hệ BPT bậc nhất hai ẩn',
    description: 'Miền nghiệm của hệ bất phương trình trên mặt phẳng toạ độ và bài toán quy hoạch tuyến tính.',
    prerequisites: ['k10_set_logic'],
    nextNodes: ['k10_quadratic_func'],
    realWorldApplication: {
      field: 'Logistics & Quản trị Chuỗi cung ứng',
      icon: '🚚',
      headline: 'Tối ưu hóa chi phí vận chuyển hàng hóa',
      explanation: 'Xác định số lượng container và tuyến đường giao hàng để cực tiểu hóa chi phí xăng dầu thỏa mãn các ràng buộc tải trọng kho bãi.'
    },
    sampleFormulas: ['ax + by + c \\le 0', 'F(x, y) = ax + by \\to \\max / \\min'],
    masteryLevel: 78,
    status: 'in_progress'
  },
  {
    id: 'k10_quadratic_func',
    grade: 10,
    subjectCategory: 'algebra',
    title: 'Hàm số bậc hai & Đồ thị Parabol',
    description: 'Tọa độ đỉnh, trục đối xứng, sự biến thiên và dấu của tam thức bậc hai $ax^2 + bx + c$.',
    prerequisites: ['k10_set_logic'],
    nextNodes: ['k11_derivatives', 'k11_trig_functions'],
    realWorldApplication: {
      field: 'Hàng không không người lái (Drone)',
      icon: '🚁',
      headline: 'Tính toán quỹ đạo bay an toàn của Drone',
      explanation: 'Độ cao $h(t) = -\\frac{1}{2}gt^2 + v_0 t + h_0$ đạt cực đại tại đỉnh Parabol, giúp lập trình tránh vật cản trong thành phố thông minh.'
    },
    sampleFormulas: ['I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)', '\\Delta = b^2 - 4ac', 'f(x) > 0 \\iff a > 0 \\land \\Delta < 0'],
    masteryLevel: 65,
    status: 'remediation_needed'
  },
  {
    id: 'k10_triangle_trig',
    grade: 10,
    subjectCategory: 'geometry',
    title: 'Hệ thức lượng trong tam giác & Định lý Cosin, Sin',
    description: 'Định lý côsin $a^2 = b^2 + c^2 - 2bc\\cos A$, định lý sin, công thức tính diện tích tam giác Heron.',
    prerequisites: [],
    nextNodes: ['k10_vectors', 'k11_spatial_parallel'],
    realWorldApplication: {
      field: 'Định vị Vệ tinh GPS & Trắc địa',
      icon: '🛰️',
      headline: 'Đo khoảng cách địa lý không cần đo trực tiếp',
      explanation: 'Sử dụng phương pháp tam giác đạc để định vị kinh độ/vĩ độ tàu thuyền ngoài khơi thông qua sóng vô tuyến từ 3 trạm phát.'
    },
    sampleFormulas: ['a^2 = b^2 + c^2 - 2bc\\cos A', '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R', 'S = \\sqrt{p(p-a)(p-b)(p-c)}'],
    masteryLevel: 85,
    status: 'mastered'
  },
  {
    id: 'k10_vectors',
    grade: 10,
    subjectCategory: 'geometry',
    title: 'Véc-tơ & Tích vô hướng',
    description: 'Khái niệm véc-tơ, quy tắc 3 điểm, hình bình hành, toạ độ véc-tơ và tích vô hướng $\\vec{u} \\cdot \\vec{v}$.',
    prerequisites: ['k10_triangle_trig'],
    nextNodes: ['k11_spatial_perpendicular'],
    realWorldApplication: {
      field: 'Vật lý Cơ học & Kỹ thuật Robot',
      icon: '🦾',
      headline: 'Tính công cơ học & Phân tích hợp lực',
      explanation: 'Công sinh bởi lực tác dụng $W = \\vec{F} \\cdot \\vec{d} = |\\vec{F}||\\vec{d}|\\cos \\theta$, ứng dụng trong thiết kế khớp chuyển động cánh tay robot công nghiệp.'
    },
    sampleFormulas: ['\\vec{u} \\cdot \\vec{v} = |\\vec{u}| |\\vec{v}| \\cos(\\vec{u}, \\vec{v})', '\\vec{AB} + \\vec{BC} = \\vec{AC}'],
    masteryLevel: 70,
    status: 'in_progress'
  },
  {
    id: 'k10_stats_prob',
    grade: 10,
    subjectCategory: 'statistics_probability',
    title: 'Thống kê & Xác suất Cổ điển',
    description: 'Số trung bình, trung vị, tứ phân vị, phương sai, độ lệch chuẩn và xác suất theo định nghĩa cổ điển.',
    prerequisites: ['k10_set_logic'],
    nextNodes: ['k11_cond_probability', 'k11_grouped_stats'],
    realWorldApplication: {
      field: 'Định lượng Rủi ro Tài chính',
      icon: '📊',
      headline: 'Đánh giá mức độ biến động của danh mục cổ phiếu',
      explanation: 'Độ lệch chuẩn $\\sigma$ đo lường rủi ro dao động giá tài sản, giúp nhà đầu tư cân bằng tỷ trọng sinh lời.'
    },
    sampleFormulas: ['P(A) = \\frac{n(A)}{n(\\Omega)}', 's^2 = \\frac{1}{n}\\sum_{i=1}^n (x_i - \\bar{x})^2'],
    masteryLevel: 88,
    status: 'mastered'
  },

  // --- LỚP 11 ---
  {
    id: 'k11_trig_functions',
    grade: 11,
    subjectCategory: 'algebra',
    title: 'Hàm số lượng giác & Phương trình lượng giác',
    description: 'Tập xác định, chu kỳ, đồ thị của hàm $\\sin, \\cos, \\tan$ và công thức biến đổi lượng giác.',
    prerequisites: ['k10_quadratic_func', 'k10_triangle_trig'],
    nextNodes: ['k11_derivatives'],
    realWorldApplication: {
      field: 'Khí tượng học & Âm học',
      icon: '🌊',
      headline: 'Mô phỏng chu kỳ Thủy triều và Sóng âm',
      explanation: 'Mực nước biển $h(t) = 3 + 2\\cos\\left(\\frac{\\pi t}{6}\\right)$ giúp tàu trọng tải lớn cập cảng vào thời điểm đỉnh triều.'
    },
    sampleFormulas: ['\\sin(a+b) = \\sin a \\cos b + \\cos a \\sin b', '\\cos 2x = 2\\cos^2 x - 1', '\\tan x = m \\iff x = \\arctan m + k\\pi'],
    masteryLevel: 58,
    status: 'remediation_needed'
  },
  {
    id: 'k11_sequences_progressions',
    grade: 11,
    subjectCategory: 'algebra',
    title: 'Dãy số, Cấp số cộng & Cấp số nhân',
    description: 'Số hạng tổng quát, công sai $d$, công bội $q$, công thức tổng $n$ số hạng đầu tiên $S_n$.',
    prerequisites: ['k10_quadratic_func'],
    nextNodes: ['k11_limits'],
    realWorldApplication: {
      field: 'Kinh tế & Ngân hàng',
      icon: '🏦',
      headline: 'Công thức Lãi kép & Quỹ hưu trí tích lũy',
      explanation: 'Số tiền sau $n$ kỳ hạn $A = P(1+r)^n$ chính là ứng dụng cấp số nhân giúp lập kế hoạch tự do tài chính.'
    },
    sampleFormulas: ['u_n = u_1 + (n-1)d', 'u_n = u_1 \\cdot q^{n-1}', 'S_n = \\frac{u_1(1 - q^n)}{1 - q}'],
    masteryLevel: 80,
    status: 'mastered'
  },
  {
    id: 'k11_limits',
    grade: 11,
    subjectCategory: 'calculus',
    title: 'Giới hạn dãy số, hàm số & Tính liên tục',
    description: 'Khái niệm giới hạn hữu hạn, vô cực, các dạng vô định $\\frac{0}{0}, \\frac{\\infty}{\\infty}, \\infty - \\infty$ và định lý Bolzano-Cauchy.',
    prerequisites: ['k11_sequences_progressions'],
    nextNodes: ['k11_derivatives'],
    realWorldApplication: {
      field: 'Vật lý Lượng tử & Điện trở',
      icon: '⚡',
      headline: 'Giá trị tức thời & Điểm suy biến',
      explanation: 'Xác định vận tốc tức thời tại thời khắc va chạm bằng giới hạn $\\lim_{\\Delta t \\to 0} \\frac{\\Delta s}{\\Delta t}$.'
    },
    sampleFormulas: ['\\lim_{x \\to x_0} \\frac{f(x) - f(x_0)}{x - x_0}', '\\lim_{n \\to \\infty} q^n = 0 \\; (|q| < 1)'],
    masteryLevel: 62,
    status: 'in_progress'
  },
  {
    id: 'k11_derivatives',
    grade: 11,
    subjectCategory: 'calculus',
    title: 'Đạo hàm & Ý nghĩa hình học, vật lý',
    description: 'Quy tắc tính đạo hàm, đạo hàm hàm hợp, phương trình tiếp tuyến của đồ thị $y = f\'(x_0)(x - x_0) + y_0$.',
    prerequisites: ['k11_limits', 'k10_quadratic_func'],
    nextNodes: [],
    realWorldApplication: {
      field: 'Kinh tế học & Tối ưu hóa Nhà máy',
      icon: '📈',
      headline: 'Cực đại hóa lợi nhuận & Doanh thu biên',
      explanation: 'Tìm mức sản lượng $x$ sao cho chi phí biên $C\'(x) = R\'(x)$ (doanh thu biên) để tối đa hoá biên lợi nhuận ròng.'
    },
    sampleFormulas: ['f\'(x_0) = \\lim_{x \\to x_0}\\frac{f(x)-f(x_0)}{x-x_0}', '(u \\cdot v)\' = u\'v + uv\'', 'y = f\'(x_0)(x - x_0) + f(x_0)'],
    masteryLevel: 50,
    status: 'remediation_needed'
  },
  {
    id: 'k11_spatial_parallel',
    grade: 11,
    subjectCategory: 'geometry',
    title: 'Quan hệ Song song trong Không gian',
    description: 'Đường thẳng song song mặt phẳng, hai mặt phẳng song song, định lý Thales và thiết diện song song.',
    prerequisites: ['k10_triangle_trig'],
    nextNodes: ['k11_spatial_perpendicular'],
    realWorldApplication: {
      field: 'Kiến trúc & Kỹ thuật Xây dựng',
      icon: '🏛️',
      headline: 'Kết cấu dầm sàn chịu lực trong nhà cao tầng',
      explanation: 'Đảm bảo tính song song giữa các mặt sàn và phân bổ tải trọng trọng lực đều xuống các cột trụ trung tâm.'
    },
    sampleFormulas: ['d \\parallel (\\alpha) \\iff d \\parallel d\' \\subset (\\alpha)', '(\\alpha) \\parallel (\\beta)'],
    masteryLevel: 75,
    status: 'in_progress'
  },
  {
    id: 'k11_spatial_perpendicular',
    grade: 11,
    subjectCategory: 'geometry',
    title: 'Quan hệ Vuông góc & Góc, Khoảng cách 3D',
    description: 'Đường vuông góc mặt phẳng, hai mặt phẳng vuông góc, góc giữa đường thẳng và mặt phẳng, khoảng cách từ điểm đến mặt phẳng.',
    prerequisites: ['k11_spatial_parallel', 'k10_vectors'],
    nextNodes: [],
    realWorldApplication: {
      field: 'Đồ họa 3D & Kính thực tế ảo (AR/VR)',
      icon: '🥽',
      headline: 'Chiếu bóng Ray-tracing & Vector pháp tuyến',
      explanation: 'Vector pháp tuyến $\\vec{n} \\perp (P)$ quyết định hướng phản xạ của tia sáng trên bề mặt vật thể không gian 3 chiều.'
    },
    sampleFormulas: ['d \\perp (P) \\iff d \\perp a \\land d \\perp b', 'd(M, (P)) = |MH|', '\\tan \\varphi = \\frac{SO}{OA}'],
    masteryLevel: 45,
    status: 'remediation_needed'
  },
  {
    id: 'k11_cond_probability',
    grade: 11,
    subjectCategory: 'statistics_probability',
    title: 'Xác suất Có điều kiện & Biến cố độc lập',
    description: 'Công thức xác suất có điều kiện $P(A|B) = \\frac{P(AB)}{P(B)}$, công thức nhân xác suất và xác suất toàn phần.',
    prerequisites: ['k10_stats_prob'],
    nextNodes: [],
    realWorldApplication: {
      field: 'Y học Dịch tễ học & Xét nghiệm Sinh học',
      icon: '🧬',
      headline: 'Đánh giá độ nhạy và độ đặc hiệu của que thử bệnh',
      explanation: 'Tính xác suất một bệnh nhân thực sự mắc bệnh khi que thử cho kết quả dương tính: $P(\\text{Bệnh}|\\text{Dương tính})$.'
    },
    sampleFormulas: ['P(A|B) = \\frac{P(AB)}{P(B)}', 'P(AB) = P(A) \\cdot P(B|A)'],
    masteryLevel: 60,
    status: 'in_progress'
  }
];

export const INITIAL_STUDENT_ROSTER: StudentRecord[] = [
  {
    id: 'hs_001',
    name: 'Nguyễn Minh Tuấn',
    email: 'tuan.nm@thpt.edu.vn',
    grade: 11,
    elo: 1420,
    recentTopic: 'Đạo hàm & Cực trị',
    lastActiveMinutesAgo: 4,
    engagementScore: 92,
    cognitiveGapCount: 1,
    fatigueIndex: 25,
    status: 'Thành thạo'
  },
  {
    id: 'hs_002',
    name: 'Trần Thảo Ly',
    email: 'ly.tt@thpt.edu.vn',
    grade: 11,
    elo: 1180,
    recentTopic: 'Quan hệ vuông góc trong không gian',
    lastActiveMinutesAgo: 45,
    engagementScore: 48,
    cognitiveGapCount: 4,
    fatigueIndex: 78,
    status: 'Rủi ro hổng kiến thức'
  },
  {
    id: 'hs_003',
    name: 'Lê Hoàng Nam',
    email: 'nam.lh@thpt.edu.vn',
    grade: 10,
    elo: 1260,
    recentTopic: 'Hàm số bậc hai & Parabol',
    lastActiveMinutesAgo: 12,
    engagementScore: 75,
    cognitiveGapCount: 2,
    fatigueIndex: 40,
    status: 'Cần củng cố'
  },
  {
    id: 'hs_004',
    name: 'Phạm Quỳnh Nga',
    email: 'nga.pq@thpt.edu.vn',
    grade: 11,
    elo: 1090,
    recentTopic: 'Phương trình lượng giác',
    lastActiveMinutesAgo: 180,
    engagementScore: 30,
    cognitiveGapCount: 5,
    fatigueIndex: 85,
    status: 'Rủi ro hổng kiến thức'
  },
  {
    id: 'hs_005',
    name: 'Đỗ Hải Đăng',
    email: 'dang.dh@thpt.edu.vn',
    grade: 10,
    elo: 1510,
    recentTopic: 'Quy hoạch tuyến tính',
    lastActiveMinutesAgo: 2,
    engagementScore: 98,
    cognitiveGapCount: 0,
    fatigueIndex: 15,
    status: 'Thành thạo'
  },
  {
    id: 'hs_006',
    name: 'Vũ Bảo Châu',
    email: 'chau.vb@thpt.edu.vn',
    grade: 11,
    elo: 1240,
    recentTopic: 'Giới hạn vô định',
    lastActiveMinutesAgo: 35,
    engagementScore: 65,
    cognitiveGapCount: 3,
    fatigueIndex: 60,
    status: 'Cần củng cố'
  }
];
