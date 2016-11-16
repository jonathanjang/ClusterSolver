import csv

upload_complete = False

def upload_form():
    name = request.vars.file.filename
    destination_path = request.folder + "/uploads/" + name

    new_file = open(destination_path, 'w')
    # print request.vars.file.file.read()
    # print request.vars.file
    new_file.write(request.vars.file.file.read())
    new_file.close()

    csv_parsing(destination_path)
	# print isinstance(request.vars.file.file.read(), str)
	# print request.vars.file.filename
    upload_complete = True
    # print upload_complete
    return 1

# not being used as of this moment
def check_upload_status():
    print upload_complete
    return response.json(dict(
        upload_status = upload_complete
        ))

def insert_field_names(row):
    db.column_names.insert(row_string=row)
    get_fields()

def get_fields():
    fields = db(db.column_names).select(orderby='id')
    field_string = fields.last().row_string
    field_list = field_string.split('|')
    return response.json(dict(
        field_list=field_list[1:-1]
        ))
    # fields = field_string.split('|')
    # print fields


def csv_parsing(path):
    with open(path, 'rb') as csvfile:
    	# print "hello"
        reader = csv.reader(csvfile)
        # print reader
        field_names = []
        i = 0
        for row in reader:
            # print row
            if i == 0:
                field_names = row
                new_table(row)
                insert_field_names(row)
            else:
                insert_row(row, field_names)
            i += 1
    return field_names


# creates a db named entry_data with variable fields
def new_table(fields):
    db.define_table('entry_data',
        *[Field(f) for f in fields],
        migrate=True)

# to check db, use 'sqlite3 storage.sqlite'
# no need for primary keys or any field names 'id'
def insert_row(row, field_names):
    entry = { field_names[i] : row[i] for i in xrange(len(row))}
    db.entry_data.bulk_insert([entry])  
