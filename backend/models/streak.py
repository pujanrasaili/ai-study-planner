from app import db
from datetime import datetime

class Streak(db.Model):
    __tablename__ = 'streaks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    last_study_date = db.Column(db.DateTime, nullable=True)
    total_sessions = db.Column(db.Integer, default=0)
    total_minutes = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'last_study_date': self.last_study_date.isoformat() if self.last_study_date else None,
            'total_sessions': self.total_sessions,
            'total_minutes': self.total_minutes
        }
