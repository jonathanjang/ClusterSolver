# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

db.define_table('import_data',
				# Field('datafile', 'upload'),
				Field('file_path')
                )

db.define_table('csv_data',
				 Field('field_names', 'list:string'),
				 Field('csv_rows'))
