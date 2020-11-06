from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
import psycopg2
# from flask_cors import CORS


app = Flask(__name__)
# cors = CORS(app)

db = SQLAlchemy()

# connect to the db
# con = psycopg2.connect(
#             host="ec2-52-73-199-211.compute-1.amazonaws.com",
#             database="d1pkrk7oaeh4rp",
#             user="ehtmttkcjfldys",
#             password="a58fcaad2c9acb903fbf11d2031dd10e0f579453bf877d90736ef3b4e993e049"
# )

DATABASE_URL = 'postgres://ehtmttkcjfldys:a58fcaad2c9acb903fbf11d2031dd10e0f579453bf877d90736ef3b4e993e049@ec2-52-73-199-211.compute-1.amazonaws.com:5432/d1pkrk7oaeh4rp'

con = psycopg2.connect(DATABASE_URL)

def calgary_data_fun():
    cur = con.cursor()

    # execute query
    cur.execute("SELECT json_agg(t) FROM (select * from calgary)t")
    # cur.execute("SELECT json_agg(t) FROM (SELECT cl.price, cl.address, cl.postal_code, cl.bed, cl.full_bath, cl.half_bath, cl.property_area, cl.property_type, s.walk_score, s.bike_score, s.transit_score, coord.lat, coord.long FROM calgary_df AS cl JOIN score_df AS s ON cl.postal_code = s.postal_code JOIN coordinates_df AS coord ON s.postal_code = coord.postal_codes WHERE cl.price < 1000000 AND cl.property_area < 4000 AND s.walk_score > 5 AND s.bike_score > 0 AND s.transit_score > 0)t")

    calgary_data = cur.fetchall()
    # print(calgary_data)

    return calgary_data


def bar_fun():
    cur = con.cursor()

    # execute query
    cur.execute("SELECT json_agg(t) FROM (select * from calgary)t")
    # cur.execute("SELECT json_agg(t) FROM (SELECT cl.price, cl.address, cl.postal_code, cl.bed, cl.full_bath, cl.half_bath, cl.property_area, cl.property_type, s.walk_score, s.bike_score, s.transit_score, coord.lat, coord.long FROM calgary_df AS cl JOIN score_df AS s ON cl.postal_code = s.postal_code JOIN coordinates_df AS coord ON s.postal_code = coord.postal_codes WHERE cl.price < 1000000 AND cl.property_area < 4000 AND cl.property_type IS NOT null)t")

    bar_data = cur.fetchall()
    # print(calgary_data)

    return bar_data

@app.route("/")
def home():

    # create cursor
    cur = con.cursor()

    # execute query
    cur.execute("SELECT json_agg(t) FROM (SELECT * FROM calgary)t")
    # cur.execute("SELECT json_agg(t) FROM (SELECT cl.price, cl.address, cl.postal_code, cl.bed, cl.full_bath, cl.half_bath, cl.property_area, cl.property_type, s.walk_score, s.bike_score, s.transit_score, coord.lat, coord.long FROM calgary_df AS cl JOIN score_df AS s ON cl.postal_code = s.postal_code JOIN coordinates_df AS coord ON s.postal_code = coord.postal_codes WHERE cl.price < 1000000 AND cl.property_area < 4000)t")

    calgary_data = cur.fetchall()
    print(calgary_data)

    # Return template and data
    return render_template("index.html", calgary=[i for i in calgary_data])



@app.route("/jsonified")
def calgary_data():
    """Return the Calgary data as json"""
    calgary = calgary_data_fun()
    return jsonify(calgary)


@app.route("/bardata")
def bar_data():
    bar = bar_fun()
    return jsonify(bar)


@app.route("/viz")
def viz():
    return render_template("viz.html")


@app.route("/scatter")
def scatter():
    return render_template("scatter.html")


@app.route("/bar")
def bar():
    return render_template("bar.html")


@app.route("/data")
def data():
    # create cursor
    cur = con.cursor()

    # execute query
    cur.execute("select * from calgary")
    # cur.execute("SELECT json_agg(t) FROM (select * from calgary)t")
    # cur.execute("SELECT cl.price, cl.address, cl.postal_code, cl.bed, cl.full_bath, cl.half_bath, cl.property_area, cl.property_type, s.walk_score, s.bike_score, s.transit_score, coord.lat, coord.long FROM calgary_df AS cl JOIN score_df AS s ON cl.postal_code = s.postal_code JOIN coordinates_df AS coord ON s.postal_code = coord.postal_codes WHERE cl.price < 1000000 AND cl.property_area < 4000")
    
    calgary_data = cur.fetchall()
    # print(calgary_data)

    # Return template and data
    return render_template("data.html", calgary=[i for i in calgary_data])


if __name__ == "__main__":
    app.run(debug=True)