from app import app, db
from flask_login import current_user, login_required, login_user, logout_user
from app.models import Champion, User, Score
from flask import render_template, url_for, request, jsonify, flash, redirect, abort
from app.forms import LoginForm, RegistrationForm
from werkzeug.urls import url_parse
import datetime
import random

# Retrieves champion list from database for autocomplete form
@app.route("/", methods=["POST", "GET"])
def home():
    if request.method == "GET":
        res = Champion.query.with_entities(Champion.Name, Champion.Image)
        print(res)
        champions = [{"name": r.Name, "image":r.Image} for r in res]

        if not current_user.is_authenticated:
            return redirect('/login')

    return render_template("index.html", champions=champions)

# Route for the home page. The majority of the page will be displayed here. 
@app.route('/index')
def index():
    return render_template('index.html')

# Process form 
@app.route('/process', methods=['POST'])
def process():
    answer_index = request.args.get("answer_index")
    champion = request.form
    champ2 = champion.to_dict()['champion']

    champ = Champion.query.filter_by(Name=champ2).first()

    if champ is None:
        abort(403, "Forbidden: Champion not found")

    answer_champ = Champion.query.get(answer_index)


    if answer_champ is None:
        abort(500, "Internal Server Error: Could not retrieve answer champion")

    feedback = {
        'Name': "incorrect",
        'Gender': "incorrect",
        'Positions': "incorrect",
        'RangeType': "incorrect",
        'Regions': "incorrect",
        'year': None,
        'champion': "incorrect"
    }

    # Define fields to check and feedback mapping
    fields_to_check = {
        'Name': (champ.Name, answer_champ.Name),
        'Gender': (champ.Gender, answer_champ.Gender),
        'Positions': (champ.Positions, answer_champ.Positions),
        'RangeType': (champ.RangeType, answer_champ.RangeType),
        'Regions': (champ.Regions, answer_champ.Regions),
        'year': (int(champ.year), int(answer_champ.year)),
    }

    # Loop to evaluate fields
    for field, (champ_value, answer_value) in fields_to_check.items():
        if field == 'year':
            # Only 'higher' or 'lower' feedback for 'year'
            if champ_value > answer_value:
                feedback['year'] = "lower"
            elif champ_value < answer_value:
                feedback['year'] = "higher"
            else:
                feedback['year'] = "correct"
        else:
            # Generic check for other fields
            feedback[field] = "correct" if champ_value == answer_value else "incorrect"

    # Final check if champion name is correct
    feedback['champion'] = "correct" if champ.Name == answer_champ.Name else "incorrect"

    # Return JSON object with updated feedback
    return jsonify({
        'champion': feedback['champion'],
        'name': champ.Name,
        'Name': feedback['Name'],
        'Gender': feedback['Gender'],
        'gender_value': champ.Gender,
        'Positions': feedback['Positions'],
        'position_value': champ.Positions,
        'RangeType': feedback['RangeType'],
        'range_type_value': champ.RangeType,
        'Regions': feedback['Regions'],
        'regions_value': champ.Regions,
        'year': feedback['year'],
        'year_value': champ.year,
        'image': champ.Image,
        'answer': answer_champ.Name
    })

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            print("Error wrong username, password")
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('home')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()

        # initialize user score
        initial_score = Score(
            onlineGamesWon=0,
            onlineGamesPlayed=0,
            onlineAvgGuesses=0,
            user_id=user.id
        )
        db.session.add(initial_score)
        db.session.commit()

        flash('Congratulations, you are now registered!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)


@app.route('/stats', methods=['GET', 'POST'])
def getStats():
    if current_user.is_authenticated:
        user_id = current_user.id
        userScore = Score.query.filter_by(user_id=user_id).first()

        if userScore:
            onlineGamesWon = userScore.onlineGamesWon
            onlineGamesPlayed = userScore.onlineGamesPlayed
            onlineAvgGuesses = userScore.onlineAvgGuesses

            # Check if the request is AJAX (from JavaScript) or a regular page request
            if request.is_json:
                # Return JSON data for AJAX requests
                return jsonify({
                    "onlineGamesWon": onlineGamesWon,
                    "onlineGamesPlayed": onlineGamesPlayed,
                    "onlineAvgGuesses": onlineAvgGuesses
                })
            else:
                # Render the template for regular page requests
                return render_template("stats.html",
                                       onlineGamesWon=onlineGamesWon,
                                       onlineGamesPlayed=onlineGamesPlayed,
                                       onlineAvgGuesses=onlineAvgGuesses)
        else:
            # Handle case where no score is found for the user
            if request.is_json:
                return jsonify({"error": "No scores found."}), 404
            else:
                return render_template("stats.html", message="No scores found.")
    else:
        # Redirect to login if user is not authenticated
        return redirect(url_for('login'))

@app.route('/update_stats', methods=['POST'])
def updateStats():
    if current_user.is_authenticated:
        user_id = current_user.id
        userScore = Score.query.filter_by(user_id=user_id).first()

        if userScore:
            data = request.get_json()
            # Update fields if provided in the request
            userScore.onlineGamesWon = data.get('gamesWon', userScore.onlineGamesWon)
            userScore.onlineGamesPlayed = data.get('gamesPlayed', userScore.onlineGamesPlayed)
            userScore.onlineAvgGuesses = data.get('averageGuess', userScore.onlineAvgGuesses)

            db.session.commit()
            return jsonify({"message": "Stats updated successfully"})
        else:
            return jsonify({"error": "Score not found"}), 404
    else:
        return jsonify({"error": "Unauthorized"}), 401
