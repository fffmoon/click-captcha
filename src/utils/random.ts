/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-05 13:28:41
 * @LastEditTime: 2025-07-23 14:24:53
 */
export class Random {
  /**
   * 生成指定范围内的随机整数
   */
  static int(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
  }

  /**
   * 生成随机颜色
   */
  static color(): string {
    return `rgb(${this.int(0, 255)},${this.int(0, 255)},${this.int(0, 255)})`;
  }

  /**
   * 生成随机灰度颜色
   */
  static greyColor(min: number, max: number): string {
    const grey = this.int(min, max);
    return `rgb(${grey},${grey},${grey})`;
  }

  /**
   * 生成指定范围内的随机浮点数
   */
  static float(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
