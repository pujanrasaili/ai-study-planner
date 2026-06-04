from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.subject import Subject
from models.session import StudySession
from models.user import User
import os
import json
import requests
from datetime import date

schedule_bp = Blueprint("schedule", __name__)

def call_groq(prompt):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 2000
    }
    resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=30)
    if resp.status_code == 200:
        return resp.json()["choices"][0]["message"]["content"]
    return None

@schedule_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_schedule():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    subjects = Subject.query.filter_by(user_id=user_id).all()

    if not subjects:
        return jsonify({"error": "No subjects found. Add subjects first."}), 400

    subjects_info = []
    for s in subjects:
        days_left = (s.exam_date - date.today()).days
        subjects_info.append(
            f"- {s.name}: exam in {days_left} days, difficulty={s.difficulty}, "
            f"{s.hours_per_week}h/week target, {s.completed_topics}/{s.total_topics} topics done"
        )

    prompt = f"""You are an expert study coach. Create a detailed weekly study schedule for a student.

Student: {user.name}
Today: {date.today().isoformat()}

Subjects:
{chr(10).join(subjects_info)}

Generate a 7-day study plan. For each day, list specific study tasks with time slots.
Prioritize subjects with closer exam dates and higher difficulty.

Return ONLY a JSON object like this (no markdown, no explanation):
{{
  "week_summary": "Brief motivational overview",
  "daily_plans": [
    {{
      "day": "Monday",
      "date": "2025-01-01",
      "total_hours": 3,
      "sessions": [
        {{
          "subject": "Math",
          "topic": "Chapter 3: Calculus",
          "hours": 1.5,
          "time_slot": "9:00 AM - 10:30 AM",
          "tips": "Focus on integration problems"
        }}
      ]
    }}
  ],
  "tips": ["tip1", "tip2", "tip3"]
}}"""

    ai_response = call_groq(prompt)

    if ai_response:
        try:
            # Clean response
            clean = ai_response.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            schedule_data = json.loads(clean.strip())
            return jsonify({"schedule": schedule_data, "ai_generated": True}), 200
        except json.JSONDecodeError:
            pass

    # Fallback schedule if no API key
    return jsonify({
        "schedule": {
            "week_summary": "Your personalized study plan is ready! Stay consistent and take breaks.",
            "daily_plans": [],
            "tips": [
                "Study in 25-minute Pomodoro sessions",
                "Review notes within 24 hours of learning",
                "Prioritize subjects with upcoming exams"
            ]
        },
        "ai_generated": False,
        "message": "Add GROQ_API_KEY to .env for AI-powered schedules"
    }), 200

@schedule_bp.route("/sessions", methods=["POST"])
@jwt_required()
def create_session():
    user_id = get_jwt_identity()
    data = request.get_json()
    session = StudySession(
        user_id=user_id,
        subject_id=data["subject_id"],
        date=date.fromisoformat(data["date"]),
        planned_hours=data.get("planned_hours", 1.0)
    )
    db.session.add(session)
    db.session.commit()
    return jsonify({"id": session.id, "message": "Session created"}), 201
