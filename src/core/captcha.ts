import { deepMerge, Random } from "../utils";
import { SvgBuilder } from "./svg-builder";
import * as sharp from "sharp";
import type {
  CaptchaOptions,
  RequiredCaptchaOptions,
  CaptchaResult,
  Coordinate,
  VerificationPoint,
} from "../types";
import { DEFAULT_OPTIONS } from "../const/options";

export class ClickCaptcha {
  private options: RequiredCaptchaOptions;

  constructor(options?: CaptchaOptions) {
    this.options = deepMerge(DEFAULT_OPTIONS, options || {});
    this.validateOptions();
  }

  private validateOptions() {
    const { characters } = this.options;
    if (!characters.pool || characters.pool.length < 10) {
      throw new Error("至少需要提供 10 个字符");
    }
    if (characters.pool.length < characters.count) {
      throw new Error("字符集长度小于生成的字符数量");
    }
  }

  /**
   * 生成随机位置
   */
  private getRandomPosition(
    existingPositions: Array<{ x: number; y: number }> = []
  ): { x: number; y: number } {
    const { dimensions, font, characters, security } = this.options;
    const minDistance = font.fontSize * characters.minSpacing;
    let attempts = 0;

    while (attempts < security.positionGenerationAttempts) {
      const x =
        dimensions.padding +
        Math.random() * (dimensions.width - 2 * dimensions.padding);
      const y =
        dimensions.padding +
        Math.random() * (dimensions.height - 2 * dimensions.padding);

      // 碰撞检测
      const isOverlap = existingPositions.some((pos) => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });

      if (!isOverlap) {
        return { x, y };
      }
      attempts++;
    }

    // 超过尝试次数则返回随机位置
    return {
      x:
        dimensions.padding +
        Math.random() * (dimensions.width - 2 * dimensions.padding),
      y:
        dimensions.padding +
        Math.random() * (dimensions.height - 2 * dimensions.padding),
    };
  }

  /**
   * 生成随机字符
   */
  private getRandomChar(existingChars: string[]): string {
    const { characters } = this.options;
    const allChars = characters.pool.split("");
    const filteredChars = allChars.filter(
      (char) => !existingChars.includes(char)
    );
    return filteredChars[Random.int(0, filteredChars.length)];
  }

  /**
   * @author Qing
   * @description 生成点击验证码
   * @return {Promise<CaptchaResult>} 验证码结果
   * @example
   * const captcha = new ClickCaptcha();
   * const { image, hint, data } = await captcha.generate();
   * @date 2025-02-14 10:21:01
   */
  public async generate(): Promise<CaptchaResult> {
    const { characters } = this.options;
    try {
      // 生成随机字符和位置
      const existingPositions: Array<{ x: number; y: number }> = [];
      const chars: VerificationPoint[] = [];
      Array.from({ length: characters.count }, () => {
        const char = this.getRandomChar(chars.map((c) => c.char));
        const pos = this.getRandomPosition(existingPositions);
        existingPositions.push(pos);
        chars.push({ char, coordinates: pos });
      });

      // 生成主图片并转换为base64
      const mainSvg = SvgBuilder.buildMain(chars, this.options);
      const mainBuffer = await sharp(Buffer.from(mainSvg)).png().toBuffer();
      const mainBase64 = `data:image/png;base64,${mainBuffer.toString(
        "base64"
      )}`;

      // 生成提示图片并转换为base64
      const hintSvg = SvgBuilder.buildHint(chars, this.options);
      const hintBuffer = await sharp(Buffer.from(hintSvg)).png().toBuffer();
      const hintBase64 = `data:image/png;base64,${hintBuffer.toString(
        "base64"
      )}`;

      return {
        imageBase64: mainBase64,
        hintBase64: hintBase64,
        verificationPoints: chars,
      };
    } catch (error) {
      throw new Error(`验证码生成失败: ${error}`);
    }
  }

  /**
   * @author Qing
   * @description 验证点击位置
   * @param {Coordinate[]} userPositions 用户点击位置
   * @param {VerificationPoint[]} verificationPoints 数据中的正确的验证码字符位置
   * @return {boolean} 是否验证通过
   * @date 2025-02-14 10:20:16
   */
  public verify(
    userPositions: Coordinate[],
    verificationPoints: VerificationPoint[]
  ): boolean {
    const { security, dimensions } = this.options;
    const tolerance = security.clickTolerance;
    if (userPositions.length !== verificationPoints.length) {
      return false;
    }

    console.info(
      new Date().toLocaleString(),
      "用户点击位置：",
      userPositions.map((p) => ({
        x: p.x * dimensions.width,
        y: p.y * dimensions.height,
      })),
      "验证码字符位置：",
      verificationPoints.map((p) => ({
        x: p.coordinates.x,
        y: p.coordinates.y,
      })),
      "正确信息：",
      verificationPoints.map((p) => ({
        x: p.coordinates.x / dimensions.width,
        y: p.coordinates.y / dimensions.height,
      }))
    );

    return userPositions.every((pos, index) => {
      const char = verificationPoints[index].coordinates;

      // 将百分比转换为原始坐标系的绝对位置
      const clickX = pos.x * dimensions.width;
      const clickY = pos.y * dimensions.height;

      const distance = Math.sqrt(
        Math.pow(clickX - char.x, 2) + Math.pow(clickY - char.y, 2)
      );
      const res = distance <= tolerance;
      if (!res) {
        console.info(
          `第${index + 1}个字符点击位置错误，正确位置：${char.x},${
            char.y
          }，点击位置：${clickX},${clickY}，距离：${distance}`
        );
      }
      return res;
    });
  }
}
