import csv
import random
from sklearn.cluster import KMeans
import numpy as np

upload_complete = False

def upload_form():
    name = request.vars.file.filename
    destination_path = request.folder + "/uploads/" + name

    # VVV this may all be unecessary
    new_file = open(destination_path, 'w')
    new_file.write(request.vars.file.file.read())
    new_file.close()

    db.import_data.insert(file_path=destination_path)

    response.flash = T("Upload complete!")

    return response.json(dict(
        message = T("Upload complete!")
        ))

# not being used as of this moment
def check_upload_status():
    print upload_complete
    return response.json(dict(
        upload_status = upload_complete
        ))

def start_clustering():
    # FIXME: why does check_fields have the '[]' after it?
    k = int(request.vars.input_k)
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

    selected_field = request.vars['checked_fields[]']

    perform_clustering(data_list, selected_field, k)


    # ----------------sorting a list--------------------
    # selected_fields = selected_fields if type(selected_fields) is str else selected_fields[0]

def perform_clustering(data_list, selected_field, k):
    processed_data = process_data(data_list, selected_field)
    pairs_list = processed_data.keys()
    coordinate_list = [[x,y] for x,y in pairs_list]
    print coordinate_list
    X = np.array(coordinate_list)
    kmeans = KMeans(n_clusters=k, random_state=0).fit(X)
    print kmeans.labels_
    print kmeans.cluster_centers_


def process_data(data_list, selected_field):
    coordinates_to_data_dict = {}
    grouped_data = group_data(data_list, selected_field)
    x_lower, y_lower = -10, -10
    x_upper, y_upper = 10, 10
    for group in grouped_data:
        for data in group:
            coordinates_to_data_dict[random.randint(x_lower,x_upper), random.randint(y_lower,y_upper)] = data
    return coordinates_to_data_dict


def group_data(data_list, selected_field):
    sorted_list = sorted(data_list, key=lambda x: x[selected_field])
    unique_field_data = set([s[selected_field] for s in sorted_list])
    grouped_data = []
    for u in unique_field_data:
        group = []
        for s in sorted_list:
            if s[selected_field] == u:
                group.append(s)
        grouped_data.append(group)
    return grouped_data

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
