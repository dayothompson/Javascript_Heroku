# Flask Web Application

## Description

Navigating the complexities of buying a house could be easier if users could see immediately an interactive dashboard showing them the range of property prices in neighbourhoods they could be interested in on a map.


## Objective: 

To create three visualizations that show:

•	Range of house prices, red being the most expensive, yellow being the median prices and green being the cheapest available using a HeatMap.

•	A Clustermap showing the available houses for sale in the area.

•	D3 Scatterplot would show relationships between the data values

## Visuals
 
Screenshots of how a user can select visualisation options: Update with pics after project is complete and run. This will give the user directions on how to use the program.

## Tools and Libraries Used:

•	BeautifulSoup

•	D3.js.

•	Leaflet

•	Javascript

•	Jupyter Notebook

•	Mapbox

•	Mongo DB

•	Python

•	Flask

•	Web scraping

## Flow Diagram
![arcitictural_diagram](images/arcitictural_diagram.png)


## RoadMap

Expanding to other cities in Canada


## Data Sources

• Remax Canada: https://www.remax.ca/ab/calgary-real-estate

• Walk Score: https://www.walkscore.com/CA-AB/Calgary


## Web Scraping

	Libraries imported

	import pandas as pd
	import numpy as np
	import requests
	from bs4 import BeautifulSoup
	import time
	from splinter import Browser
	from sqlalchemy import create_engine
	import warnings
	warnings.filterwarnings('ignore')
	print('Libraries imported!')
	

## Extract

### Using BeautifulSoup to scrape property details (house address, house details).

	house_address = []
	house_details = []

	base_url = 'https://www.remax.ca/ab/calgary-real-estate?page='
	urls = [base_url + str(x) for x in range(1,301)]

	for url in urls:
		# Parse HTML with Beautiful Soup
		time.sleep(5)
		response = requests.get(url)
		soup = BeautifulSoup(response.text, 'html.parser')
	
		try:
    		addresses = soup.find_all('div', class_='left-content flex-one')
    		for address in addresses:
        		house_address.append(address.text)
			except:
    			house_address.append(np.nan)
    
			try:
    			details = soup.find_all('div', class_='property-details')
    			for detail in details:
        		house_details.append(detail.text)
			except:
    			house_details.append(np.nan)
## Transform

	address_df = pd.DataFrame(house_address)

	new_df = address_df[0].str.split(' ', 2, expand=True)
	new_df["price"] = new_df[1].str.replace("$", "")
	new_df["price"] = new_df["price"].str.replace(",", "")
	new_df["price"] = pd.to_numeric(new_df["price"])

	del new_df[0]
	del new_df[1]
	new_df.head()

	final_df = new_df[2].str.split(', Calgary, AB, ', expand=True)
	final_df.head()


	df_add = pd.concat([new_df, final_df], axis=1)
	del df_add[2]
	df_add.columns = ["price", "address", "postal_code"]
	df_add.head()


	details = pd.DataFrame(house_details)
	details_df_temp = details[0].str.split('|', expand=True)
	details_df_temp.head()


	details_df_bed = details_df_temp[0].str.replace(' bed', '')
	details_df_bath = details_df_temp[1].str.replace(' bath', '')
	details_df_area = details_df_temp[2].str.replace(' sqft', '')


	details_df_bath_all = details_df_bath.str.split('+', expand=True)
	details_df_bath_full = details_df_bath_all[0]
	details_df_bath_half = details_df_bath_all[1]


	details_df_bed = details_df_bed.replace('N/A', np.nan)
	details_df_bed = pd.to_numeric(details_df_bed)
	details_df_area = details_df_area.replace('N/A', np.nan)
	details_df_area = pd.to_numeric(details_df_area)
	details_df_bath_full = details_df_bath_full.replace('N/A', np.nan)
	details_df_bath_full = pd.to_numeric(details_df_bath_full)
	details_df_bath_half = details_df_bath_half.replace('N/A', np.nan)
	details_df_bath_half = pd.to_numeric(details_df_bath_half)


	data = {'bed':details_df_bed, 'full_bath':details_df_bath_full, 'half_bath':details_df_bath_half,'property_area':details_df_area, 
	'property_type':details_df_temp[3]}
   

	details_df = pd.DataFrame(data)
	details_df.head()
	
### Creating Calgary Listings DataFrame

	calgary_df_dup = pd.concat([df_add, details_df], axis=1)
	calgary_df = calgary_df_dup.drop_duplicates()
	calgary_df.head()
	
### Store Calgary Listings as CSV

	calgary_df.to_csv('calgary_df.csv', index=False)
### Reading data from saved Calgary Listings

	calgary_df = pd.read_csv('calgary_df.csv')
	calgary_df.head()
	
### Scraping Walk Score Data

	post_code_list = []

	for i in calgary_df["postal_code"]:
	post_code_list.append(i)


	scores_walk = []
	scores_bike = []
	scores_transit = []

	for i in post_code_list:

		try:
	    	postal_code = i.replace(" ", "%20")
	    	url_score = "https://www.walkscore.com/score/" + str(postal_code)
	    	time.sleep(5)
		
	    	# Parse HTML with Beautiful Soup
	    	response = requests.get(url_score)
	    	code_soup = BeautifulSoup(response.text, 'html.parser')
		
	    	if 'pp.walk.sc/badge/walk/score' in str(code_soup):
	        	ws = str(code_soup).split('pp.walk.sc/badge/walk/score/')[1][:2].replace('.','')
	        	scores_walk.append(ws)
	    		else:
	        	ws = 'N/A'
	        	scores_walk.append(ws)
	    	if 'pp.walk.sc/badge/bike/score' in str(code_soup):
	        	bs = str(code_soup).split('pp.walk.sc/badge/bike/score/')[1][:2].replace('.','')
	        	scores_bike.append(bs)
	    	else:
	        	bs = 'N/A'
	        	scores_bike.append(bs)
	    	if 'pp.walk.sc/badge/transit/score' in str(code_soup):
	        	ts = str(code_soup).split('pp.walk.sc/badge/transit/score/')[1][:2].replace('.','')
	        	scores_transit.append(ts)
	    	else:
	        	ts = 'N/A'
	        	scores_transit.append(ts)
			except:
	    	ws = 'N/A'
	    	scores_walk.append(ws)
	    	bs = 'N/A'
	    	scores_bike.append(bs)
	    	ts = 'N/A'
	    	scores_transit.append(ts)
			
### Creating the Walk Score DataFrame

	score_df_trans = {'postal_code':post_code_list, 
	              'walk_score':scores_walk, 
	              'bike_score':scores_bike, 
	              'transit_score':scores_transit}
	score_df_dup = pd.DataFrame(score_df_trans)
	score_df = score_df_dup.drop_duplicates()
	score_df.head()
	
### Saving Walk Score data to CSV
	
	score_df.to_csv('score_df.csv', index=False)
	
## Load

### PostgreSQL

	calgary_df = pd.read_csv('calgary_df.csv')
	score_df = pd.read_csv('score_df.csv')

	rds_connection_string = "postgres:123@localhost:5432/realestate_db"
	engine = create_engine(f'postgresql://{rds_connection_string}')

	calgary_df.to_sql(name= "calgary", con=engine, if_exists="replace", index=False)
	score_df.to_sql(name= "score", con=engine, if_exists="append", index=False)
	

## Converting-Postal-Codes-to-Coordinates
	csvData = pd.read_csv('score_df.csv')
	csvData.head()
	
	csvDataPC = csvData['postal_code']
	csvDataPC.head()
	
	import pgeocode
	coordinates = []
	postalCodes = []
	for i in csvDataPC:
	    country_code = pgeocode.Nominatim('ca')
	    coord = country_code.query_postal_code(str(i))
	    x = [coord.latitude, coord.longitude]
	    coordinates.append(x)
	    postalCodes.append(str(i))
		
	
	coordinatesDF = pd.DataFrame(coordinates, postalCodes)
	coordinatesDF.reset_index(inplace=True)
	
	coordinatesDF.head()
	
	coordinatesDF.columns=['postal_codes', 'lat', 'long']
	coordinatesDF.head()
	
	coordinatesDF.to_csv('data/cal_coordinatesDF.csv', index=False)

## Load

### PostgreSQL
	rds_connection_string = 'postgres:1@localhost:5432/realestate_db'
	engine = create_engine(f'postgresql://{rds_connection_string}')
	coordinatesDF.to_sql(name= 'coordinates_df', con=engine, if_exists = 'replace', index=False)

## Postgres Database
![Screen Shot 2020 10 01 At 4.58.11 PM](images/Screen%20Shot%202020-10-01%20at%204.58.11%20PM.png)

![Screen Shot 2020 10 01 At 4.59.54 PM](images/Screen%20Shot%202020-10-01%20at%204.59.54%20PM.png)

![Screen Shot 2020 10 01 At 4.59.11 PM](images/Screen%20Shot%202020-10-01%20at%204.59.11%20PM.png)


## Connect to database with Flask

	from flask import Flask, render_template, jsonify
	from flask_sqlalchemy import SQLAlchemy
	import psycopg2

	app = Flask(__name__)
	db = SQLAlchemy()

	con = psycopg2.connect(
            host="localhost",
            database="realestate_db",
            user="postgres",
            password="123"
			)

			def calgary_data_fun():
    		cur = con.cursor()

    		# execute query
    		cur.execute("SELECT json_agg(t) FROM (SELECT cl.price, cl.address, cl.postal_code, cl.bed, cl.full_bath, cl.half_bath, cl.property_area, cl.property_type, s.walk_score, s.bike_score, s.transit_score, coord.lat, coord.long FROM calgary AS cl JOIN score AS s ON cl.postal_code = s.postal_code JOIN coordinates AS coord ON s.postal_code = coord.postal_codes WHERE cl.price < 1000000 AND cl.property_area < 4000 AND s.walk_score > 5 AND s.bike_score > 0 AND s.transit_score > 0)t")

    		calgary_data = cur.fetchall()

    		return calgary_data

			def bar_fun():
    		cur = con.cursor()

    		# execute query
    		cur.execute("SELECT json_agg(t) FROM (SELECT cl.price, cl.address, cl.postal_code, cl.bed, cl.full_bath, cl.half_bath, cl.property_area, cl.property_type, s.walk_score, s.bike_score, s.transit_score, coord.lat, coord.long FROM calgary AS cl JOIN score AS s ON cl.postal_code = s.postal_code JOIN coordinates AS coord ON s.postal_code = coord.postal_codes WHERE cl.price < 1000000 AND cl.property_area < 4000 AND cl.property_type IS NOT null)t")
			
			bar_data = cur.fetchall()
			

    		return bar_data

			@app.route("/")
			def home():

    		# create cursor
    		cur = con.cursor()

    		# execute query
    		cur.execute("SELECT json_agg(t) FROM (SELECT cl.price, cl.address, cl.postal_code, cl.bed, cl.full_bath, cl.half_bath, cl.property_area, cl.property_type, s.walk_score, s.bike_score, s.transit_score, coord.lat, coord.long FROM calgary AS cl JOIN score AS s ON cl.postal_code = s.postal_code JOIN coordinates AS coord ON s.postal_code = coord.postal_codes WHERE cl.price < 1000000 AND cl.property_area < 4000)t")
    
    		calgary_data = cur.fetchall()

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
    		cur.execute("SELECT cl.price, cl.address, cl.postal_code, cl.bed, cl.full_bath, cl.half_bath, cl.property_area, cl.property_type, s.walk_score, s.bike_score, s.transit_score, coord.lat, coord.long FROM calgary AS cl JOIN score AS s ON cl.postal_code = s.postal_code JOIN coordinates AS coord ON s.postal_code = coord.postal_codes WHERE cl.price < 1000000 AND cl.property_area < 4000")
    
    		calgary_data = cur.fetchall()
   
    		# Return template and data
    		return render_template("data.html", calgary=[i for i in calgary_data])

			if __name__ == "__main__":
    		app.run(debug=True)

## Homepage

![Screen Shot 2020 10 01 At 4.46.56 PM](images/Screen%20Shot%202020-10-01%20at%204.46.56%20PM.png)
![Screen Shot 2020 10 01 At 4.47.31 PM](images/Screen%20Shot%202020-10-01%20at%204.47.31%20PM.png)


## Cluster Maps
![Screen Shot 2020 10 01 At 3.58.05 PM](images/Screen%20Shot%202020-10-01%20at%203.58.05%20PM.png)

![Screen Shot 2020 10 01 At 3.58.29 PM](images/Screen%20Shot%202020-10-01%20at%203.58.29%20PM.png)

![Screen Shot 2020 10 01 At 3.58.47 PM](images/Screen%20Shot%202020-10-01%20at%203.58.47%20PM.png)

![Screen Shot 2020 10 01 At 3.59.04 PM](images/Screen%20Shot%202020-10-01%20at%203.59.04%20PM.png)


## Heat Map

![Screen Shot 2020 10 01 At 3.59.25 PM](images/Screen%20Shot%202020-10-01%20at%203.59.25%20PM.png)


## Scatter Plot

### Price vs (Walk Score, Transit Score, Bike Score)

![Screen Shot 2020 10 01 At 4.01.03 PM](images/Screen%20Shot%202020-10-01%20at%204.01.03%20PM.png)

![Screen Shot 2020 10 01 At 4.01.29 PM](images/Screen%20Shot%202020-10-01%20at%204.01.29%20PM.png)

![Screen Shot 2020 10 01 At 4.02.21 PM](images/Screen%20Shot%202020-10-01%20at%204.02.21%20PM.png)


### Price vs Property Area
![Screen Shot 2020 10 01 At 4.02.36 PM](images/Screen%20Shot%202020-10-01%20at%204.02.36%20PM.png)



### Property Area vs (Walk Score, Transit Score, Bike Score)
![Screen Shot 2020 10 01 At 4.03.05 PM](images/Screen%20Shot%202020-10-01%20at%204.03.05%20PM.png)

![Screen Shot 2020 10 01 At 4.03.23 PM](images/Screen%20Shot%202020-10-01%20at%204.03.23%20PM.png)

![Screen Shot 2020 10 01 At 4.03.39 PM](images/Screen%20Shot%202020-10-01%20at%204.03.39%20PM.png)


## Density Graph
![Screen Shot 2020 10 01 At 4.04.14 PM](images/Screen%20Shot%202020-10-01%20at%204.04.14%20PM.png)

![Screen Shot 2020 10 01 At 4.04.34 PM](images/Screen%20Shot%202020-10-01%20at%204.04.34%20PM.png)

![Screen Shot 2020 10 01 At 4.04.49 PM](images/Screen%20Shot%202020-10-01%20at%204.04.49%20PM.png)


## Data
![Screen Shot 2020 10 01 At 4.55.32 PM](images/Screen%20Shot%202020-10-01%20at%204.55.32%20PM.png)


## Authors and Acknowledgements

Thanks to Ahmad, Dami and Krutheka for their guidance and support

Team Members: Alexis Lawal, Dayo Thompson, Kirushan Kirubaharan and Sushant Deshpande

 
