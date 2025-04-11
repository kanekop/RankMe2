import { useEffect, useState } from 'react';
import './App.css';

interface SwimRecord {
  年齢: string;
  性別: string;
  種目: string;
  距離: number;
  タイム: string;  // 秒に変換する前のオリジナル形式
  級: string;
}

// 時間表記 "MM:SS.ss" または "SS.ss" を 秒(float) に変換
const parseTimeString = (timeStr: string | number): number => {
  if (typeof timeStr === 'number') {
    return timeStr;
  }

  const str = String(timeStr).trim();

  // Format M.SS.CC (e.g. "7.47.40")
  const parts = str.split('.');
  if (parts.length === 3) {
    const minutes = parseInt(parts[0], 10) || 0;
    const seconds = parseInt(parts[1], 10) || 0;
    const centiseconds = parseInt(parts[2], 10) || 0;
    return minutes * 60 + seconds + centiseconds/100;
  }

  // Format MM:SS.ss (e.g. "1:23.45")
  if (str.includes(':')) {
    const [minStr, secStr] = str.split(':');
    if (!minStr || !secStr) return 0;
    const minutes = parseInt(minStr, 10) || 0;
    const seconds = parseFloat(secStr) || 0;
    return minutes * 60 + seconds;
  }

  // Format SS.ss (e.g. "45.67")
  return parseFloat(str) || 0;
};


const getAgeCategory = (age: number): string | null => {
  const categories = [
    "18〜24", "25〜29", "30〜34", "35〜39",
    "40〜44", "45〜49", "50〜54", "55〜59",
    "60〜64", "65〜69", "70〜74", "75〜79",
    "80〜84", "85〜89", "90〜"
  ];
  for (const category of categories) {
    const [start, end] = category.replace("〜", "～").split("～").map(Number);
    if (age >= start && (isNaN(end) || age <= end)) return category;
  }
  return null;
};

const parseTimeToSeconds = (inputMinutes: number, inputSeconds: number, inputMilliseconds: number): number => {
  // Convert input time to total seconds
  const userTimeInSeconds = inputMinutes * 60 + inputSeconds + inputMilliseconds / 100;
  return userTimeInSeconds;
};

const formatTimeDiff = (diff: number): string => {
  return diff.toFixed(2);
};

export default function App() {
  const [records, setRecords] = useState<SwimRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [styles, setStyles] = useState<string[]>([]);
  const [distances, setDistances] = useState<number[]>([]);

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [style, setStyle] = useState('');
  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [milliseconds, setMilliseconds] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [nextLevel, setNextLevel] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/all_records.json');
      let data: SwimRecord[] = await response.json();

      data = data.map(r => ({
        ...r,
        タイム: r.タイム,
        距離: Number(r.距離)
      }));

      setRecords(data);

      const uniqueStyles = Array.from(new Set(data.map(r => r.種目)));
      setStyles(uniqueStyles);
    };
    fetchData();
  }, []);

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStyle = e.target.value;
    setStyle(selectedStyle);

    const filteredDistances = records
      .filter(r => r.種目 === selectedStyle)
      .map(r => r.距離);

    const uniqueDistances = Array.from(new Set(filteredDistances)).sort((a, b) => a - b);
    setDistances(uniqueDistances);
    setDistance('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      setDebugLogs([]);
      const ageCategory = getAgeCategory(parseInt(age));
      setDebugLogs(prev => [...prev, `年齢カテゴリー: ${ageCategory || '見つかりません'}`]);

      if (!ageCategory) {
        setResult('該当する年齢カテゴリが見つかりませんでした。');
        return;
      }

      const timeInSeconds = parseTimeToSeconds(minutes, seconds, milliseconds);
      setDebugLogs(prev => [...prev, `入力タイム(秒): ${timeInSeconds}`]);

      const matchingRecords = records
        .filter(record =>
          record.年齢 === ageCategory &&
          record.性別 === gender &&
          record.種目 === style &&
          record.距離 === parseInt(distance)
        )
      .sort((a, b) => parseTimeString(b.タイム) - parseTimeString(a.タイム));

      setDebugLogs(prev => [...prev, `見つかった記録数: ${matchingRecords.length}`]);

      if (matchingRecords.length > 0) {
        setDebugLogs(prev => [...prev, 
          '検索条件:',
          `- 年齢区分: ${ageCategory}`,
          `- 性別: ${gender}`,
          `- 種目: ${style}`,
          `- 距離: ${distance}m`,
          '\n基準タイム一覧:'
        ]);

        matchingRecords.forEach(record => {
          const recordTimeSec = parseTimeString(record.タイム);
          setDebugLogs(prev => [...prev, 
            `${record.級}級: ${record.タイム}秒 ${timeInSeconds <= recordTimeSec ? '✅ 達成' : '❌ 未達成'}`
          ]);
        });
        // Find the highest achieved level by looking at the last record where time is less than or equal to target
        const achievedRecords = matchingRecords.filter(
          record => timeInSeconds <= parseTimeString(record.タイム)
        );
        const highestLevel = achievedRecords[achievedRecords.length - 1];

        if (highestLevel) {
          setResult(`🎉 あなたの級は ${highestLevel.級} 級です！`);

          const nextLevelIndex = matchingRecords.indexOf(highestLevel) + 1;
          if (nextLevelIndex < matchingRecords.length) {
            const nextLevelRecord = matchingRecords[nextLevelIndex];
            const nextLevelTime = parseTimeString(nextLevelRecord.タイム);
            const timeDiff = formatTimeDiff(Math.abs(nextLevelTime - timeInSeconds));
            setNextLevel(`💪 あと ${timeDiff} 秒縮めると ${nextLevelRecord.級} 級に上がれます！`);
          } else {
            setNextLevel(null);
          }
        } else {
          setResult('未達成');
          setNextLevel(null);
        }
      } else {
        setResult('該当するカテゴリーが見つかりません');
        setNextLevel(null);
      }
    } catch (error) {
      setError('エラーが発生しました');
      setResult(null);
      setNextLevel(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>水泳マスターズ級チェッカー</h1>
      <form onSubmit={handleSubmit}>
        <div className="horizontal-group">
          <div className="input-group">
            <label>年齢:</label>
            <div className="number-input">
              <button type="button" onClick={() => setAge(String(Math.max(18, parseInt(age) - 1)))}>-</button>
              <input
                type="number"
                min="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
              <button type="button" onClick={() => setAge(String(parseInt(age) + 1))}>+</button>
            </div>
          </div>

          <div className="input-group radio-group">
            <label>性別:</label>
            <div className="radio-options">
              <label className="radio-label">
                <input
                  type="radio"
                  value="男性"
                  checked={gender === "男性"}
                  onChange={(e) => setGender(e.target.value)}
                  required
                />
                男性
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="女性"
                  checked={gender === "女性"}
                  onChange={(e) => setGender(e.target.value)}
                  required
                />
                女性
              </label>
            </div>
          </div>
        </div>

        <div className="horizontal-group">
          <div className="input-group">
            <label>種目:</label>
            <select
              value={style}
              onChange={handleStyleChange}
              required
            >
              <option value="">選択してください</option>
              {styles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>距離 (m):</label>
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
            >
              <option value="">選択してください</option>
              {distances.map((d) => (
                <option key={d} value={String(d)}>{d}m</option>
              ))}
            </select>
          </div>
        </div>

        <div className="time-input">
          <h3>⏱️ タイム入力</h3>
          <div className="time-fields">
            <div className="input-group">
              <label>分:</label>
              <div className="number-input">
                <button type="button" onClick={() => setMinutes(Math.max(0, minutes - 1))}>-</button>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMinutes(val >= 0 && val <= 59 ? val : 0);
                  }}
                  required
                />
                <button type="button" onClick={() => setMinutes(Math.min(59, minutes + 1))}>+</button>
              </div>
            </div>
            <div className="input-group">
              <label>秒:</label>
              <div className="number-input">
                <button type="button" onClick={() => setSeconds(Math.max(0, seconds - 1))}>-</button>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                  required
                />
                <button type="button" onClick={() => setSeconds(Math.min(59, seconds + 1))}>+</button>
              </div>
            </div>
            <div className="input-group">
              <label>ミリ秒:</label>
              <div className="number-input">
                <button type="button" onClick={() => setMilliseconds(Math.max(0, milliseconds - 1))}>-</button>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={milliseconds}
                  onChange={(e) => setMilliseconds(parseInt(e.target.value) || 0)}
                  required
                />
                <button type="button" onClick={() => setMilliseconds(Math.min(99, milliseconds + 1))}>+</button>
              </div>
            </div>
          </div>
        </div>

        <button type="submit">レベルをチェック</button>
      </form>

      {result && <div className="result">{result}</div>}
      {nextLevel && <div className="result next">{nextLevel}</div>}

      {debugLogs.length > 0 && (
        <div className="debug-logs">
          <h3>🔍 デバッグログ</h3>
          {debugLogs.map((log, index) => (
            <div key={index} className="debug-log-line">
              {log}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}