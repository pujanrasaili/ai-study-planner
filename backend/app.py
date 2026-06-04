from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db
from routes.auth import auth_bp
from routes.subjects import subjects_bp
from routes.schedule import schedule_bp
from routes.progress import progress_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///studyplanner.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-in-production")

db.init_app(app)
JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(subjects_bp, url_prefix="/api/subjects")
app.register_blueprint(schedule_bp, url_prefix="/api/schedule")
app.register_blueprint(progress_bp, url_prefix="/api/progress")

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
