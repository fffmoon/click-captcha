/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-05 13:29:30
 * @LastEditTime: 2025-07-24 14:43:50
 */
import { Random } from "../utils/random";
import { RequiredCaptchaOptions, VerificationPoint } from "../types";
import * as opentype from "opentype.js";

const isDev = false;

export class SvgBuilder {
  private static font: opentype.Font | null = null;
  private static hintFont: opentype.Font | null = null;

  /**
   * 初始化字体
   */
  static initializeFont(path: string) {
    if (!this.font) {
      const fontData = Buffer.from(path, "base64");
      this.font = opentype.parse(fontData.buffer);
    }

    if (!this.hintFont) {
      const fontData = Buffer.from(path, "base64");
      this.hintFont = opentype.parse(fontData.buffer);
    }
  }

  /**
   * 生成干扰线
   */
  static generateNoiseLine(width: number, height: number): string {
    const start = `${Random.int(1, 21)} ${Random.int(1, height - 1)}`;
    const end = `${Random.int(width - 21, width - 1)} ${Random.int(
      1,
      height - 1
    )}`;
    const mid1 = `${Random.int(width / 2 - 21, width / 2 + 21)} ${Random.int(
      1,
      height - 1
    )}`;
    const mid2 = `${Random.int(width / 2 - 21, width / 2 + 21)} ${Random.int(
      1,
      height - 1
    )}`;
    const color = Random.color();

    return `<path d="M${start} C${mid1},${mid2},${end}" stroke="${color}" fill="none" opacity="0.5"/>`;
  }

  /**
   * 字符转路径
   */
  static charToPath(
    fontFamily: opentype.Font | null,
    char: string,
    fontSize: number
  ): { path: string; bbox: opentype.BoundingBox } {
    if (!fontFamily) {
      throw new Error("字体未初始化");
    }

    const path = fontFamily.getPath(char, 0, 0, fontSize);
    const bbox = path.getBoundingBox();
    return {
      path: path.toPathData(3),
      bbox,
    };
  }

  /**
   * 生成文字路径
   */
  static generateText(
    charData: { path: string; bbox: opentype.BoundingBox },
    centerX: number,
    centerY: number
  ): string {
    const { path, bbox } = charData;

    // 计算包围盒的尺寸
    const width = bbox.x2 - bbox.x1;
    const height = bbox.y2 - bbox.y1;

    // 计算偏移量（将左下角移动到中心）
    const offsetX = centerX - width / 2 - bbox.x1;
    const offsetY = centerY - height / 2 - bbox.y1;

    // 变形
    const rotate = Random.int(-30, 30);
    const skewX = Random.int(-30, 30);
    const scaleX = Random.float(0.8, 1.2);
    const scaleY = Random.float(0.8, 1.2);
    /* const rotate = 0;
    const skewX = 0;
    const scaleX = 1;
    const scaleY = 1; */

    // 随机颜色
    const fillColor = Random.color();
    const strokeColor = Random.color();

    // 应用变换矩阵
    return `
      <g transform="
        translate(${offsetX} ${offsetY}) 
        rotate(${rotate})                 
        skewX(${skewX})                   
        scale(${scaleX} ${scaleY})
      ">
        <path 
          d="${path}" 
          fill="${fillColor}" 
          stroke="${strokeColor}" 
          stroke-width="1"
        />
      </g>
    `;
  }

  /**
   * 生成提示图片
   */
  static buildHint(
    chars: Array<{ char: string }>,
    options: RequiredCaptchaOptions
  ): string {
    this.initializeFont(options.font.fontPath);
    const { hint } = options;
    const { width, height } = hint.dimensions;
    const { spacing, fontSize } = hint.font;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

    // 背景
    svg += `<rect width="100%" height="100%" fill="transparent" />`;

    // 文字
    chars.forEach(({ char }, index) => {
      const pathData = this.charToPath(this.hintFont, char, fontSize);
      const x = spacing + index * spacing;
      const y = height / 2;

      // 计算包围盒偏移量
      const width = pathData.bbox.x2 - pathData.bbox.x1;
      const height2 = pathData.bbox.y2 - pathData.bbox.y1;
      const offsetX = x - width / 2 - pathData.bbox.x1;
      const offsetY = y - height2 / 2 - pathData.bbox.y1;

      const rotate = Random.int(-34, 34);

      // 应用位移变换
      svg += `
        <g transform="
          translate(${offsetX} ${offsetY})
          rotate(${rotate})
        ">
          <path 
            d="${pathData.path}" 
            stroke-width="1"
            fill="black"
          />
        </g>
      `;
    });

    svg += "</svg>";
    return svg;
  }
  /**
   * 生成完整的SVG
   */
  static buildMain(
    chars: VerificationPoint[],
    options: RequiredCaptchaOptions
  ): string {
    this.initializeFont(options.font.fontPath);

    const { dimensions, effects } = options;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}">`;

    // 背景
    svg += `<rect width="100%" height="100%" fill="${effects.backgroundColor}"/>`;

    // 干扰线
    for (let i = 0; i < effects.noiseLines; i++) {
      svg += this.generateNoiseLine(dimensions.width, dimensions.height);
    }

    // 文字
    chars.forEach(({ char, coordinates: { x, y } }) => {
      const pathData = this.charToPath(this.font, char, options.font.fontSize);
      svg += this.generateText(pathData, x, y);
      if (isDev) {
        svg += `<circle cx="${x}" cy="${y}" r="3" fill="red" />`;
      }
    });

    svg += "</svg>";
    return svg;
  }
}
