from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.subject import Subject
from datetime import date

subjects_bp = Blueprint("subjects", __name__)

@subjects_bp.route("/", methods=["GET"])
@jwt_required()
def get_subjects():
    user_id = get_jwt_identity()
    subjects = Subject.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": s.id, "name": s.name,
        "exam_date": s.exam_date.isoformat(),
        "difficulty": s.difficulty,
        "hours_per_week": s.hours_per_week,
        "color": s.color,
        "completed_topics": s.completed_topics,
        "total_topics": s.total_topics,
        "days_until_exam": (s.exam_date - date.today()).days
    } for s in subjects]), 200

@subjects_bp.route("/", methods=["POST"])
@jwt_required()
def create_subject():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not all(k in data for k in ["name", "exam_date"]):
        return jsonify({"error": "Missing fields"}), 400
    subject = Subject(
        user_id=user_id,
        name=data["name"],
        exam_date=date.fromisoformat(data["exam_date"]),
        difficulty=data.get("difficulty", "medium"),
        hours_per_week=data.get("hours_per_week", 5.0),
        color=data.get("color", "#6366f1"),
        total_topics=data.get("total_topics", 10)
    )
    db.session.add(subject)
    db.session.commit()
    return jsonify({"id": subject.id, "name": subject.name, "message": "Subject created"}), 201

@subjects_bp.route("/<int:subject_id>", methods=["PUT"])
@jwt_required()
def update_subject(subject_id):
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first_or_404()
    data = request.get_json()
    for field in ["name", "difficulty", "hours_per_week", "color", "completed_topics", "total_topics"]:
        if field in data:
            setattr(subject, field, data[field])
    if "exam_date" in data:
        subject.exam_date = date.fromisoformat(data["exam_date"])
    db.session.commit()
    return jsonify({"message": "Updated"}), 200

@subjects_bp.route("/<int:subject_id>", methods=["DELETE"])
@jwt_required()
def delete_subject(subject_id):
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first_or_404()
    db.session.delete(subject)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200
