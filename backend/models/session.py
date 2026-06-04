from database import db
from datetime import datetime

class StudySession(db.Model):
    __tablename__ = "study_sessions"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    planned_hours = db.Column(db.Float, default=1.0)
    actual_hours = db.Column(db.Float, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
