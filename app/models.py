# from typing_extensions import Self
from app import db, login
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

@login.user_loader
def load_user(id):
    return User.query.get(int(id))
# define a champion class that inherits from db.Model
class Champion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    Image = db.Column(db.String(200), unique=True)
    Name = db.Column(db.String(200), unique=True)
    Gender = db.Column(db.String(20))
    Positions = db.Column(db.String(20))
    RangeType = db.Column(db.String(20))
    Regions = db.Column(db.String(20))
    year = db.Column(db.Integer)

    def repr(self):
        return '<Champion {}>'.format(self.name)

class User(UserMixin,db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(10))

    def repr(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    onlineGamesWon = db.Column(db.Integer)
    onlineGamesPlayed = db.Column(db.Integer)
    onlineAvgGuesses = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return f'Score(id={self.id}, onlineGamesWon={self.onlineGamesWon}, onlineGamesPlayed={self.onlineGamesPlayed}, onlineAvgGuesses={self.onlineAvgGuesses}, user_id={self.user_id})'

