/**
 * 语音管理（朗读 + 语音识别 + 录音回放）
 * 使用 Web Speech API + MediaRecorder（Chrome / Edge 支持最佳）
 */

export class SpeechManager {
  private static synth = window.speechSynthesis;
  private static recognition: any = null;
  private static isListening = false;

  // 录音回放
  private static mediaRecorder: any = null;
  private static audioChunks: Blob[] = [];
  private static audioStream: MediaStream | null = null;
  private static captureUrl: string | null = null;

  /** TTS 朗读指定文本 */
  static speak(text: string, onEnd?: () => void, rate: number = 0.8): void {
    if (!this.synth) return;
    // 停止当前朗读
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    if (onEnd) utterance.onend = onEnd;
    this.synth.speak(utterance);
  }

  /** 停止朗读 */
  static stopSpeak(): void {
    if (this.synth) this.synth.cancel();
  }

  /** 开始语音识别（每次识别一句） */
  static startListening(
    onResult: (text: string) => void,
    onError?: (err: string) => void
  ): void {
    if (this.isListening) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError?.('浏览器不支持语音识别');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'zh-CN';
    this.recognition.interimResults = false; // 只取最终结果
    this.recognition.continuous = false;     // 单次识别
    this.recognition.maxAlternatives = 3;    // 多个候选项

    this.recognition.onresult = (event: any) => {
      // 取最可靠的识别结果
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError?.(event.error || '识别错误');
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error('语音识别启动失败:', e);
      onError?.('启动失败');
    }
  }

  /** 停止语音识别 */
  static stopListening(): void {
    if (this.recognition && this.isListening) {
      try { this.recognition.stop(); } catch (_) { /* ignore */ }
      this.isListening = false;
    }
  }

  // ========== 录音回放 (MediaRecorder) ==========

  /** 开始录制麦克风音频 */
  static startCapture(
    onError?: (err: string) => void
  ): void {
    if (this.mediaRecorder) return;

    // 清理旧 URL
    if (this.captureUrl) {
      URL.revokeObjectURL(this.captureUrl);
      this.captureUrl = null;
    }
    this.audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.audioStream = stream;
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm' : 'audio/mp4',
        });

        this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
          if (e.data.size > 0) this.audioChunks.push(e.data);
        };

        this.mediaRecorder.onerror = () => {
          this.cleanupCapture();
          onError?.('录制出错');
        };

        this.mediaRecorder.start();
      })
      .catch((err) => {
        console.error('麦克风授权失败:', err);
        onError?.('无法访问麦克风');
      });
  }

  /** 停止录制，通过回调返回音频 blob URL */
  static stopCapture(onUrl?: (url: string | null) => void): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      onUrl?.(null);
      return;
    }

    const recorder = this.mediaRecorder;
    recorder.onstop = () => {
      const blob = new Blob(this.audioChunks, {
        type: recorder.mimeType || 'audio/webm',
      });
      this.captureUrl = URL.createObjectURL(blob);
      this.cleanupCapture();
      onUrl?.(this.captureUrl);
    };
    recorder.stop();
  }

  /** 播放录制的音频 */
  static playCapture(): void {
    if (!this.captureUrl) return;
    const audio = new Audio(this.captureUrl);
    audio.play().catch(() => {});
  }

  /** 是否有录制好的音频 */
  static hasCapture(): boolean {
    return this.captureUrl !== null;
  }

  /** 当前录制 URL（用于外部播放） */
  static getCaptureUrl(): string | null {
    return this.captureUrl;
  }

  private static cleanupCapture(): void {
    this.mediaRecorder = null;
    this.audioChunks = [];
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(t => t.stop());
      this.audioStream = null;
    }
  }

  static isSupported(): boolean {
    return !!(
      window.speechSynthesis &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition)
    );
  }

  /**
   * 比对用户语音识别结果与目标文本是否匹配
   * 返回 0~1 的相似度
   */
  static compareText(recognized: string, target: string): number {
    // 归一化：去标点、去空格、统一大小写
    const norm = (s: string) =>
      s.replace(/[，。、？；：！""''【】《》\s]/g, '').trim();
    const recog = norm(recognized);
    const tgt = norm(target);

    if (!recog || !tgt) return 0;
    if (recog === tgt) return 1;

    // 最长公共子序列 (LCS) 比值
    const lcsLen = this.lcs(recog, tgt);
    // 取 recog 匹配到 tgt 的比例
    return lcsLen / Math.max(tgt.length, recog.length);
  }

  /** 最长公共子序列长度 */
  private static lcs(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    // 空间优化 O(min(m,n))
    if (m < n) return this.lcs(b, a);
    const dp = new Array(n + 1).fill(0);
    for (let i = 1; i <= m; i++) {
      let prev = 0;
      for (let j = 1; j <= n; j++) {
        const temp = dp[j];
        dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]);
        prev = temp;
      }
    }
    return dp[n];
  }
}
