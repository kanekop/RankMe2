
import { useState } from 'react';
import './App.css';

interface SwimRecord {
  age: number;
  gender: string;
  style: string;
  distance: number;
  time: number;
  level: string;
}

export default function App() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [style, setStyle] = useState('');
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const parseTimeToSeconds = (timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/all_records.json');
      const records: SwimRecord[] = await response.json();
      
      const timeInSeconds = parseTimeToSeconds(time);
      const userAge = parseInt(age);
      
      const matchingRecords = records.filter(record => 
        record.age === userAge &&
        record.gender === gender &&
        record.style === style &&
        record.distance === parseInt(distance)
      );

      if (matchingRecords.length > 0) {
        const level = matchingRecords.find(record => timeInSeconds <= record.time)?.level || '未達成';
        setResult(`あなたのレベル: ${level}`);
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

        <div className="input-group">
          <label>タイム (分:秒):</label>
          <input 
            type="text"
            placeholder="1:30"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            pattern="\d{1,2}:\d{2}"
            required
          />
        </div>

        <button type="submit">レベルをチェック</button>
      </form>

      {result && <div className="result">{result}</div>}
    </main>
  );
}
