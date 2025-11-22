import sqlite3
from datetime import datetime

def init_db(db_path):
    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            input TEXT,
            sentiment TEXT,
            confidence REAL,
            severity TEXT
        )
    """)
    conn.close()

def log_event(db_path, text, result):
    conn = sqlite3.connect(db_path)
    conn.execute(
        "INSERT INTO events (timestamp, input, sentiment, confidence, severity) VALUES (?, ?, ?, ?, ?)",
        (datetime.utcnow().isoformat(), text, result["label"], result["score"], 
         "high" if result["label"] == "NEGATIVE" and result["score"] > 0.8 else "low")
    )
    conn.commit()
    conn.close()

def fetch_events(db_path, limit):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM events ORDER BY id DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    return rows

def aggregate_sentiment(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("""
        SELECT sentiment, AVG(confidence) as avg_confidence, COUNT(*) as count
        FROM events
        GROUP BY sentiment
    """)
    rows = cur.fetchall()
    conn.close()
    return [{"sentiment": r[0], "avg_confidence": r[1], "count": r[2]} for r in rows]

def health_check(db_path):
    try:
        conn = sqlite3.connect(db_path)
        conn.execute("SELECT 1")
        conn.close()
        return True
    except Exception as e:
        print(f"[DB HEALTH ERROR] {e}")
        return False
