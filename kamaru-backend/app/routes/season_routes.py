from flask import Blueprint, jsonify
from app.models.season import Season

bp = Blueprint("season_routes", __name__)

# Get active season
@bp.route("/active", methods=["GET"])
def get_active_season():

    season = Season.query.filter_by(
        is_active=True
    ).first()

    if not season:
        return jsonify({
            "error": "No active season"
        }), 404

    return jsonify(season.to_dict()), 200


# Get all seasons
@bp.route("/", methods=["GET"])
def get_seasons():

    seasons = Season.query.order_by(
        Season.year.desc()
    ).all()

    return jsonify([
        season.to_dict() for season in seasons
    ]), 200