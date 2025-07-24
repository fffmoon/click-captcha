/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-13 16:14:09
 * @LastEditTime: 2025-07-24 14:44:30
 */
import { RequiredCaptchaOptions } from "../types";
import { DEFAULT_FONT_BASE64 } from "../const/font-base64";

export const DEFAULT_OPTIONS: RequiredCaptchaOptions = {
  dimensions: {
    width: 300,
    height: 150,
    padding: 40,
  },

  font: {
    fontSize: 30,
    fontPath: DEFAULT_FONT_BASE64,
  },

  security: {
    clickTolerance: 25,
    positionGenerationAttempts: 100,
  },

  characters: {
    count: 3,
    pool: "一二三四五六七八九十百千万上下左右中大小多少前后远近高矮胖瘦明暗快慢长短出入开关来去红黄蓝绿黑白方圆天地山水花草树木鸟兽鱼虫风雨雷电日月星辰父母子女兄弟姐妹你我他她它师生朋友吃喝玩乐坐立行走看听说读写学习思考工作睡觉休息喜怒哀乐吃喝拉撒衣食住行春夏秋冬东西南北中",
    minSpacing: 1.5,
  },

  effects: {
    noiseLines: 3,
    colorEnabled: true,
    backgroundColor: "#f0f0f0",
  },

  hint: {
    dimensions: {
      width: 150,
      height: 40,
    },
    font: {
      fontSize: 22,
      spacing: 30,
      fontPath: DEFAULT_FONT_BASE64,
    },
  },
};
