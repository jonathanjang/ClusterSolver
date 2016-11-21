import csv
import random
from sklearn.cluster import KMeans
import numpy as np

upload_complete = False

def check_login():
    return response.json(dict(
        logged_in = auth.user_id is not None
        ))

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

    perform_clustering(data_list, selected_field, k, [request.vars['x_lower'],
                       request.vars['x_upper'], request.vars['y_lower'], request.vars['y_upper']])


def perform_clustering(data_list, selected_field, k, bounds_list):
    processed_data = process_data(data_list, selected_field, bounds_list)
    pairs_list = processed_data.keys()
    coordinate_list = [[x,y] for x,y in pairs_list]
    print coordinate_list
    X = np.array(coordinate_list)
    kmeans = KMeans(n_clusters=k, random_state=0).fit(X)
    print kmeans.labels_
    print kmeans.cluster_centers_


def process_data(data_list, selected_field, bounds_list):
    coordinates_to_data_dict = {}
    grouped_data = group_data(data_list, selected_field)
    # FIXME: let the user decide this ;)
    x_lower, x_upper = int(bounds_list[0]), int(bounds_list[1])
    y_lower, y_upper = int(bounds_list[2]), int(bounds_list[3])
    for group in grouped_data:
        x_center_group = random.uniform(x_lower, x_upper)
        y_center_group = random.uniform(y_lower, y_upper)
        for data in group:
            x_single_lower = x_center_group - 1 if x_center_group - 1 > x_lower else x_lower
            x_single_upper = x_center_group + 1 if x_center_group + 1 < x_upper else x_upper
            y_single_lower = y_center_group - 1 if y_center_group - 1 > y_lower else y_lower
            y_single_upper = y_center_group + 1 if y_center_group + 1 < y_upper else y_upper
            x = random.uniform(x_single_lower, x_single_upper)
            y = random.uniform(y_single_lower, y_single_upper)
            coordinates_to_data_dict[x,y] = data

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


