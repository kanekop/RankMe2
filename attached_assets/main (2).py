
import streamlit as st
import pandas as pd
import json
import re

# Page config
st.set_page_config(
    page_title="水泳マスターズ級チェッカー",
    page_icon="🏊‍♀️",
    layout="centered"
)

# Custom CSS
st.markdown("""
<style>
    .stTitle {
        font-size: 2.5rem !important;
        padding-bottom: 2rem;
    }
    .stNumberInput {
        width: 100%;
    }
    .time-input {
        background-color: #f0f2f6;
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin: 1rem 0;
    }
    .result-card {
        background-color: #f0f2f6;
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin: 1rem 0;
    }
    .st-emotion-cache-16idsys p {
        font-size: 1.2rem;
    }
    /* Responsive number inputs */
    div[data-testid="stNumberInput"] {
        width: 100% !important;
    }
    div[data-testid="stNumberInput"] > div {
        flex-direction: row !important;
        width: 100% !important;
    }
    div[data-testid="stNumberInput"] input {
        text-align: center;
    }
    @media (max-width: 768px) {
        div[data-testid="stNumberInput"] > div {
            min-width: unset !important;
        }
    }
</style>
""", unsafe_allow_html=True)

# データ読み込み
@st.cache_data
def load_data():
    with open("all_records.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    df = pd.DataFrame(data)
    
    def convert_time(time_str):
        time_str = str(time_str).strip()
        if not time_str:
            return 0.0
        if time_str.startswith('.'):
            time_str = time_str[1:]
        
        parts = time_str.split('.')
        try:
            if len(parts) == 3:
                minutes = float(parts[0])
                seconds = float(parts[1])
                milliseconds = float(parts[2])
                return minutes * 60 + seconds + milliseconds/100
            return float(time_str)
        except ValueError:
            return 0.0
    
    df["タイム"] = df["タイム"].apply(convert_time)
    df["距離"] = df["距離"].astype(str)
    return df

df = load_data()

# Main title with emoji
st.title("🏊‍♀️ 水泳マスターズ級チェッカー")

# Create two columns for basic info
col1, col2 = st.columns(2)

with col1:
    input_age = st.number_input("年齢", 
                               min_value=18, 
                               max_value=100, 
                               value=25,
                               step=1,
                               key="age",
                               help="18歳から100歳までの年齢を入力してください")

with col2:
    gender = st.radio("性別",
                     sorted(df["性別"].unique()),
                     horizontal=True,
                     help="性別を選択してください")

# Event and distance selection with filtering
event = st.selectbox("種目", 
                    sorted(df["種目"].unique()),
                    help="泳ぎの種目を選択してください")

# Filter distances based on selected event
def get_available_distances(event):
    event_distances = df[df["種目"] == event]["距離"].unique()
    # Convert to integers for proper sorting
    distances = [int(d) for d in event_distances]
    return sorted(distances)

available_distances = get_available_distances(event)
distance = st.selectbox("距離 (m)", 
                       [str(d) for d in available_distances],
                       help="競技距離を選択してください")

# Time input section with better styling
st.markdown('<div class="time-input">', unsafe_allow_html=True)
st.subheader("⏱️ タイム入力")
time_cols = st.columns([1,1,1])
with time_cols[0]:
    minutes = st.number_input("分", 
                            min_value=0, 
                            max_value=59, 
                            value=0,
                            step=1,
                            key="minutes")
with time_cols[1]:
    seconds = st.number_input("秒", 
                            min_value=0, 
                            max_value=59, 
                            value=0,
                            step=1,
                            key="seconds")
with time_cols[2]:
    milliseconds = st.number_input("ミリ秒", 
                                min_value=0, 
                                max_value=99, 
                                value=0,
                                step=1,
                                key="milliseconds")
st.markdown('</div>', unsafe_allow_html=True)

# Format time string
time_str = f"{minutes}:{seconds}.{milliseconds:02d}"

# Helper functions
def get_age_category(age):
    categories = sorted(df["年齢"].unique())
    for category in categories:
        start, end = map(int, category.replace("〜", "～").split("～"))
        if start <= age <= end:
            return category
    return None

def parse_time_to_seconds(time_str):
    try:
        if ":" not in time_str and time_str.replace(".", "").isdigit():
            return float(time_str)
        time_str = time_str.strip()
        if ":" not in time_str:
            return None
        minutes, seconds = time_str.split(":")
        return round(int(minutes) * 60 + float(seconds), 2)
    except:
        return None

def find_level(df, age, gender, event, distance, input_time):
    filtered = df[
        (df["年齢"] == age) &
        (df["性別"] == gender) &
        (df["種目"] == event) &
        (df["距離"] == distance)
    ]
    matched = filtered[filtered["タイム"] > input_time].sort_values("タイム")
    if not matched.empty:
        return int(matched.iloc[0]["級"])
    return None

def time_to_next_level(df, age, gender, event, distance, input_time):
    filtered = df[
        (df["年齢"] == age) &
        (df["性別"] == gender) &
        (df["種目"] == event) &
        (df["距離"] == distance)
    ].copy()
    filtered.loc[:, "タイム"] = pd.to_numeric(filtered["タイム"], errors="coerce")
    faster = filtered[filtered["タイム"] <= input_time].sort_values("タイム", ascending=False)
    if not faster.empty:
        target_time = faster.iloc[0]["タイム"]
        diff = round(input_time - target_time, 2)
        next_level = int(faster.iloc[0]["級"])
        return diff, next_level
    return None, None

# Calculate button with better styling
if st.button("🎯 級を計算する", use_container_width=True):
    try:
        age = get_age_category(input_age)
        if not age:
            st.error("該当する年齢カテゴリが見つかりませんでした。")
        else:
            time = parse_time_to_seconds(time_str)
            level = find_level(df, age, gender, event, distance, time)
            
            st.markdown('<div class="result-card">', unsafe_allow_html=True)
            if level:
                st.success(f"🎉 あなたの級は {level} 級です！")
                diff, next_level = time_to_next_level(df, age, gender, event, distance, time)
                if diff is not None:
                    st.info(f"💪 あと {diff} 秒で {next_level} 級に届きます！")
            else:
                st.warning("該当する級が見つかりませんでした。")
            st.markdown('</div>', unsafe_allow_html=True)
            
    except Exception as e:
        st.error("エラーが発生しました。タイムの形式を確認してください。")
