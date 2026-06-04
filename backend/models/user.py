from database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    streak = db.Column(db.Integer, default=0)
    last_active = db.Column(db.Date, nullable=True)

    subjects = db.relationship("Subject", backref="user", lazy=True, cascade="all, delete")
    sessions = db.relationship("StudySession", backref="user", lazy=True, cascade="all, delete")
