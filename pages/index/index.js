const app = getApp()
const questions = require('../../data/questions.js')
const typeLibrary = require('../../data/typeLibrary.js')
const config = require('../../data/config.js')

Page({
  data: {
    currentScreen: 'intro',
    previewMode: false,
    answers: {},
    shuffledQuestions: [],
    visibleQuestions: [],
    progressPercent: 0,
    doneCount: 0,
    totalCount: 0,
    submitBtnDisabled: true,
    dimensionMeta: config.dimensionMeta,
    dimensionOrder: config.dimensionOrder,
    resultDiagnosis: {},
    resultImage: '',
    resultRawScores: {},
    resultLevels: {},
    modeKicker: '',
    matchBadge: '',
    resultSub: '',
    funNote: '',
    dimExplanations: config.dimExplanations
  },

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  getVisibleQuestions() {
    const visible = [...this.data.shuffledQuestions];
    const gateIndex = visible.findIndex(q => q.id === 'wy_gate_q1');
    if (gateIndex !== -1 && this.data.answers['wy_gate_q1'] === 3) {
      visible.splice(gateIndex + 1, 0, config.specialQuestions[1]);
    }
    return visible;
  },

  updateProgress() {
    const visibleQuestions = this.getVisibleQuestions();
    const total = visibleQuestions.length;
    const done = visibleQuestions.filter(q => this.data.answers[q.id] !== undefined).length;
    const percent = total ? (done / total) * 100 : 0;
    const complete = done === total && total > 0;
    
    this.setData({
      progressPercent: percent,
      doneCount: done,
      totalCount: total,
      submitBtnDisabled: !complete
    });
  },

  renderQuestions() {
    const visibleQuestions = this.getVisibleQuestions();
    this.setData({ visibleQuestions });
    this.updateProgress();
  },

  selectOption(e) {
    const { qid, value } = e.currentTarget.dataset;
    const answers = { ...this.data.answers };
    answers[qid] = value;

    if (qid === 'wy_gate_q1') {
      if (value !== 3) {
        delete answers['wy_gate_q2'];
      }
    }

    this.setData({ answers }, () => {
      if (qid === 'wy_gate_q1') {
        this.renderQuestions();
      } else {
        this.updateProgress();
      }
    });
  },

  sumToLevel(score) {
    if (score <= 3) return 'L';
    if (score === 4) return 'M';
    return 'H';
  },

  levelNum(level) {
    return { L: 1, M: 2, H: 3 }[level];
  },

  parsePattern(pattern) {
    return pattern.replace(/-/g, '').split('');
  },

  getLifetimeTriggered(levels) {
    return this.data.answers['wy_gate_q1'] === 3
      && this.data.answers['wy_gate_q2'] === 3
      && levels['E2'] === 'H';
  },

  computeResult() {
    const rawScores = {};
    const levels = {};
    const dims = Object.keys(config.dimensionMeta);
    dims.forEach(dim => { rawScores[dim] = 0; });

    questions.forEach(q => {
      rawScores[q.dim] += Number(this.data.answers[q.id] || 0);
    });

    Object.entries(rawScores).forEach(([dim, score]) => {
      levels[dim] = this.sumToLevel(score);
    });

    const dimensionOrder = config.dimensionOrder;
    const userVector = dimensionOrder.map(dim => this.levelNum(levels[dim]));
    
    const ranked = config.normalTypes.map(type => {
      const vector = this.parsePattern(type.pattern).map(l => this.levelNum(l));
      let distance = 0;
      let exact = 0;
      for (let i = 0; i < vector.length; i++) {
        const diff = Math.abs(userVector[i] - vector[i]);
        distance += diff;
        if (diff === 0) exact += 1;
      }
      const similarity = Math.max(0, Math.round((1 - distance / 24) * 100));
      return { ...type, ...typeLibrary[type.code], distance, exact, similarity };
    }).sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (b.exact !== a.exact) return b.exact - a.exact;
      return b.similarity - a.similarity;
    });

    const bestNormal = ranked[0];
    const lifetimeTriggered = this.getLifetimeTriggered(levels);

    let finalDiagnosis;
    let modeKicker = '您的工伤诊断';
    let badge = `匹配度 ${bestNormal.similarity}% · 精准命中 ${bestNormal.exact}/12 维`;
    let sub = '维度命中度较高，当前诊断结果可视为您的主要工伤类型。';
    let special = false;

    if (lifetimeTriggered) {
      finalDiagnosis = typeLibrary['LIFETIME'];
      modeKicker = '终身荣誉工伤已触发';
      badge = '匹配度 100% · 8年网易云老村民认证';
      sub = '您已在网抑云村生活太久，系统直接授予您终身荣誉工伤称号。';
      special = true;
    } else if (bestNormal.similarity < 60) {
      finalDiagnosis = typeLibrary['ALLERGY'];
      modeKicker = '系统强制兜底';
      badge = `标准工伤库最高匹配仅 ${bestNormal.similarity}%`;
      sub = '28种标准工伤都无法准确描述您的听歌习惯，系统判定您为"音乐过敏体质"。';
      special = true;
    } else {
      finalDiagnosis = bestNormal;
    }

    return { rawScores, levels, finalDiagnosis, modeKicker, badge, sub, special };
  },

  submitTest() {
    const result = this.computeResult();
    const diagnosis = result.finalDiagnosis;
    const imageSrc = config.typeImages[diagnosis.code];

    let funNote = '本测试仅供娱乐。工伤诊断只是玩笑，请不要当真。';
    if (result.special) {
      funNote = '本测试仅供娱乐。终身荣誉工伤和音乐过敏体质都是作者故意埋的彩蛋，请不要当真。';
    }

    this.setData({
      resultDiagnosis: diagnosis,
      resultImage: imageSrc || '',
      resultRawScores: result.rawScores,
      resultLevels: result.levels,
      modeKicker: result.modeKicker,
      matchBadge: result.badge,
      resultSub: result.sub,
      funNote: funNote,
      currentScreen: 'result'
    });

    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  startTest() {
    const shuffledRegular = this.shuffle(questions);
    const insertIndex = Math.floor(Math.random() * shuffledRegular.length) + 1;
    const shuffledQuestions = [
      ...shuffledRegular.slice(0, insertIndex),
      config.specialQuestions[0],
      ...shuffledRegular.slice(insertIndex)
    ];

    this.setData({
      previewMode: false,
      answers: {},
      shuffledQuestions: shuffledQuestions,
      currentScreen: 'test'
    }, () => {
      this.renderQuestions();
      wx.pageScrollTo({ scrollTop: 0, duration: 300 });
    });
  },

  backToIntro() {
    this.setData({ currentScreen: 'intro' });
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  restartTest() {
    this.startTest();
  }
})
