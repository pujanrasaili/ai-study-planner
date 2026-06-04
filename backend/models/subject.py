from database import db
from datetime import datetime

class Subject(db.Model):
    __tablename__ = "subjects"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    exam_date = db.Column(db.Date, nullable=False)
    difficulty = db.Column(db.String(20), default="medium")  # easy, medium, hard
    hours_per_week = db.Column(db.Float, default=5.0)
    color = db.Column(db.String(20), default="#6366f1")
    completed_topics = db.Column(db.Integer, default=0)
    total_topics = db.Column(db.Integer, default=10)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sessions = db.relationship("StudySession", backref="subject", lazy=True, cascade="all, delete")
