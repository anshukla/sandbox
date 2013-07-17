# all the imports
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash, jsonify, make_response
from contextlib import closing

# configuration
DATABASE = 'tmp/flaskr.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

# create our little application :)
""" Summary: Creates a new flask object with the right configuration

The flask object implements the WSGI application standard and is the central
object that handles view functions, URL rules, templates, etc. 

The name of the package provided is important because Flask uses it for later
determining debugging information, etc. The name of the package is also used to
resolve resources depending on if the module depends on an actual python package
(a folder with __init__.py) or if it is just a standard module (.py).

"""

app = Flask(__name__)

""" Summary: before_request(), after_request(), and teardown_request() decorates
allow us to gracefully handle database connections during the processing of a
single request.

Functions marked as before_request() are called before a request and passed no
argument. Functions marked with after_request() are called after a request and
passed the response that will be sent to the client. They have to return that
response object or a different one. 

In the case of an exception, the teardown_request() function will be called.
teardown_request() are not allowed to modify the request and their return values
are ignored.  

Flask provides a special g object. This object stores information for one
request only and is available from within each function that handles the
request.  The special g object employs some special magic to make sure threading
works well.

"""

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
	db.close()

""" Summary: Updates the configuration values using the given object. An object
can be one of the following types:

1. a string: in this case, an object with that name will be imported
2. an actual object reference: that object is used directly

The best practice is to use this function to only load configuration defaults.
You are supposed to use from_pyfile to load the actual configuration. Because a
package might be loaded system-wide, loading configuration from the package is
not recommended
"""

app.config.from_object(__name__)

# Function to easily connect to the specified database
def connect_db():
    return sqlite3.connect(app.config['DATABASE'])

""" Summary: Initializes the database according to the SQL commands stored in
schema.sql.

The closing() helper function allows us to keep a connection open for the
duration of the with block. 

The open_resource function in app already supports
this so it can be used directly.  The open_resource() function opens a file from
the resource location (which is why '__name__' needs to be used) and allows us
to read from it. 

"""

def init_db():
    with closing(connect_db()) as db:
	with app.open_resource('schema.sql', mode='r') as f:
	    db.cursor().executescript(f.read())
	db.commit()

@app.route('/')
def show_entries():
    cur = g.db.execute('select title, text from entries order by id desc')
    entries = [dict(title=row[0], text=row[1]) for row in cur.fetchall()]
    return render_template('show_entries.html', entries=entries)

@app.route('/add', methods=['POST'])
def add_entry():
    if not session.get('logged_in'):
	abort(401)
    g.db.execute('insert into entries (title, text) values (?, ?)', 
		 [request.form['title'], request.form['text']])
    g.db.commit()
    flash('New entry was successfully posted')
    return redirect(url_for('show_entries'))

""" Summary: This method checks if the supplied credentials match the
configuration environment. If true, then correct session information is
recorded. Otherwise an error message is logged using flash.

flash() flashes a message to the next request. In order to remove flashed
messages from a session and to display them to the user, the
get_flashed_messages() function must be called by a template.

"""

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
	# Use verify_username() in actual production
	if request.form['username'] != app.config['USERNAME']:
	    error = 'Invalid username'    
	elif request.form['password'] != app.config['PASSWORD']:
	    error = 'Invalid password'
	else:
	    session['logged_in'] = True
	    flash('You were logged in')
	    return redirect(url_for('show_entries'))
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    # Second paramater defines default action if key doesn't exist
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_entries'))

""" Summary: The following sections define a RESTful API for accessing posts.
The API allows you to add, edit, list, view, and delete posts. The root
URL is '/api' (for lack of a better name)

/api - GET: Retrieve complete list of posts
/api/ID - GET: Retrive post with specified ID (or None if does not exist)
/api - POST: Create a new post with 'title' and 'text' fields
/api/ID - PUT: Edit the text of a post
/api/ID - DELETE: Delet post with specified ID (or None if does not exist)

"""

@app.route('/api', methods = ['GET'])
def get_entries():
    cur = g.db.execute('select title, text from entries order by id desc')
    entries = [dict(title=row[0], text=row[1]) for row in cur.fetchall()]
    return jsonify({'entries': entries})

@app.route('/api/<int:entry_id>', methods = ['GET'])
def get_entry(entry_id):
    entry = g.db.execute('select title, text from entries where id =:entry_id', 
        {"entry_id": entry_id}).fetchone()
    if entry:
        return jsonify({'entry': {'title': entry[0], 'text': entry[1]}})
    else:
        abort(404)

@app.errorhandler(404)
def not_found(error):
    # raise Exception
    # TODO(ansh): Figure out why we can't use request.view_args
    return make_response(jsonify( {'error': "Entry does not exist."} ), 
        404)

@app.route('/api', methods = ['POST'])
def create_entry():
    if not request.json or not 'title' in request.json:
        abort(400)
    g.db.execute('insert into entries (title, text) values (?, ?)', 
        (request.json.get('title', ""), request.json.get('text', "")))
    g.db.commit()
    return jsonify(request.json), 201

@app.route('/api/<int:entry_id>', methods = ['PUT'])
def update_entry(entry_id):
    if request.json['title'] == "" or request.json['text'] == "":
        abort(400)
    entry = g.db.execute("update entries set title=:title, \
        text=:text where id =:entry_id", 
        {'title': request.json['title'], 'text': request.json['text'], 
         'entry_id': entry_id})
    if entry.rowcount:
        g.db.commit()
        return jsonify(request.json)
    else:
        abort(404)

@app.route('/api/<int:entry_id>', methods = ['DELETE'])
def delete_entry(entry_id):
    entry = g.db.execute("delete from entries where id =:entry_id", 
        {'entry_id': entry_id})
    if entry.rowcount:
        g.db.commit()
        return jsonify( {'result': True} )
    else:
        abort(404)


# If this file is the one executed, run the server
if __name__ == "__main__":
    app.run()
