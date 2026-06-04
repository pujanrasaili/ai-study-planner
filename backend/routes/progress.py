from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.session import StudySession
from models.user import User
from datetime import date, timedelta

progress_bp = Blueprint("progress", __name__)

@progress_bp.route("/sessions", methods=["GET"])
@jwt_required()
def get_sessions():
    user_id = get_jwt_identity()
    sessions = StudySession.query.filter_by(user_id=user_id).order_by(StudySession.date.desc()).limit(30).all()
    return jsonify([{
        "id": s.id, "subject_id": s.subject_id,
        "date": s.date.isoformat(),
        "planned_hours": s.planned_hours,
        "actual_hours": s.actual_hours,
        "completed": s.completed,
        "notes": s.notes
    } for s in sessions]), 200

@progress_bp.route("/sessions/<int:session_id>/complete", methods=["PUT"])
@jwt_required()
def complete_session(session_id):
    user_id = get_jwt_identity()
    session = StudySession.query.filter_by(id=session_id, user_id=user_id).first_or_404()
    data = request.get_json()
    session.completed = True
    session.actual_hours = data.get("actual_hours", session.planned_hours)
    session.notes = data.get("notes", "")
    # Update streak
    user = User.query.get(user_id)
    today = date.today()
    if user.last_active == today - timedelta(days=1):
        user.streak += 1
    elif user.last_active != today:
        user.streak = 1
    user.last_active = today
    db.session.commit()
    return jsonify({"message": "Session completed", "streak": user.streak}), 200

@progress_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    week_ago = date.today() - timedelta(days=7)
    sessions = StudySession.query.filter(
        StudySession.user_id == user_id,
        StudySession.date >= week_ago,
        StudySession.completed == True
    ).all()
    total_hours = sum(s.actual_hours or 0 for s in sessions)
    return jsonify({
        "streak": user.streak,
        "weekly_hours": round(total_hours, 1),
        "sessions_completed": len(sessions)
    }), 200
