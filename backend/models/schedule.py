from app import db
from datetime import datetime

class StudySession(db.Model):
    __tablename__ = 'study_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'subject_id': self.subject_id,
            'subject_name': self.subject.name if self.subject else None,
            'subject_color': self.subject.color if self.subject else '#6366f1',
            'title': self.title,
            'description': self.description,
            'scheduled_date': self.scheduled_date.isoformat(),
            'duration_minutes': self.duration_minutes,
            'is_completed': self.is_completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }
