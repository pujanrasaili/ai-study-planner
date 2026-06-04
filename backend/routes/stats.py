from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.schedule import StudySession
from models.subject import Subject
from models.streak import Streak
from sqlalchemy import func
from datetime import datetime, timedelta

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()

    total_sessions = StudySession.query.filter_by(user_id=user_id).count()
    completed_sessions = StudySession.query.filter_by(user_id=user_id, is_completed=True).count()
    total_subjects = Subject.query.filter_by(user_id=user_id).count()

    streak = Streak.query.filter_by(user_id=user_id).first()

    # Sessions per subject
    subject_stats = db.session.query(
        Subject.name,
        Subject.color,
        func.count(StudySession.id).label('total'),
        func.sum(
            db.case((StudySession.is_completed == True, 1), else_=0)
        ).label('completed')
    ).join(StudySession, Subject.id == StudySession.subject_id, isouter=True)\
     .filter(Subject.user_id == user_id)\
     .group_by(Subject.id).all()

    # Last 7 days activity
    week_ago = datetime.utcnow() - timedelta(days=7)
    daily_activity = db.session.query(
        func.date(StudySession.completed_at).label('date'),
        func.count(StudySession.id).label('count'),
        func.sum(StudySession.duration_minutes).label('minutes')
    ).filter(
        StudySession.user_id == user_id,
        StudySession.is_completed == True,
        StudySession.completed_at >= week_ago
    ).group_by(func.date(StudySession.completed_at)).all()

    return jsonify({
        'overview': {
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'completion_rate': round((completed_sessions / total_sessions * 100) if total_sessions > 0 else 0, 1),
            'total_subjects': total_subjects,
            'total_hours': round((streak.total_minutes / 60) if streak else 0, 1)
        },
        'streak': streak.to_dict() if streak else {},
        'subject_stats': [
            {
                'name': s.name,
                'color': s.color,
                'total': s.total or 0,
                'completed': s.completed or 0
            } for s in subject_stats
        ],
        'daily_activity': [
            {
                'date': str(d.date),
                'count': d.count,
                'minutes': d.minutes or 0
            } for d in daily_activity
        ]
    }), 200
