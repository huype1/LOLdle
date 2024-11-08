from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.fields.choices import SelectField
from wtforms.fields.numeric import IntegerField
from wtforms.fields.simple import FileField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo, NumberRange
from app.models import User, Champion


class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField(
        'Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')
class championForm(FlaskForm):
    Name = StringField('Name', validators=[DataRequired()])
    image_file = FileField('Image File', validators=[DataRequired(), FileAllowed(['png', 'jpg', 'jpeg', 'svg', 'webp'], 'Images only!')])
    Gender = SelectField('Gender', choices=[('Male', 'Male'), ('Female', 'Female')], validators=[DataRequired()])
    Positions = SelectField('Position', choices=[
        ('Top', 'Top'),
        ('Jungle', 'Jungle'),
        ('Middle', 'Middle'),
        ('Bot', 'Bot'),
        ('Support', 'Support')
    ], validators=[DataRequired()])
    RangeType = SelectField('Range Type', choices=[('Melee', 'Melee'), ('Ranged', 'Ranged')], validators=[DataRequired()])
    Regions = StringField('Regions', validators=[DataRequired()])
    year = IntegerField('Year', validators=[DataRequired(), NumberRange(min=1900, max=2100, message="Please enter a valid year")])

    submit = SubmitField('Add Champion')
    def validate_Name(self, Name):
        champion = Champion.query.filter(Champion.Name.like(f"%{Name.data.strip()}%")).first()
        if champion is not None:
            raise ValidationError('Champion already exists.')