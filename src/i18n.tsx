import { createInstance } from 'i18next';
import { useEffect, useMemo, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import type {
  CaptureTheFlagI18nMode,
  CaptureTheFlagLocale,
  NormalizedCaptureTheFlagLocale
} from './types';

const zhCN = {
  common: { processing: '处理中' },
  dashboard: {
    sidebar: { dashboard: '控制台', overview: '备战室', captureTheFlag: '夺旗模式', teams: '团队列表', recentBattles: '最近战斗' },
    mode: { captureTheFlag: '夺旗' },
    battleType: { practice: '练习赛', ranked: '排位赛' },
    status: { pending: '等待中', running: '进行中', done: '已完成', error: '异常', canceled: '已取消' },
    result: { win: '胜利', loss: '失败', draw: '平局', unresolved: '未结算' },
    active: { waiting: '等待结果' },
    actions: { viewReplay: '战斗回放' },
    recent: { vsSeparator: 'vs', replayUnavailable: '暂无战斗回放', ratingDelta: '积分 {{delta}}' },
    challenge: { challenger: '挑战对方', target: '他人挑战', revenge: '一键复仇' },
    matchLabel: {
      randomMatch: '随机匹配',
      systemMatch: '系统匹配',
      directChallengeStarted: '挑战对方',
      directChallengeReceived: '他人挑战'
    },
    matchLabelTooltip: {
      practiceRandomStarted: '我发起了这场练习赛',
      rankedRandomStarted: '我发起了这场排位赛',
      rankedSystemMatched: '别的玩家匹配到了我',
      directChallengeStarted: '我发起了指定挑战练习赛',
      directChallengeReceived: '别的玩家发起了指定挑战练习赛'
    },
    records: {
      pageAria: 'AgentDuel 夺旗对战记录',
      kicker: 'battle records',
      title: '对战记录',
      modeTitle: '最近战斗',
      fixedModeCopy: '仅显示夺旗对局；可继续按对局类型和胜负筛选。',
      filterButton: '筛选',
      filterButtonWithCount: '筛选 {{count}}',
      filterMenuAria: '筛选对战记录',
      activeFiltersAria: '当前对战记录筛选',
      challengeRole: { challenger: '挑战对方', target: '他人挑战' },
      clearFilters: '清除全部',
      applyFilters: '确定',
      cancelFilters: '取消',
      removeFilter: '移除 {{label}}',
      loadFailed: '对战记录暂时无法加载，请稍后重试。',
      empty: '还没有对战记录。开始一场练习赛或排位赛后会显示在这里。',
      emptyFiltered: '当前筛选下没有对战记录。',
      loadMore: '加载更多',
      loadingMore: '加载中',
      loadingTexts: [
        '正在读取最近的对战记录',
        '按时间整理战斗轨迹',
        '同步排位和练习赛结果',
        '确认哪些战斗已经生成战斗回放'
      ]
    },
    modePage: {
      breadcrumbAria: '备战室位置导航',
      teamsCopy: '按最近有效参战时间排列。团队需要有效自定义代码才能参与夺旗对战。',
      compiling: '正在编译',
      status: '状态',
      record: '排位胜/平/负',
      unknownModel: '未标注模型'
    },
    attention: { title: '需要处理' },
    submission: {
      pending_compile: '等待编译',
      compiling: '编译中',
      compile_failed: '编译失败',
      rejected: '已拒绝'
    },
    remediation: {
      status: {
        name_violation: '名称待整改',
        description_violation: '简介待整改',
        all_violation: '资料待整改',
        suspended: '已停用'
      }
    },
    teams: {
      create: '新建队伍',
      openDetail: '查看队伍 {{name}}',
      empty: '还没有夺旗队伍。创建队伍并提交团队 Agent 后即可开战。'
    },
    codeSource: { none: '未提交代码' },
    stats: { rating: '积分' },
    error: { retry: '重新加载' }
  },
  battleMap: {
    previewUnavailable: '地图预览暂不可用。',
    names: {
      default_arena: '基础地图',
      four_corners_ruins: '四隅遗迹',
      bannerhold_heights: '王旗高台'
    },
    descriptions: {
      captureTheFlag: {
        default_arena: '遗迹、池塘与草丛交错的经典战场，路线清晰，也为伏击和绕行留足空间。',
        four_corners_ruins: '开阔遗迹中的旗帜会在四周随机出现，双方必须随时调整争夺方向。',
        bannerhold_heights: '双方从高台两翼向王旗进发，在狭窄通路与中央草丛间争夺主动权。'
      }
    }
  },
  replay: {
    class: { warrior: '战士', mage: '法师', hunter: '猎人' }
  },
  teams: {
    create: {
      pageAria: '新建夺旗队伍',
      breadcrumbAria: '新建队伍导航',
      loading: '正在读取队伍槽位',
      kicker: 'capture the flag setup',
      title: '新建夺旗队伍',
      copy: '选择两个夺旗槽位的职业组合，并创建一支由 TeamAgent 驱动的 2v2 队伍。',
      slotsAria: '队伍槽位',
      remainingSlots: '剩余槽位',
      compositionTitle: '选择槽位职业',
      slotLabel: '槽位 {{slot}}',
      full: {
        title: '队伍槽位已满',
        copy: '当前账号没有可用队伍槽位。删除不再使用的队伍后，才能继续创建新的夺旗队伍。',
        backToDashboard: '返回备战室'
      },
      form: {
        kicker: 'team record',
        title: '队伍资料',
        nameLabel: '队伍名称',
        namePlaceholder: '例如 Flag Ops',
        nameHelp: '{{count}}/{{max}}',
        nameImmutableHelp: '队伍名称创建后不允许修改。',
        create: '创建队伍',
        creating: '创建中',
        errors: {
          invalidName: '队伍名称必须为 1-30 个字符。',
          missingClasses: '请选择两个槽位的职业。',
          submitFailed: '队伍创建失败，请稍后重试。'
        }
      },
      error: {
        kicker: 'team',
        title: '新建队伍页无法加载',
        copy: '检查登录状态、网络或后端服务后重新加载。',
        retry: '重新加载'
      }
    },
    detail: {
      loading: '正在读取队伍详情',
      error: {
        kicker: 'team',
        title: '队伍详情无法加载',
        copy: '队伍不存在、无权访问，或当前登录状态已失效。',
        retry: '重新加载'
      }
    },
    edit: {
      pageAria: '编辑团队资料',
      breadcrumbAria: '编辑队伍导航',
      kicker: 'team profile',
      title: '编辑团队资料',
      copy: '通常只能调整公开简介；名称被标记需要整改时会临时开放修改。',
      formTitle: '资料设置',
      nameLabel: '队伍名称',
      nameImmutableHelp: '队伍名称创建后不允许修改。',
      nameRemediationHelp: '请输入与当前名称不同的新名称。',
      descriptionLabel: '队伍介绍',
      descriptionHelp: '{{count}}/300',
      cancel: '取消',
      save: '保存简介',
      submitRemediation: '提交整改内容',
      saving: '保存中',
      requiredNotice: '公开资料存在违规项，请修改被标记的字段后提交。',
      submittedNotice: '修改已提交，正在等待管理员审核；等待期间仍可再次修改。',
      suspendedNotice: '该团队已停用，不能通过此页面解除。',
      errors: {
        invalidOrUnchangedName: '请输入符合规则且与当前名称不同的新名称。',
        unchangedDescription: '请输入与当前简介不同的新简介。',
        invalidDescription: '队伍介绍不能超过 300 个字符。',
        saveFailed: '队伍介绍保存失败，请稍后重试。'
      }
    }
  }
};

const enUS = {
  common: { processing: 'Processing' },
  dashboard: {
    sidebar: { dashboard: 'Dashboard', overview: 'Overview', captureTheFlag: 'Capture the Flag', teams: 'Team list', recentBattles: 'Recent battles' },
    mode: { captureTheFlag: 'Capture the Flag' },
    battleType: { practice: 'Practice', ranked: 'Ranked' },
    status: { pending: 'Pending', running: 'Running', done: 'Done', error: 'Error', canceled: 'Canceled' },
    result: { win: 'Win', loss: 'Loss', draw: 'Draw', unresolved: 'Unresolved' },
    active: { waiting: 'Waiting' },
    actions: { viewReplay: 'Watch replay' },
    recent: { vsSeparator: 'vs', replayUnavailable: 'No replay', ratingDelta: 'Rating {{delta}}' },
    challenge: { challenger: 'Challenge opponent', target: 'Challenged by others', revenge: 'Revenge' },
    matchLabel: {
      randomMatch: 'Random match',
      systemMatch: 'System match',
      directChallengeStarted: 'Challenged target',
      directChallengeReceived: 'Other player challenge'
    },
    matchLabelTooltip: {
      practiceRandomStarted: 'I started this practice battle',
      rankedRandomStarted: 'I started this ranked battle',
      rankedSystemMatched: 'Another player matched with me',
      directChallengeStarted: 'I started this direct practice challenge',
      directChallengeReceived: 'Another player started this direct practice challenge'
    },
    records: {
      pageAria: 'AgentDuel capture-the-flag battle records',
      kicker: 'battle records',
      title: 'Battle records',
      modeTitle: 'Capture-the-flag recent battles',
      fixedModeCopy: 'Showing capture-the-flag battles only. Filter further by match type and result.',
      filterButton: 'Filter',
      filterButtonWithCount: 'Filter {{count}}',
      filterMenuAria: 'Filter battle records',
      activeFiltersAria: 'Current battle record filters',
      challengeRole: { challenger: 'Challenge opponent', target: 'Challenged by others' },
      clearFilters: 'Clear all',
      applyFilters: 'Apply',
      cancelFilters: 'Cancel',
      removeFilter: 'Remove {{label}}',
      loadFailed: 'Battle records could not load. Try again later.',
      empty: 'No battle records yet. Start a practice or ranked battle to see it here.',
      emptyFiltered: 'No battle records match the current filters.',
      loadMore: 'Load more',
      loadingMore: 'Loading',
      loadingTexts: [
        'Reading recent battle records',
        'Sorting battle traces by time',
        'Syncing ranked and practice results',
        'Checking which battles have replays'
      ]
    },
    modePage: {
      breadcrumbAria: 'Dashboard location navigation',
      teamsCopy: 'Ordered by last valid participation. A team needs an effective custom version to enter capture-the-flag battles.',
      compiling: 'Compiling',
      status: 'Status',
      record: 'Ranked W / D / L',
      unknownModel: 'Unspecified model'
    },
    attention: { title: 'Needs attention' },
    submission: {
      pending_compile: 'Waiting to compile',
      compiling: 'Compiling',
      compile_failed: 'Compilation failed',
      rejected: 'Rejected'
    },
    remediation: {
      status: {
        name_violation: 'Name change required',
        description_violation: 'Description change required',
        all_violation: 'Profile changes required',
        suspended: 'Suspended'
      }
    },
    teams: {
      create: 'New team',
      openDetail: 'View team {{name}}',
      empty: 'No capture-the-flag teams yet. Create a team and submit a team Agent to battle.'
    },
    codeSource: { none: 'No code submitted' },
    stats: { rating: 'Rating' },
    error: { retry: 'Reload' }
  },
  battleMap: {
    previewUnavailable: 'Map preview is unavailable.',
    names: {
      default_arena: 'Basic Map',
      four_corners_ruins: 'Four Corners Ruins',
      bannerhold_heights: 'Bannerhold Heights'
    },
    descriptions: {
      captureTheFlag: {
        default_arena: 'A classic battlefield where ruins, ponds, and thickets intertwine, with clear routes and plenty of room for ambushes and flanking maneuvers.',
        four_corners_ruins: 'The flag spawns at random around these open ruins, forcing both sides to keep shifting the direction of their attack.',
        bannerhold_heights: 'Both sides advance from the flanks toward the royal banner, fighting for initiative through narrow passages and the central thickets.'
      }
    }
  },
  replay: {
    class: { warrior: 'Warrior', mage: 'Mage', hunter: 'Hunter' }
  },
  teams: {
    create: {
      pageAria: 'New capture-the-flag team',
      breadcrumbAria: 'New team navigation',
      loading: 'Loading team slots',
      kicker: 'capture the flag setup',
      title: 'New capture-the-flag team',
      copy: 'Choose the class for each capture-the-flag slot, then create a 2v2 team driven by a TeamAgent.',
      slotsAria: 'Team slots',
      remainingSlots: 'Open slots',
      compositionTitle: 'Choose slot classes',
      slotLabel: 'Slot {{slot}}',
      full: {
        title: 'Team slots are full',
        copy: 'This account has no open team slots. Delete an unused team before creating another capture-the-flag team.',
        backToDashboard: 'Back to dashboard'
      },
      form: {
        kicker: 'team record',
        title: 'Team details',
        nameLabel: 'Team name',
        namePlaceholder: 'For example Flag Ops',
        nameHelp: '{{count}}/{{max}}',
        nameImmutableHelp: 'Team names cannot be changed after creation.',
        create: 'Create team',
        creating: 'Creating',
        errors: {
          invalidName: 'Team name must be 1 to 30 characters.',
          missingClasses: 'Choose a class for both team slots.',
          submitFailed: 'Could not create the team. Try again later.'
        }
      },
      error: {
        kicker: 'team',
        title: 'New team page could not load',
        copy: 'Check your session, network, or backend service, then reload.',
        retry: 'Reload'
      }
    },
    detail: {
      loading: 'Loading team detail',
      error: {
        kicker: 'team',
        title: 'Team detail could not load',
        copy: 'The team may not exist, may not belong to this account, or the session expired.',
        retry: 'Reload'
      }
    },
    edit: {
      pageAria: 'Edit team profile',
      breadcrumbAria: 'Edit team navigation',
      kicker: 'team profile',
      title: 'Edit team profile',
      copy: 'Normally only the public description can change. Name editing is temporarily unlocked when the name requires remediation.',
      formTitle: 'Profile settings',
      nameLabel: 'Team name',
      nameImmutableHelp: 'Team names cannot be changed after creation.',
      nameRemediationHelp: 'Enter a valid name that differs from the current name.',
      descriptionLabel: 'Team description',
      descriptionHelp: '{{count}}/300',
      cancel: 'Cancel',
      save: 'Save description',
      submitRemediation: 'Submit changes',
      saving: 'Saving',
      requiredNotice: 'This public profile has a flagged field. Change every required field before submitting.',
      submittedNotice: 'Your changes are awaiting administrator review. You can make further changes while you wait.',
      suspendedNotice: 'This team is suspended and cannot be restored from this page.',
      errors: {
        invalidOrUnchangedName: 'Enter a valid name that differs from the current name.',
        unchangedDescription: 'Enter a description that differs from the current description.',
        invalidDescription: 'Team description must not exceed 300 characters.',
        saveFailed: 'Could not save the team description. Try again later.'
      }
    }
  }
};

export function normalizeLocale(locale: CaptureTheFlagLocale): NormalizedCaptureTheFlagLocale {
  return locale === 'en-US' || locale === 'en_US' ? 'en-US' : 'zh-CN';
}

export function CaptureTheFlagI18nBoundary({
  children,
  locale,
  mode = 'bundled'
}: {
  children: ReactNode;
  locale: NormalizedCaptureTheFlagLocale;
  mode?: CaptureTheFlagI18nMode;
}) {
  const i18n = useMemo(() => {
    const instance = createInstance();
    void instance.use(initReactI18next).init({
      fallbackLng: 'zh-CN',
      initAsync: false,
      interpolation: { escapeValue: false },
      lng: locale,
      resources: {
        'zh-CN': { translation: zhCN },
        'en-US': { translation: enUS }
      }
    });
    return instance;
  }, []);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  return mode === 'host' ? children : <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
