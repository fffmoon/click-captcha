/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-05 19:12:54
 * @LastEditTime: 2025-07-24 14:37:02
 */

export interface CaptchaOptions {
  /**
   * 图片
   */
  dimensions?: {
    /** 图片宽度（像素） @default 300 */
    width?: number;
    /** 图片高度（像素） @default 150 */
    height?: number;
    /** 点击区域边距 @default 40 */
    padding?: number;
  };

  /**
   * 字体样式配置
   */
  font?: {
    /** 基础字号（像素） @default 30 */
    fontSize?: number;
    /** 字体路径 */
    fontPath?: string;
  };

  /**
   * 安全验证配置
   */
  security?: {
    /** 允许的坐标误差范围（像素） @default 25 @min 10 */
    clickTolerance?: number;
    /** 生成位置最大尝试次数 @default 100 */
    positionGenerationAttempts?: number;
  };

  /**
   * 字符配置
   */
  characters?: {
    /** 字符数量 @min 1 @default 3 */
    count?: number;
    /** 字符集（至少10个字符） @example 'ABCEFGHKMNPR' */
    pool?: string;
    /** 最小字符间距（字号倍数） @min 1 @default 1.5 */
    minSpacing?: number;
  };

  /**
   * 图片效果配置
   */
  effects?: {
    /** 干扰线数量 @min 0 @max 10 @default 3 */
    noiseLines?: number;
    /** 启用彩色模式 @default true */
    colorEnabled?: boolean;
    /** 背景颜色 @default '#f0f0f0' */
    backgroundColor?: string;
  };

  /**
   * 提示图配置
   */
  hint?: {
    dimensions?: {
      /** 宽度 @default 150 */
      width?: number;
      /** 高度 @default 40 */
      height?: number;
    };
    font?: {
      /** 基础字号（像素） @default 30 */
      fontSize?: number;
      /** 字体族 @default 'Arial' */
      family?: string;
      /** 字符间距 @default 26 */
      spacing?: number;
      /** 字体路径 */
      fontPath?: string;
    };
  };
}

export interface RequiredCaptchaOptions {
  dimensions: {
    width: number;
    height: number;
    padding: number;
  };
  font: {
    fontSize: number;
    fontPath: string;
  };
  security: {
    clickTolerance: number;
    positionGenerationAttempts: number;
  };
  characters: {
    count: number;
    pool: string;
    minSpacing: number;
  };
  effects: {
    noiseLines: number;
    colorEnabled: boolean;
    backgroundColor: string;
  };
  hint: {
    dimensions: {
      width: number;
      height: number;
    };
    font: {
      fontSize: number;
      spacing: number;
      fontPath: string;
    };
  };
}

export interface CaptchaResult {
  imageBase64: string;
  hintBase64: string;
  verificationPoints: VerificationPoint[];
}

export interface VerificationPoint {
  char: string;
  coordinates: Coordinate;
}

export interface Coordinate {
  x: number;
  y: number;
}
