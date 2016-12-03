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
				Field('file_path'),
				Field('file_name')
                )

db.define_table('saved_graphs',
				Field('user_id'),
                Field('user_email', default=auth.user.email if auth.user_id else None),
				Field('chart_plot'),
				Field('chart_options'),
				Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
				Field('updated_on', 'datetime', update=datetime.datetime.utcnow())
				)