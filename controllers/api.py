import csv

upload_complete = False

def upload_form():
    name = request.vars.file.filename
    destination_path = request.folder + "/uploads/" + name

    new_file = open(destination_path, 'w')
    new_file.write(request.vars.file.file.read())
    new_file.close()

    csv_parsing(destination_path)
    upload_complete = True

    return 1

# not being used as of this moment
def check_upload_status():
    print upload_complete
    return response.json(dict(
        upload_status = upload_complete
        ))

def start_clustering():
    # FIXME: why does check_fields have the '[]' after it?
    print request.vars['checked_fields[]']
    checked_fields = request.vars['checked_fields[]']
    entry = db(db.csv_data).select(orderby='id').last()
    all_fields = entry.field_names
    print all_fields
    indexes = [all_fields.index(c) for c in checked_fields if c in all_fields]
    data_string = entry.csv_rows
    data_list = data_string.split('|')
    data_list = data_list[1:-1]
    print data_list


def get_fields():
    fields = db(db.csv_data).select(orderby='id')
    field_list = fields.last().field_names
    return response.json(dict(
        field_list=field_list
        ))


def csv_parsing(path):
    with open(path, 'rb') as csvfile:
        reader = csv.reader(csvfile)
        field_names = []
        data = []  #list of lists
        i = 0
        for row in reader:
            if i == 0:
                field_names = row
            else:
                data.append(row)
            i += 1

        db.csv_data.insert(field_names=field_names, csv_rows=data)






# old way to store data
# creates a db named entry_data with variable fields
# def new_table(fields):
#     db.define_table('entry_data',
#         *[Field(f) for f in fields],
#         migrate=True)

# to check db, use 'sqlite3 storage.sqlite'
# no need for primary keys or any field names 'id'
# def insert_row(row, field_names):
#     entry = { field_names[i] : row[i] for i in xrange(len(row))}
#     db.entry_data.bulk_insert([entry])  

# def get_fields():
#     fields = db(db.column_names).select(orderby='id')
#     field_string = fields.last().row_string
#     field_list = field_string.split('|')
#     return response.json(dict(
#         field_list=field_list[1:-1]
#         ))
    # fields = field_string.split('|')
    # print fields