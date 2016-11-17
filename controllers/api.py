import csv

upload_complete = False

def upload_form():
    name = request.vars.file.filename
    destination_path = request.folder + "/uploads/" + name

    # VVV this may all be unecessary
    new_file = open(destination_path, 'w')
    new_file.write(request.vars.file.file.read())
    new_file.close()

    db.import_data.insert(file_path=destination_path)

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
    path = db(db.import_data).select().last().file_path
    data_list = []

    with open(path, 'rb') as csvfile:
        reader = csv.reader(csvfile)
        i = 0
        fields = []
        for row in reader:
            if i == 0:
                fields = row
            else:
                d = {fields[i]:row[i] for i in range(len(fields))}
                data_list.append(d)
            i += 1

    selected_fields = request.vars['checked_fields[]']
    sorted_list = sorted(data_list, key=lambda x: x[selected_fields])
    print sorted_list


def get_fields():
    path = db(db.import_data).select().last().file_path

    with open(path, 'rb') as csvfile:
        reader = csv.reader(csvfile)
        fields = None
        i = 0
        for row in reader:
            if i == 0:
                fields = row
            else:
                break
            i += 1

    return response.json(dict(
        field_list=fields
        ))






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

    # def csv_parsing(path):
    # with open(path, 'rb') as csvfile:
    #     reader = csv.reader(csvfile)
    #     field_names = []
    #     data = []  #list of lists
    #     i = 0
    #     for row in reader:
    #         if i == 0:
    #             field_names = row
    #         else:
    #             data.append(row)
    #         i += 1

    #     db.csv_data.insert(field_names=field_names, csv_rows=data)
