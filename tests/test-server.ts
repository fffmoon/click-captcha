/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-07-24 11:18:25
 * @LastEditTime: 2025-07-24 13:14:54
 */
// test-server.ts
import * as express from "express";
import * as path from "path"; // 引入 path 模块
import { ClickCaptcha } from "../src";
import { CaptchaResult, VerificationPoint, Coordinate } from "../src/types";

const app = express();
app.use(express.json());

// 内存存储验证码数据（生产环境应使用Redis等）
const store = new Map<string, VerificationPoint[]>();
const captcha = new ClickCaptcha();

// 1. 生成验证码端点
app.get("/click-captcha/captcha", async (req, res) => {
  try {
    const result: CaptchaResult = await captcha.generate();

    // 创建唯一验证码ID
    const captchaId = Date.now().toString();
    store.set(captchaId, result.verificationPoints);

    // 返回给客户端的数据（匹配前端期望格式）
    res.json({
      code: 200,
      data: {
        key: captchaId,
        image: result.imageBase64,
        hint: result.hintBase64,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: "验证码生成失败",
    });
  }
});

// 2. 验证端点
app.post("/click-captcha/verify", (req, res) => {
  const { key, positions } = req.body as {
    key: string;
    positions: Coordinate[];
  };

  if (!key || !positions) {
    return res.status(400).json({
      code: 400,
      error: "缺少参数",
    });
  }

  const storedPoints = store.get(key);
  if (!storedPoints) {
    return res.status(404).json({
      code: 404,
      error: "验证码不存在或已过期",
    });
  }

  // 执行验证
  const isValid = captcha.verify(positions, storedPoints);

  // 清理使用过的验证码
  store.delete(key);

  res.json({
    code: 200,
    data: isValid,
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "front-demo.html"));
});

// 启动服务
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`测试服务运行中：http://localhost:${PORT}`);
});
