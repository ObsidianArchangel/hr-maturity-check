import { useState, useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

// ============================================================
// Диагностика зрелости HR-системы
// Инструмент самодиагностики зрелости HR-процессов для
// консалтинговых компаний 50–300 человек.
// Механика: К1 (описание процесса) + К2 (управление по данным).
// Б = 0,4 × К1 + 0,6 × К2.
// ============================================================

// ---------- ДАННЫЕ ------------------------------------------

const BLOCKS = [
  {
    id: "hiring",
    title: "Найм и отбор",
    short: "Найм",
    cascade: 2,
    urgency: 2,
    questions: [
      "Описан ли путь кандидата от заявки на вакансию до выхода на работу?",
      "Распределены ли роли HR, руководителя практики и партнёра в процессе подбора?",
      "Используются ли единые критерии оценки кандидатов по ролям и карьерным уровням?",
      "Фиксируются ли причины, по которым кандидаты или компания прекращают переговоры?",
      "Корректируется ли подбор по итогам анализа закрытых и незакрытых вакансий?",
    ],
    questionHelpers: [
      {
        check: "Есть ли понятная последовательность этапов найма.",
        howToRate: "Поставьте 3, если этапы зафиксированы письменно; 4 — если они регулярно пересматриваются по результатам.",
      },
      {
        check: "Кто за что отвечает на каждом этапе подбора.",
        howToRate: "Поставьте 3, если роли описаны в регламенте подбора; 4 — если по итогам найма анализируется, где роли сработали, а где нет, и регламент корректируется.",
      },
      {
        check: "По какой шкале сравниваются кандидаты между собой.",
        howToRate: "Поставьте 3, если критерии оформлены документально; 4 — если они регулярно сверяются с результатами испытательного срока.",
      },
      {
        check: "Накапливаются ли данные о неудачных контактах с кандидатами.",
        howToRate: "Поставьте 3, если причины фиксируются в едином формате; 4 — если они анализируются и влияют на изменения в воронке.",
      },
      {
        check: "Есть ли цикл улучшения процесса по результатам.",
        howToRate: "Поставьте 3, если периодичность пересмотра процесса закреплена; 4 — если пересмотр опирается на данные воронки и его эффект сверяется по следующим циклам найма.",
      },
    ],
    metrics: [
      {
        id: "time_to_fill",
        title: "Время закрытия вакансии",
        description: "Среднее число дней от открытия позиции до принятия оффера кандидатом.",
        unit: "дн.",
        target: 45,
        direction: "lower_is_better",
      },
      {
        id: "funnel_conv",
        title: "Конверсия воронки найма",
        description: "Доля кандидатов, перешедших с HR-интервью на интервью с менеджером.",
        unit: "%",
        target: 30,
        direction: "higher_is_better",
      },
      {
        id: "intern_conv",
        title: "Конверсия стажёрской программы",
        description: "Доля стажёров, которые после программы остаются работать в компании.",
        unit: "%",
        target: 60,
        direction: "higher_is_better",
      },
    ],
  },
  {
    id: "onboarding",
    title: "Адаптация новых сотрудников",
    short: "Адаптация",
    cascade: 2,
    urgency: 3,
    questions: [
      "Есть ли письменный план адаптации новичка на первые 12 недель?",
      "Разделены ли роли HR-партнёра, куратора и наставника в адаптации?",
      "Назначается ли наставник заранее, до выхода новичка на работу?",
      "Проводятся ли контрольные точки с новичком на 1-й, 4-й и 12-й неделе?",
      "Описаны ли критерии готовности новичка к самостоятельной работе на проектах?",
    ],
    questionHelpers: [
      {
        check: "Зафиксирован ли маршрут вхождения в работу.",
        howToRate: "Поставьте 3, если план оформлен документально; 4 — если он обновляется по итогам каждой адаптации.",
      },
      {
        check: "Понятно ли, кто помогает новичку в разных вопросах.",
        howToRate: "Поставьте 3, если разделение ролей зафиксировано в положении об адаптации; 4 — если по итогам адаптации фиксируются сбои в разграничении и регламент обновляется.",
      },
      {
        check: "Готова ли поддержка к первому рабочему дню.",
        howToRate: "Поставьте 3, если порядок назначения наставника до выхода закреплён в регламенте адаптации; 4 — если по итогам адаптаций оценивается работа наставников и порядок их подготовки корректируется.",
      },
      {
        check: "Отслеживается ли динамика адаптации в фиксированные моменты.",
        howToRate: "Поставьте 3, если контрольные точки закреплены в плане адаптации с ответственными; 4 — если их итоги собираются в показатель и используются для корректировки программы.",
      },
      {
        check: "По каким признакам адаптация считается успешной.",
        howToRate: "Поставьте 3, если критерии зафиксированы; 4 — если по ним считается доля готовых новичков на 12-й неделе.",
      },
    ],
    metrics: [
      {
        id: "ready_12w",
        title: "Готовность к проектной работе на 12-й неделе",
        description: "Доля новых сотрудников, которых руководитель готов допустить к самостоятельной проектной работе к 12-й неделе.",
        unit: "%",
        target: 80,
        direction: "higher_is_better",
      },
      {
        id: "util_ramp",
        title: "Срок выхода на плановую утилизацию",
        description: "Среднее число недель, которое требуется новичку, чтобы выйти на ожидаемый уровень загрузки на клиентских проектах.",
        unit: "нед.",
        target: 8,
        direction: "lower_is_better",
      },
    ],
  },
  {
    id: "learning",
    title: "Обучение и развитие",
    short: "Обучение",
    cascade: 2,
    urgency: 2,
    questions: [
      "Есть ли единая карта знаний по каждому направлению или практике?",
      "Есть ли ответственный за актуальность карты знаний?",
      "Связано ли обучение с матрицей компетенций сотрудников?",
      "Используются ли результаты комплексной оценки для индивидуальных планов развития?",
      "Обновляются ли обучающие материалы по итогам реальных проектов?",
    ],
    questionHelpers: [
      {
        check: "Зафиксирован ли набор экспертизы, который нужен сотрудникам.",
        howToRate: "Поставьте 3, если карты знаний оформлены как документ с ответственным; 4 — если есть показатель актуальности карт и он отслеживается.",
      },
      {
        check: "Понятно ли, кто следит, чтобы знания не устаревали.",
        howToRate: "Поставьте 3, если ответственный назначен; 4 — если установлен срок обновления и он соблюдается.",
      },
      {
        check: "Есть ли связь между требованиями к роли и обучением.",
        howToRate: "Поставьте 3, если связь зафиксирована в документах; 4 — если на её основе формируются индивидуальные планы развития.",
      },
      {
        check: "Превращается ли оценка сотрудников в конкретные шаги развития.",
        howToRate: "Поставьте 3, если планы развития строятся по результатам оценки; 4 — если их выполнение отслеживается и влияет на рост.",
      },
      {
        check: "Перетекает ли опыт проектов в обучение.",
        howToRate: "Поставьте 3, если порядок обновления материалов после проектов закреплён; 4 — если обновления собираются в обратную связь команд и влияют на содержание обучения.",
      },
    ],
    metrics: [
      {
        id: "maps_actual",
        title: "Актуальность карт знаний",
        description: "Доля карт знаний, которые проверены и обновлены за последний установленный период.",
        unit: "%",
        target: 100,
        direction: "higher_is_better",
      },
    ],
  },
  {
    id: "performance",
    title: "Управление результативностью и удержание",
    short: "Результативность",
    cascade: 2,
    urgency: 2,
    questions: [
      "Есть ли формальная система оценки результативности по карьерным уровням и компетенциям?",
      "Считается ли утилизация сотрудников по направлениям и практикам?",
      "Есть ли пороги, при превышении которых руководитель обязан вмешаться при перегрузке?",
      "Проводятся ли выходные интервью по единому шаблону при уходе сотрудника?",
      "Используются ли данные о текучести и выходных интервью для изменения условий работы?",
    ],
    questionHelpers: [
      {
        check: "Сравнивается ли работа сотрудников по единой шкале.",
        howToRate: "Поставьте 3, если система оформлена документально; 4 — если оценки регулярно влияют на развитие и компенсацию.",
      },
      {
        check: "Видно ли, кто перегружен, а кто недозагружен.",
        howToRate: "Поставьте 3, если методика расчёта и периодичность закреплены; 4 — если значения утилизации регулярно сверяются с порогами и приводят к решениям.",
      },
      {
        check: "Описана ли реакция компании на перегрузку сотрудника.",
        howToRate: "Поставьте 3, если пороги зафиксированы; 4 — если по ним есть документированные действия и они выполняются.",
      },
      {
        check: "Собирается ли структурированная обратная связь от уходящих.",
        howToRate: "Поставьте 3, если шаблон и порядок интервью закреплены; 4 — если результаты обобщаются в показатели и обсуждаются с руководителями практик.",
      },
      {
        check: "Превращаются ли сигналы об уходе в управленческие изменения.",
        howToRate: "Поставьте 3, если порядок анализа данных и принятия решений закреплён; 4 — если по внесённым изменениям отслеживается эффект на следующих циклах.",
      },
    ],
    metrics: [
      {
        id: "utilization",
        title: "Утилизация по направлению",
        description: "Доля рабочего времени сотрудника, которая приходится на оплачиваемые клиентские проекты.",
        unit: "%",
        target: [75, 85],
        direction: "range_is_best",
      },
      {
        id: "turnover",
        title: "Добровольная текучесть (за год)",
        description: "Доля сотрудников, добровольно уволившихся за год, от среднесписочной численности.",
        unit: "%",
        target: 15,
        direction: "lower_is_better",
      },
      {
        id: "return_ready",
        title: "Готовность к возвращению после ухода",
        description: "Доля бывших сотрудников, которые готовы вернуться в компанию при подходящем предложении.",
        unit: "%",
        target: 50,
        direction: "higher_is_better",
      },
    ],
  },
  {
    id: "analytics",
    title: "Регламентация и HR-аналитика",
    short: "Аналитика",
    cascade: 3,
    urgency: 2,
    questions: [
      "Есть ли единый перечень ключевых HR-процессов компании?",
      "Назначен ли владелец у каждого HR-процесса?",
      "Ведётся ли единая сводная панель показателей по ключевым HR-метрикам?",
      "Установлена ли периодичность обновления HR-показателей?",
      "Обсуждаются ли HR-показатели на регулярных встречах HR и руководителей практик?",
    ],
    questionHelpers: [
      {
        check: "Известен ли полный набор HR-процессов, которыми компания управляет.",
        howToRate: "Поставьте 3, если перечень зафиксирован; 4 — если он пересматривается по мере изменений в компании.",
      },
      {
        check: "Понятно ли, кто отвечает за состояние процесса в целом.",
        howToRate: "Поставьте 3, если владельцы назначены; 4 — если они регулярно отчитываются о состоянии процесса.",
      },
      {
        check: "Собраны ли ключевые показатели в одном месте: найм, адаптация, обучение, утилизация, удержание и полнота данных.",
        howToRate: "Поставьте 3, если состав панели и владелец закреплены; 4 — если панель обновляется в срок и доступна руководителям практик.",
      },
      {
        check: "Известно ли, как часто данные должны обновляться.",
        howToRate: "Поставьте 3, если периодичность зафиксирована; 4 — если она соблюдается без срывов.",
      },
      {
        check: "Используются ли данные как основание для управленческих решений.",
        howToRate: "Поставьте 3, если регламент встреч и повестка закреплены; 4 — если по итогам встреч фиксируются решения и отслеживается их исполнение.",
      },
    ],
    metrics: [
      {
        id: "dashboard_completeness",
        title: "Полнота сводной панели показателей",
        description: "Доля ключевых HR-показателей, по которым данные собираются и доступны для анализа.",
        unit: "%",
        target: 100,
        direction: "higher_is_better",
      },
      {
        id: "no_data_share",
        title: "Доля показателей, по которым нет данных",
        description: "Считается автоматически по всем показателям калькулятора: чем больше показателей не считается или требует уточнения, тем ниже зрелость HR-аналитики.",
        unit: "%",
        target: 0,
        direction: "lower_is_better",
        auto: true,
      },
    ],
  },
];

const RECOMMENDATIONS = {
  hiring: {
    1: { diagnosis: "Подбор работает реактивно, единая воронка отсутствует.", horizon: "1 месяц", actions: ["Зафиксировать этапы подбора.", "Назначить владельца процесса.", "Ввести единую форму заявки на вакансию."] },
    2: { diagnosis: "Подбор фактически есть, но зависит от отдельных HR и руководителей.", horizon: "квартал", actions: ["Описать роли HR и менеджеров.", "Ввести единые критерии оценки кандидатов.", "Начать фиксировать причины отказов."] },
    3: { diagnosis: "Воронка регламентирована, но не полностью управляется через данные.", horizon: "квартал", actions: ["Ввести ежемесячный отчёт по времени закрытия.", "Считать конверсию между этапами.", "Отдельно отслеживать стажёрскую программу."] },
    4: { diagnosis: "Подбор измеряется и управляется, есть цикл улучшений.", horizon: "полгода", actions: ["Анализировать узкие места воронки.", "Сравнивать эффективность каналов найма.", "Пересматривать профиль кандидата по итогам испытательного срока."] },
  },
  onboarding: {
    1: { diagnosis: "Новичок входит в работу без единого маршрута и контрольных точек.", horizon: "1 месяц", actions: ["Создать чек-лист первых 5 рабочих дней.", "Назначать ответственного HR.", "Фиксировать минимум доступов, контактов и задач."] },
    2: { diagnosis: "Адаптация существует, но держится на инициативе куратора или команды.", horizon: "квартал", actions: ["Ввести матрицу ответственности (RACI).", "Разделить роли куратора и наставника.", "Закрепить контрольные точки на 1-й, 4-й и 12-й неделе."] },
    3: { diagnosis: "Адаптация регламентирована, но эффект измеряется неполно.", horizon: "квартал", actions: ["Считать готовность к проектной работе.", "Отслеживать срок выхода на плановую утилизацию.", "Собирать обратную связь новичков после 12-й недели."] },
    4: { diagnosis: "Адаптация управляется через данные и регулярно улучшается.", horizon: "полгода", actions: ["Сравнивать результаты по практикам.", "Обновлять программу по причинам неуспешной адаптации.", "Использовать лучших наставников как внутренний стандарт."] },
  },
  learning: {
    1: { diagnosis: "Обучение ситуативное, знания остаются у отдельных сотрудников.", horizon: "1 месяц", actions: ["Создать минимальные карты знаний по направлениям.", "Назначить владельцев материалов.", "Собрать базовые инструкции и шаблоны."] },
    2: { diagnosis: "Обучение есть, но база знаний и развитие не связаны в систему.", horizon: "квартал", actions: ["Привязать карты знаний к карьерным уровням.", "Установить срок обновления материалов.", "Включить наставников в актуализацию базы."] },
    3: { diagnosis: "Обучение регламентировано, но слабо связано с результатами оценки.", horizon: "квартал", actions: ["Использовать комплексную оценку для индивидуальных планов развития.", "Отслеживать актуальность карт знаний.", "Анализировать дефициты компетенций по практикам."] },
    4: { diagnosis: "Развитие встроено в управленческий цикл компании.", horizon: "полгода", actions: ["Обновлять обучение по итогам проектов.", "Связывать развитие с кадровым резервом.", "Оценивать влияние обучения на готовность к новым проектным ролям."] },
  },
  performance: {
    1: { diagnosis: "Результативность и удержание управляются после возникновения проблемы.", horizon: "1 месяц", actions: ["Зафиксировать базовые показатели: утилизация, текучесть, причины ухода.", "Назначить ответственного за сбор данных.", "Начать регулярный сбор минимального набора HR-метрик."] },
    2: { diagnosis: "Оценка частично есть, но удержание не оформлено как процесс.", horizon: "квартал", actions: ["Ввести выходные интервью.", "Установить пороги перегрузки.", "Ежеквартально обсуждать текучесть с руководителями практик."] },
    3: { diagnosis: "Оценка регламентирована, но данные не всегда приводят к управленческим решениям.", horizon: "квартал", actions: ["Анализировать утилизацию по направлениям.", "Вводить корректирующие меры при перегрузке.", "Отслеживать готовность бывших сотрудников вернуться."] },
    4: { diagnosis: "Удержание управляется превентивно.", horizon: "полгода", actions: ["Использовать ранние сигналы риска ухода.", "Связывать нагрузку, развитие и компенсацию.", "Формировать пул потенциальных «бумерангов»."] },
  },
  analytics: {
    1: { diagnosis: "HR-аналитика отсутствует, решения принимаются без единого набора данных.", horizon: "1 месяц", actions: ["Создать список обязательных HR-показателей.", "Назначить владельцев.", "Собрать первую сводную панель показателей в таблице."] },
    2: { diagnosis: "Данные собираются частично и нерегулярно.", horizon: "квартал", actions: ["Установить периодичность обновления.", "Ввести статус «нет данных» как риск.", "Ежемесячно проверять полноту сводной панели."] },
    3: { diagnosis: "HR-аналитика работает, но не всегда влияет на решения.", horizon: "квартал", actions: ["Встроить сводную панель во встречи HR и руководителей практик.", "Фиксировать решения по отклонениям.", "Связывать показатели с планом улучшений."] },
    4: { diagnosis: "Аналитика используется как контур управления HR-системой.", horizon: "полгода", actions: ["Анализировать динамику по кварталам.", "Проверять эффект внедрённых мер.", "Обновлять веса и вопросы калькулятора по результатам практического использования."] },
  },
};

// Кумулятивная шкала: каждый следующий уровень включает предыдущий
const K1_LABELS = {
  1: "Процесса нет",
  2: "Есть на практике",
  3: "Описан и закреплён",
  4: "Закреплён и улучшается",
};

const K1_DESCRIPTIONS = {
  1: "Процесс отсутствует или каждый раз выполняется по-разному.",
  2: "Процесс работает, но держится на людях и не закреплён.",
  3: "Есть документ, роли и понятный порядок действий.",
  4: "Процесс описан, измеряется и корректируется по данным.",
};

const SCALE_LEGEND = [1, 2, 3, 4].map((v) => ({
  level: v,
  short: shortK1Label(v),
  label: K1_LABELS[v],
  description: K1_DESCRIPTIONS[v],
}));

const LEVEL_COLORS = {
  1: { text: "text-red-300", bg: "bg-red-500/10", border: "border-red-500/40", dot: "bg-red-500", solid: "#ef4444" },
  2: { text: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/40", dot: "bg-orange-500", solid: "#f97316" },
  3: { text: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/40", dot: "bg-blue-500", solid: "#3b82f6" },
  4: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/40", dot: "bg-emerald-500", solid: "#10b981" },
};

function shortK1Label(v) {
  switch (v) {
    case 1: return "нет";
    case 2: return "на практике";
    case 3: return "закреплён";
    case 4: return "улучшается";
    default: return "";
  }
}

const TRACKING_OPTIONS = [
  {
    val: "tracked_with_value",
    label: "Считается, значение известно",
    caption: "Показатель отслеживается, текущее значение можно ввести.",
  },
  {
    val: "tracked_no_value",
    label: "Считается, но значения сейчас нет",
    caption: "Процесс измерения есть, но точного значения сейчас нет под рукой.",
  },
  {
    val: "not_tracked",
    label: "Показатель не считается",
    caption: "В компании этот показатель сейчас не фиксируется.",
  },
  {
    val: "unsure",
    label: "Не уверен, нужно уточнить",
    caption: "Статус показателя неизвестен — это зона для проверки.",
  },
];

// ---------- РАСЧЁТЫ -----------------------------------------

function scoreMetricByTarget(metric, value) {
  if (metric.direction === "lower_is_better") {
    const t = metric.target;
    if (t === 0) {
      if (value <= 0) return 4;
      if (value <= 15) return 3;
      if (value <= 50) return 2;
      return 1;
    }
    if (value <= t) return 4;
    const pct = ((value - t) / t) * 100;
    if (pct <= 15) return 3;
    if (pct <= 50) return 2;
    return 1;
  }
  if (metric.direction === "higher_is_better") {
    const t = metric.target;
    if (value >= t) return 4;
    const pct = (value / t) * 100;
    if (pct >= 85) return 3;
    if (pct >= 60) return 2;
    return 1;
  }
  if (metric.direction === "range_is_best") {
    const [lo, hi] = metric.target;
    if (value >= lo && value <= hi) return 4;
    if (value < lo) {
      const dist = lo - value;
      if (dist <= 5) return 3;
      if (dist <= 15) return 2;
      return 1;
    }
    const dist = value - hi;
    if (dist <= 4) return 3;
    if (dist <= 10) return 2;
    return 1;
  }
  return 1;
}

function scoreMetric(metric, state) {
  switch (state.trackingState) {
    case "not_tracked":
      return 1;
    case "tracked_no_value":
      return 2;
    case "unsure":
      return 1;
    case null:
      return 0;
    case "tracked_with_value": {
      if (state.value === "" || state.value === null || state.value === undefined) return 1;
      const v = Number(state.value);
      if (Number.isNaN(v)) return 1;
      let base = scoreMetricByTarget(metric, v);
      if (!state.hasOwner && !state.isReviewed) base = Math.min(base, 2);
      return base;
    }
    default:
      return 1;
  }
}

function calculateK1(answers) {
  const valid = answers.filter((a) => a >= 1 && a <= 4);
  if (valid.length === 0) return 0;
  return valid.reduce((s, a) => s + a, 0) / valid.length;
}

function defineLevel(score) {
  if (score >= 3.25) return 4;
  if (score >= 2.5) return 3;
  if (score >= 1.75) return 2;
  return 1;
}

// «Нет данных» = показатель не считается ИЛИ статус неизвестен.
// «Считается, но значения сейчас нет» НЕ считается отсутствием данных:
// процесс измерения существует, но управленческая дисциплина слабая.
function calculateAutoNoDataShare(state) {
  let total = 0;
  let noData = 0;
  BLOCKS.forEach((b) => {
    b.metrics.forEach((m) => {
      if (m.auto) return;
      total += 1;
      const s = state[b.id]?.metrics[m.id];
      if (!s) {
        noData += 1;
        return;
      }
      if (s.trackingState === "not_tracked" || s.trackingState === "unsure") {
        noData += 1;
      }
    });
  });
  if (total === 0) return 0;
  return (noData / total) * 100;
}

function calculateResults(state) {
  const noDataShare = calculateAutoNoDataShare(state);

  return BLOCKS.map((block) => {
    const answers = state[block.id].questions;
    const k1 = calculateK1(answers);

    const metricScores = block.metrics.map((m) => {
      if (m.auto && m.id === "no_data_share") {
        return scoreMetricByTarget(m, noDataShare);
      }
      const s = state[block.id].metrics[m.id];
      return scoreMetric(m, s);
    });

    const k2 = metricScores.length > 0 ? metricScores.reduce((a, b) => a + b, 0) / metricScores.length : 0;

    const rawScore = 0.4 * k1 + 0.6 * k2;

    const manualMetrics = block.metrics.filter((m) => !m.auto);
    const allNoData =
      manualMetrics.length > 0 &&
      manualMetrics.every((m) => {
        const s = state[block.id].metrics[m.id];
        return !s || s.trackingState === "not_tracked" || s.trackingState === "unsure";
      });

    let cappedScore = rawScore;
    if (allNoData) cappedScore = Math.min(cappedScore, 2.49);
    if (k1 < 2.5) cappedScore = Math.min(cappedScore, 3.24);
    if (k2 < 3) cappedScore = Math.min(cappedScore, 3.24);

    const level = defineLevel(cappedScore);

    return {
      blockId: block.id,
      block,
      k1,
      k2,
      rawScore,
      cappedScore,
      level,
      autoNoDataShare: block.id === "analytics" ? noDataShare : null,
    };
  });
}

function priorityLabel(priority) {
  if (priority >= 18) return "Очень высокий приоритет";
  if (priority >= 10) return "Высокий приоритет";
  return "Средний приоритет";
}

// ---------- ОСНОВНОЙ КОМПОНЕНТ ------------------------------

function makeInitialState() {
  const state = {};
  BLOCKS.forEach((b) => {
    state[b.id] = {
      questions: b.questions.map(() => null),
      metrics: {},
    };
    b.metrics.forEach((m) => {
      state[b.id].metrics[m.id] = {
        trackingState: null,
        value: "",
        hasOwner: false,
        isReviewed: false,
      };
    });
  });
  return state;
}

export default function App() {
  const [screen, setScreen] = useState("start");
  const [step, setStep] = useState(0);
  const [state, setState] = useState(makeInitialState);
  const [showValidation, setShowValidation] = useState(false);

  const results = useMemo(() => calculateResults(state), [state]);

  function updateAnswer(blockId, qIdx, value) {
    setState((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        questions: prev[blockId].questions.map((a, i) => (i === qIdx ? value : a)),
      },
    }));
  }

  function updateMetric(blockId, metricId, patch) {
    setState((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        metrics: {
          ...prev[blockId].metrics,
          [metricId]: { ...prev[blockId].metrics[metricId], ...patch },
        },
      },
    }));
  }

  function getStepIssues(idx) {
    const block = BLOCKS[idx];
    const blockState = state[block.id];
    const unansweredQuestions = blockState.questions.filter((a) => a === null).length;
    const unfilledMetrics = block.metrics.filter((m) => {
      if (m.auto) return false;
      const s = blockState.metrics[m.id];
      if (s.trackingState === null) return true;
      if (s.trackingState === "tracked_with_value" && (s.value === "" || s.value === null)) return true;
      return false;
    }).length;
    return { unansweredQuestions, unfilledMetrics };
  }

  function isStepValid(idx) {
    const issues = getStepIssues(idx);
    return issues.unansweredQuestions === 0 && issues.unfilledMetrics === 0;
  }

  function handleNext() {
    if (!isStepValid(step)) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    if (step < BLOCKS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setShowValidation(false);
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setScreen("start");
    }
  }

  function handleReset() {
    setState(makeInitialState());
    setStep(0);
    setScreen("start");
    setShowValidation(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <Header />
        {screen === "start" && <StartScreen onStart={() => setScreen("diagnostic")} />}
        {screen === "diagnostic" && (
          <DiagnosticScreen
            step={step}
            state={state}
            updateAnswer={updateAnswer}
            updateMetric={updateMetric}
            onNext={handleNext}
            onBack={handleBack}
            showValidation={showValidation}
            issues={getStepIssues(step)}
          />
        )}
        {screen === "result" && (
          <ResultScreen
            results={results}
            onBack={() => setScreen("diagnostic")}
            onPriorities={() => setScreen("priorities")}
            onReset={handleReset}
          />
        )}
        {screen === "priorities" && (
          <PrioritiesScreen results={results} onBack={() => setScreen("result")} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}

// ---------- UI: ОБЩЕЕ ---------------------------------------

function Header() {
  return (
    <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center">
          <div className="w-3 h-3 bg-indigo-400 rounded-sm" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide text-slate-50">Диагностика зрелости HR-системы</div>
          <div className="text-xs text-slate-500">Самодиагностика зрелости HR-процессов</div>
        </div>
      </div>
      <div className="text-xs text-slate-500 hidden sm:block">ВКР · 2026</div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-slate-900 border border-slate-800 rounded-lg ${className}`}>{children}</div>;
}

function Button({ children, onClick, variant = "primary", disabled = false, className = "" }) {
  const base = "px-5 py-2.5 rounded text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-indigo-500 hover:bg-indigo-400 text-white disabled:bg-slate-700 disabled:text-slate-500",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    ghost: "text-slate-400 hover:text-slate-200",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

function LevelBadge({ level, size = "md" }) {
  const c = LEVEL_COLORS[level];
  const sizes = { sm: "text-xs px-2 py-0.5", md: "text-xs px-2.5 py-1", lg: "text-sm px-3 py-1.5" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded ${c.bg} border ${c.border} ${c.text} ${sizes[size]} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      Уровень {level}
    </span>
  );
}

// ---------- ЭКРАН 0: СТАРТ ----------------------------------

function StartScreen({ onStart }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <div className="text-xs uppercase tracking-widest text-indigo-400 mb-4">Версия для консалтинговых компаний 50–300 человек</div>
        <h1 className="text-4xl sm:text-5xl font-semibold text-slate-50 leading-tight mb-6">
          Самодиагностика<br />
          зрелости HR-системы
        </h1>
        <p className="text-slate-400 leading-relaxed mb-6 max-w-xl">
          Инструмент оценивает пять блоков HR-процессов через два компонента: описание процесса (К1)
          и управление по данным (К2). По итогам — профиль зрелости, диагноз по каждому блоку
          и приоритеты на ближайший месяц, квартал и полгода.
        </p>
        <div className="flex items-center gap-4 mb-10">
          <Button onClick={onStart}>Начать диагностику</Button>
          <span className="text-xs text-slate-500">~15–20 минут</span>
        </div>

        <div className="text-xs text-slate-500 leading-relaxed max-w-xl border-l-2 border-slate-800 pl-4">
          Это не полная проверка HR-системы, а инструмент предварительной самодиагностики. Результат
          зависит от достоверности введённых данных и не заменяет независимую оценку. Калькулятор не
          считает финансовый эффект в рублях.
        </div>
      </div>

      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">Что оценивается</div>
          <ol className="space-y-3">
            {BLOCKS.map((b, i) => (
              <li key={b.id} className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-xs flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-200 leading-relaxed">{b.title}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 leading-relaxed">
            Формула блока: <span className="text-slate-300">Б = 0,4 × К1 + 0,6 × К2</span>.
            Повышенный вес К2 — потому что зрелый процесс должен не только существовать в виде регламента,
            но и измеряться.
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- ЭКРАН 1: ДИАГНОСТИКА ----------------------------

function DiagnosticScreen({ step, state, updateAnswer, updateMetric, onNext, onBack, showValidation, issues }) {
  const block = BLOCKS[step];
  const blockState = state[block.id];
  const isLast = step === BLOCKS.length - 1;

  return (
    <div>
      <StepperBar step={step} total={BLOCKS.length} />

      <div className="flex items-baseline justify-between mb-2 mt-8">
        <div className="text-xs uppercase tracking-widest text-indigo-400">
          Блок {step + 1} из {BLOCKS.length}
        </div>
        <div className="text-xs text-slate-500">{block.short}</div>
      </div>
      <h2 className="text-3xl font-semibold text-slate-50 mb-8">{block.title}</h2>

      <Card className="p-6 sm:p-8 mb-6">
        <div
          className="text-xs uppercase tracking-widest text-slate-500 mb-1"
          title="В методике это К1. Оценивает, насколько процесс зафиксирован: есть ли порядок действий, роли и контрольные точки."
        >
          К1. Регламентация процесса
        </div>
        <div className="text-sm text-slate-400 mb-4">Оцените каждое утверждение по шкале от 1 до 4.</div>

        <ScaleLegend />

        <div className="space-y-5 mt-6">
          {block.questions.map((q, i) => (
            <QuestionRow
              key={i}
              text={q}
              helper={block.questionHelpers?.[i]}
              value={blockState.questions[i]}
              onChange={(v) => updateAnswer(block.id, i, v)}
              showError={showValidation && blockState.questions[i] === null}
            />
          ))}
        </div>
      </Card>

      <Card className="p-6 sm:p-8 mb-8">
        <div
          className="text-xs uppercase tracking-widest text-slate-500 mb-1"
          title="В методике это К2. Оценивает, измеряется ли процесс, есть ли ответственный за показатель и обсуждается ли он регулярно."
        >
          К2. Управление по данным
        </div>
        <div className="text-sm text-slate-400 mb-6">
          Для каждого показателя выберите, как с ним работают в компании. Если значение известно — введите его,
          отметьте ответственного и регулярное обсуждение.
        </div>

        <div className="space-y-6">
          {block.metrics.map((m) => (
            <MetricRow
              key={m.id}
              metric={m}
              state={blockState.metrics[m.id]}
              onChange={(patch) => updateMetric(block.id, m.id, patch)}
              showError={
                showValidation &&
                !m.auto &&
                (blockState.metrics[m.id].trackingState === null ||
                  (blockState.metrics[m.id].trackingState === "tracked_with_value" && blockState.metrics[m.id].value === ""))
              }
            />
          ))}
        </div>
      </Card>

      {showValidation && (
        <div className="mb-6 text-sm text-orange-300 bg-orange-500/10 border border-orange-500/30 rounded px-4 py-3">
          Чтобы продолжить, заполните оставшиеся пункты этого блока.
          {(issues.unansweredQuestions > 0 || issues.unfilledMetrics > 0) && (
            <div className="text-xs text-orange-300/80 mt-1">
              {issues.unansweredQuestions > 0 && <>Не отвечено вопросов: {issues.unansweredQuestions}. </>}
              {issues.unfilledMetrics > 0 && <>Не заполнено показателей: {issues.unfilledMetrics}.</>}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={onBack}>
          ← Назад
        </Button>
        <Button onClick={onNext}>{isLast ? "Получить результат →" : "Далее →"}</Button>
      </div>
    </div>
  );
}

function StepperBar({ step, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === step;
        const isDone = i < step;
        return (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${isDone ? "bg-indigo-400 w-full" : isActive ? "bg-indigo-500 w-full" : "w-0"}`}
            />
          </div>
        );
      })}
    </div>
  );
}

function ScaleLegend() {
  return (
    <div className="rounded border border-slate-800 bg-slate-950/50 p-4">
      <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Шкала 1–4</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCALE_LEGEND.map((s) => {
          const c = LEVEL_COLORS[s.level];
          return (
            <div key={s.level} className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-7 h-7 rounded ${c.bg} border ${c.border} ${c.text} flex items-center justify-center text-xs font-semibold`}>
                {s.level}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-200 font-medium">{s.label}</div>
                <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{s.description}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-slate-500 italic mt-3 pt-3 border-t border-slate-800 leading-relaxed">
        Каждый следующий уровень включает предыдущий. Уровень 4 означает, что процесс не только закреплён,
        но и улучшается по данным.
      </div>
    </div>
  );
}

function QuestionRow({ text, helper, value, onChange, showError }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 items-start py-4 border-b border-slate-800 last:border-b-0 ${showError ? "bg-red-500/5 -mx-2 px-2 rounded" : ""}`}>
      <div className="lg:col-span-7 pt-1">
        <div className="text-sm text-slate-200 leading-relaxed">{text}</div>
        {helper && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-400 font-medium">Что оцениваем: </span>
              {helper.check}
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-400 font-medium">Как поставить 3–4: </span>
              {helper.howToRate}
            </div>
          </div>
        )}
      </div>
      <div className="lg:col-span-5 flex gap-2">
        {[1, 2, 3, 4].map((v) => {
          const selected = value === v;
          return (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={`flex-1 py-2 rounded text-xs border transition-colors duration-150 ${
                selected
                  ? "bg-indigo-500 border-indigo-400 text-white font-medium"
                  : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
              title={`${K1_LABELS[v]} — ${K1_DESCRIPTIONS[v]}`}
            >
              <div className="font-semibold">{v}</div>
              <div className="text-[10px] mt-0.5 leading-tight">{shortK1Label(v)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricRow({ metric, state, onChange, showError }) {
  if (metric.auto) {
    return (
      <div className="rounded border border-slate-800 bg-slate-950/50 p-4">
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <div className="text-sm font-medium text-slate-200">{metric.title}</div>
          <div className="text-xs text-slate-500 flex-shrink-0">Цель: {formatTarget(metric)}</div>
        </div>
        <div className="text-xs text-slate-500 leading-relaxed mb-2">
          <span className="text-slate-400 font-medium">Что это значит: </span>
          {metric.description}
        </div>
        <div className="text-xs text-slate-500 leading-relaxed italic pt-2 border-t border-slate-800">
          Этот показатель рассчитывается автоматически — само отсутствие данных является диагностическим сигналом.
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded border ${showError ? "border-red-500/40 bg-red-500/5" : "border-slate-800 bg-slate-950/50"} p-4`}>
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <div className="text-sm font-medium text-slate-200">{metric.title}</div>
        <div className="text-xs text-slate-500 flex-shrink-0">Цель: {formatTarget(metric)}</div>
      </div>

      {metric.description && (
        <div className="text-xs text-slate-500 leading-relaxed mb-4">
          <span className="text-slate-400 font-medium">Что это значит: </span>
          {metric.description}
        </div>
      )}

      <div className="mb-3">
        <div className="text-xs text-slate-400 font-medium mb-2">Как компания работает с этим показателем</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TRACKING_OPTIONS.map((opt) => {
            const selected = state.trackingState === opt.val;
            return (
              <button
                key={opt.val}
                onClick={() => {
                  if (opt.val === "tracked_with_value") {
                    onChange({ trackingState: opt.val });
                  } else {
                    onChange({ trackingState: opt.val, value: "", hasOwner: false, isReviewed: false });
                  }
                }}
                className={`text-left px-3 py-2.5 rounded text-xs border transition-colors duration-150 ${
                  selected
                    ? "bg-indigo-500 border-indigo-400 text-white"
                    : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className={`text-[11px] mt-1 leading-snug ${selected ? "text-indigo-100" : "text-slate-500"}`}>
                  {opt.caption}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {state.trackingState === "tracked_with_value" && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Текущее значение ({metric.unit})</label>
            <input
              type="number"
              step="0.1"
              value={state.value}
              onChange={(e) => onChange({ value: e.target.value })}
              placeholder="0"
              className="w-full sm:w-1/3 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.hasOwner}
                  onChange={(e) => onChange({ hasOwner: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs text-slate-300">Есть ответственный за показатель</span>
              </label>
              <div className="text-[11px] text-slate-500 leading-relaxed mt-1 ml-6">
                Ответственный следит за точностью значения, обновляет его и обращает внимание руководителей на отклонения.
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.isReviewed}
                  onChange={(e) => onChange({ isReviewed: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs text-slate-300">Показатель обсуждается на встречах</span>
              </label>
              <div className="text-[11px] text-slate-500 leading-relaxed mt-1 ml-6">
                Отмечайте, если показатель обсуждается не реже раза в квартал и по нему принимаются решения.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTarget(metric) {
  if (metric.direction === "range_is_best") return `${metric.target[0]}–${metric.target[1]} ${metric.unit}`;
  if (metric.direction === "lower_is_better") return `≤ ${metric.target} ${metric.unit}`;
  return `≥ ${metric.target} ${metric.unit}`;
}

// ---------- ЭКРАН 2: РЕЗУЛЬТАТ ------------------------------

function buildConclusion(results) {
  const allMature = results.every((r) => r.level >= 3);
  const weakCount = results.filter((r) => r.level <= 2).length;
  const analytics = results.find((r) => r.blockId === "analytics");
  const analyticsWeak = analytics && analytics.level <= 2;

  let main;
  if (allMature) {
    main =
      "HR-система выглядит достаточно зрелой: основные процессы закреплены, а часть из них управляется по данным. Главная задача — удерживать регулярность измерений и проверять, дают ли изменения управленческий эффект.";
  } else if (weakCount <= 2) {
    main =
      "Профиль зрелости в целом рабочий, но есть отдельные разрывы. В первую очередь стоит заняться блоками с уровнем 1–2: именно они ограничивают развитие остальных HR-процессов.";
  } else {
    main =
      "HR-система пока опирается преимущественно на практику отдельных людей. Главная задача — зафиксировать базовые процессы, назначить ответственных и начать регулярный сбор ключевых показателей.";
  }

  const analyticsNote = analyticsWeak
    ? "Низкая зрелость HR-аналитики ограничивает проверку любых изменений: без данных сложно понять, какие меры действительно улучшают найм, адаптацию и удержание."
    : null;

  return { main, analyticsNote };
}

function ResultScreen({ results, onBack, onPriorities, onReset }) {
  const overall = results.reduce((s, r) => s + r.cappedScore, 0) / results.length;
  const overallLevel = defineLevel(overall);
  const sorted = [...results].sort((a, b) => b.cappedScore - a.cappedScore);
  const strongest = sorted[0];
  const riskiest = sorted[sorted.length - 1];

  const radarData = results.map((r) => ({
    block: r.block.short,
    score: Number(r.cappedScore.toFixed(2)),
    fullMark: 4,
  }));

  const { main, analyticsNote } = buildConclusion(results);

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-indigo-400 mb-2">Результат диагностики</div>
      <h2 className="text-3xl font-semibold text-slate-50 mb-8">Профиль зрелости HR-системы</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Общий уровень</div>
            <div className="flex items-baseline gap-3 mb-1">
              <div className="text-5xl font-semibold text-slate-50">{overall.toFixed(2)}</div>
              <div className="text-sm text-slate-500">из 4,00</div>
            </div>
            <div className="mb-4">
              <LevelBadge level={overallLevel} size="md" />
            </div>
            <div className="text-xs text-slate-500 leading-relaxed mb-6 pb-4 border-b border-slate-800">
              Итоговая оценка показывает среднюю зрелость пяти HR-блоков. Чем ближе к 4,
              тем больше процессов не только описаны, но и управляются по данным.
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Самый сильный блок</div>
                <div className="text-sm text-slate-200">{strongest.block.title}</div>
                <div className="text-xs text-emerald-300 mt-0.5">Итоговая оценка {strongest.cappedScore.toFixed(2)} · уровень {strongest.level}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Самый рискованный блок</div>
                <div className="text-sm text-slate-200">{riskiest.block.title}</div>
                <div className="text-xs text-red-300 mt-0.5">Итоговая оценка {riskiest.cappedScore.toFixed(2)} · уровень {riskiest.level}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-6 h-full">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Профиль по блокам</div>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="block" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 4]} tickCount={5} tick={{ fill: "#64748b", fontSize: 10 }} stroke="#334155" />
                  <Radar name="Балл" dataKey="score" stroke="#818cf8" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed mt-3 pt-3 border-t border-slate-800">
              Чем дальше точка от центра, тем выше зрелость блока. Провалы на диаграмме показывают зоны,
              которые ограничивают развитие всей HR-системы.
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6 mb-6">
        <div className="text-sm text-slate-300 leading-relaxed">{main}</div>
        {analyticsNote && (
          <div className="text-sm text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-800">{analyticsNote}</div>
        )}
      </Card>

      <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Детализация по блокам</div>
      <div className="text-xs text-slate-500 leading-relaxed mb-4 max-w-3xl">
        Описание — насколько процесс закреплён. Данные — насколько процесс измеряется. Итог — общая оценка блока.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {results.map((r) => (
          <BlockResultCard key={r.blockId} result={r} />
        ))}
      </div>

      <FinancialBlock />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
        <Button variant="secondary" onClick={onBack}>
          ← К диагностике
        </Button>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="text-xs text-slate-500 leading-relaxed max-w-xl sm:text-right">
            На основе профиля зрелости инструмент формирует дорожную карту приоритетных улучшений по горизонтам: месяц, квартал, полгода.
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onReset}>
              Начать заново
            </Button>
            <Button onClick={onPriorities}>Открыть дорожную карту →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockResultCard({ result }) {
  const { block, k1, k2, cappedScore, level, autoNoDataShare } = result;
  const rec = RECOMMENDATIONS[block.id][level];
  const c = LEVEL_COLORS[level];

  return (
    <Card className={`p-5 border-l-2 ${c.border}`}>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-slate-100">{block.title}</h3>
        <LevelBadge level={level} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="bg-slate-950/50 border border-slate-800 rounded px-3 py-2">
          <div className="text-slate-500 mb-0.5">Описание</div>
          <div className="text-slate-100 font-semibold">{k1.toFixed(2)}</div>
        </div>
        <div className="bg-slate-950/50 border border-slate-800 rounded px-3 py-2">
          <div className="text-slate-500 mb-0.5">Данные</div>
          <div className="text-slate-100 font-semibold">{k2.toFixed(2)}</div>
        </div>
        <div className={`${c.bg} border ${c.border} rounded px-3 py-2`}>
          <div className="text-slate-500 mb-0.5">Итог</div>
          <div className={`font-semibold ${c.text}`}>{cappedScore.toFixed(2)}</div>
        </div>
      </div>

      <div className="text-sm text-slate-300 leading-relaxed">{rec.diagnosis}</div>

      {autoNoDataShare !== null && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
          Доля показателей, по которым нет данных: <span className="text-slate-300">{autoNoDataShare.toFixed(0)}%</span>
        </div>
      )}
    </Card>
  );
}

function FinancialBlock() {
  const zones = [
    "Снижение затрат на повторное закрытие вакансий.",
    "Ускорение выхода новичков на проектную загрузку.",
    "Снижение потерь от перегрузки сотрудников.",
    "Снижение риска добровольного ухода.",
    "Повышение полноты управленческих данных.",
  ];

  return (
    <Card className="p-6">
      <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Зоны потенциального финансового эффекта</div>
      <p className="text-sm text-slate-300 leading-relaxed mb-5 max-w-3xl">
        Калькулятор не показывает финансовый эффект в рублях, потому что для расчёта нужны внутренние данные
        компании: стоимость найма, уровень вознаграждения, загрузка проектных команд, ставка реализации
        сотрудников и маржинальность проектов. Вместо суммы инструмент показывает, где при росте зрелости
        HR-процессов может возникнуть экономический эффект.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {zones.map((z, i) => (
          <div key={i} className="bg-slate-950/50 border border-slate-800 rounded p-3">
            <div className="text-xs text-indigo-400 font-semibold mb-1">0{i + 1}</div>
            <div className="text-xs text-slate-300 leading-relaxed">{z}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------- ЭКРАН 3: ПРИОРИТЕТЫ ------------------------------

function PrioritiesScreen({ results, onBack, onReset }) {
  const enriched = results.map((r) => {
    const rec = RECOMMENDATIONS[r.block.id][r.level];
    const exec = rec.horizon === "1 месяц" ? 3 : rec.horizon === "квартал" ? 2 : 1;
    const priority = (4 - r.cappedScore) * r.block.cascade * r.block.urgency * exec;
    return { ...r, rec, priority };
  });

  const groups = {
    "1 месяц": { label: "Начать в ближайший месяц", caption: "Аварийные меры для блоков 1-го уровня.", limit: 3 },
    "квартал": { label: "Системные меры на квартал", caption: "Системные меры для блоков 2-го и 3-го уровней.", limit: 3 },
    "полгода": { label: "Развитие на полгода", caption: "Развитие для блоков, уже выведенных на 4-й уровень.", limit: 3 },
  };

  const grouped = Object.keys(groups).reduce((acc, h) => {
    acc[h] = enriched
      .filter((r) => r.rec.horizon === h)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, groups[h].limit);
    return acc;
  }, {});

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-indigo-400 mb-2">Приоритеты действий</div>
      <h2 className="text-3xl font-semibold text-slate-50 mb-2">Дорожная карта изменений</h2>
      <p className="text-sm text-slate-400 mb-8 max-w-3xl">
        Действия отсортированы по управленческой важности: выше показываются блоки с более низкой зрелостью,
        большим влиянием на другие HR-процессы и возможностью начать изменения без длительной подготовки.
      </p>

      {Object.keys(groups).map((h) => (
        <PriorityGroup
          key={h}
          label={groups[h].label}
          caption={groups[h].caption}
          items={grouped[h]}
        />
      ))}

      <div className="flex items-center justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>
          ← К результату
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Начать заново
        </Button>
      </div>
    </div>
  );
}

function PriorityGroup({ label, caption, items }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-lg font-semibold text-slate-100">{label}</h3>
        <div className="text-xs text-slate-500">
          {items.length} {items.length === 1 ? "блок" : (items.length >= 2 && items.length <= 4) ? "блока" : "блоков"}
        </div>
      </div>
      <div className="text-xs text-slate-500 mb-4">{caption}</div>

      {items.length === 0 ? (
        <div className="text-sm text-slate-500 bg-slate-900 border border-slate-800 border-dashed rounded p-5 text-center">
          На этом горизонте отдельных действий не требуется.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <PriorityCard key={it.blockId} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}

function PriorityCard({ item }) {
  const c = LEVEL_COLORS[item.level];
  const pLabel = priorityLabel(item.priority);
  return (
    <Card className={`p-5 border-l-2 ${c.border} h-full flex flex-col`}>
      <div className={`text-[10px] uppercase tracking-widest ${c.text} mb-2`}>{pLabel}</div>
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <div className="text-sm font-semibold text-slate-100">{item.block.title}</div>
        <LevelBadge level={item.level} size="sm" />
      </div>
      <div className="text-xs text-slate-500 mb-3 leading-relaxed">{item.rec.diagnosis}</div>
      <ol className="space-y-2 mt-auto">
        {item.rec.actions.map((a, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-200 leading-relaxed">
            <span className={`text-xs font-semibold mt-0.5 ${c.text}`}>{i + 1}.</span>
            <span>{a}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
