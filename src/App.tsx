
import { useState } from 'react';
import './App.css';

interface SwimRecord {
  年齢: string;
  性別: string;
  種目: string;
  距離: string;
  タイム: number;
  級: string;
}

const getAgeCategory = (age: number): string | null => {
  const categories = ["18～24", "25～29", "30～34", "35～39", "40～44", "45～49", "50～54"];
  for (const category of categories) {
    const [start, end] = category.split("～").map(Number);
    if (age >= start && age <= end) return category;
  }
  return null;
};

const parseTimeToSeconds = (minutes: number, seconds: number, milliseconds: number): number => {
  return minutes * 60 + seconds + milliseconds / 100;
};

const formatTimeDiff = (diff: number): string => {
  return diff.toFixed(2);
};

export default function App() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [style, setStyle] = useState('');
  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [milliseconds, setMilliseconds] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [nextLevel, setNextLevel] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/all_records.json');
      const records: SwimRecord[] = await response.json();
      
      const ageCategory = getAgeCategory(parseInt(age));
      if (!ageCategory) {
        setResult('該当する年齢カテゴリが見つかりませんでした。');
        return;
      }

      const timeInSeconds = parseTimeToSeconds(minutes, seconds, milliseconds);
      
      const matchingRecords = records.filter(record => 
        record.年齢 === ageCategory &&
        record.性別 === gender &&
        record.種目 === style &&
        record.距離 === distance
      );

      if (matchingRecords.length > 0) {
        const sortedRecords = [...matchingRecords].sort((a, b) => a.タイム - b.タイム);
        const currentLevel = sortedRecords.find(record => timeInSeconds <= record.タイム);
        
        if (currentLevel) {
          setResult(`🎉 あなたの級は ${currentLevel.級} 級です！`);
          
          const nextLevelRecord = sortedRecords[sortedRecords.indexOf(currentLevel) - 1];
          if (nextLevelRecord) {
            const timeDiff = formatTimeDiff(timeInSeconds - nextLevelRecord.タイム);
            setNextLevel(`💪 あと ${timeDiff} 秒で ${nextLevelRecord.級} 級に届きます！`);
          }
        } else {
          setResult('未達成');
        }
      } else {
        setResult('該当するカテゴリーが見つかりません');
      }
    } catch (error) {
      setResult('エラーが発生しました');
    }
  };

  return (
    <main className="container">
      <h1>水泳マスターズ級チェッカー</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>年齢:</label>
          <input 
            type="number" 
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>性別:</label>
          <select 
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="">選択してください</option>
            <option value="M">男性</option>
            <option value="F">女性</option>
          </select>
        </div>

        <div className="input-group">
          <label>種目:</label>
          <select 
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            required
          >
            <option value="">選択してください</option>
            <option value="freestyle">自由形</option>
            <option value="backstroke">背泳ぎ</option>
            <option value="breaststroke">平泳ぎ</option>
            <option value="butterfly">バタフライ</option>
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
            <option value="50">50m</option>
            <option value="100">100m</option>
            <option value="200">200m</option>
          </select>
        </div>

        <div className="time-input">
          <h3>⏱️ タイム入力</h3>
          <div className="time-fields">
            <div className="input-group">
              <label>分:</label>
              <input 
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="input-group">
              <label>秒:</label>
              <input 
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="input-group">
              <label>ミリ秒:</label>
              <input 
                type="number"
                min="0"
                max="99"
                value={milliseconds}
                onChange={(e) => setMilliseconds(parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>
        </div>

        <button type="submit">レベルをチェック</button>
      </form>

      {result && <div className="result">{result}</div>}
    </main>
  );
}
