from app import app, db
from flask_login import current_user, login_required, login_user, logout_user
from app.models import Champion, User, Score
from flask import render_template, url_for, request, jsonify, flash, redirect, abort
from app.forms import LoginForm, RegistrationForm
from werkzeug.urls import url_parse
import datetime
import random
from werkzeug.security import generate_password_hash, check_password_hash

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
@app.route('/count', methods=['GET'])
def numberOfChampions():
    championCount = Champion.query().count()
    print(championCount)
    return jsonify({'count': championCount})


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
        # Lấy thông tin điểm của người dùng hiện tại
        user_id = current_user.id
        userScore = Score.query.filter_by(user_id=user_id).first()

        # Lấy danh sách tất cả người chơi và điểm số của họ
        all_scores = db.session.query(User, Score).join(Score).order_by(Score.onlineGamesWon.desc(), Score.onlineAvgGuesses.asc()).all()
        userRank = None
        players = []
        for rank, (user, score) in enumerate(all_scores, start=1):
            if rank <= 10:
                player_data = {
                    'username': user.username,
                    'games_won': score.onlineGamesWon,
                    'games_played': score.onlineGamesPlayed,
                    'avg_guesses': score.onlineAvgGuesses
                }
                players.append(player_data)
            if user.id == user_id:
                userRank = rank
                if rank > 10:
                    break
        if userScore:
            # Nếu là AJAX request
            if request.is_json:
                return jsonify({
                    "onlineGamesWon": userScore.onlineGamesWon,
                    "onlineGamesPlayed": userScore.onlineGamesPlayed,
                    "onlineAvgGuesses": userScore.onlineAvgGuesses,
                    "rank": userRank,
                    "players": players
                })
            # Nếu là page request bình thường
            else:
                return render_template("stats.html",
                                    onlineGamesWon=userScore.onlineGamesWon,
                                    onlineGamesPlayed=userScore.onlineGamesPlayed,
                                    onlineAvgGuesses=userScore.onlineAvgGuesses,
                                    rank = userRank,
                                    players=players)
        else:
            # Xử lý trường hợp không tìm thấy điểm số
            if request.is_json:
                return jsonify({"error": "No scores found."}), 404
            else:
                return render_template("stats.html", 
                                    message="No scores found.",
                                    players=players)
    else:
        # Chuyển hướng đến trang đăng nhập nếu chưa xác thực
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

@app.route('/update_settings', methods=['POST'])
@login_required
def update_settings():
    if request.method == 'POST':
        try:
            # Lấy dữ liệu từ form
            email = request.form.get('email')
            current_password = request.form.get('current_password')
            new_password = request.form.get('new_password')
            confirm_password = request.form.get('confirm_password')

            # Kiểm tra nếu có thay đổi email
            if email and email != current_user.email:
                # Kiểm tra email đã tồn tại chưa
                existing_user = User.query.filter_by(email=email).first()
                if existing_user and existing_user != current_user:
                    flash('Email already exists', 'error')
                    return redirect(url_for('home'))
                current_user.email = email
                db.session.add(current_user)

            # Kiểm tra và cập nhật mật khẩu
            if current_password and new_password:
                # Kiểm tra mật khẩu hiện tại
                if not current_user.check_password(current_password):
                    flash('Current password is incorrect', 'error')
                    return redirect(url_for('home'))
                
                # Kiểm tra mật khẩu mới và xác nhận
                if new_password != confirm_password:
                    flash('New passwords do not match', 'error')
                    return redirect(url_for('home'))
                
                # Cập nhật mật khẩu mới
                current_user.set_password(new_password)
                db.session.add(current_user)

            # Lưu các thay đổi vào database
            db.session.commit()
            flash('Settings updated successfully', 'success')

        except Exception as e:
            db.session.rollback()
            flash(f'Error updating settings: {str(e)}', 'error')
            
        return redirect(url_for('home'))

@app.route('/delete_account', methods=['POST'])
@login_required
def delete_account():
    try:
        # Xóa user từ database
        db.session.delete(current_user)
        db.session.commit()
        flash('Your account has been deleted', 'success')
        return redirect(url_for('login'))
    except:
        db.session.rollback()
        flash('Error deleting account', 'error')
        return redirect(url_for('home'))
