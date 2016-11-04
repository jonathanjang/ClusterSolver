# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

db.define_table('importdata',
				Field('filename', requires=IS_NOT_EMPTY()),
				Field('datafile', 'upload')
                )

db.define_table('csv_data',
	Field('id'),
	Field('name'),
	Field('id2'),
	Field('name2'),
	Field('owner_id'))