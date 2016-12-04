import csv
import random
from sklearn.cluster import KMeans
import numpy as np
#VVV there may be no need for these two
import pprint
import json

upload_complete = False

def check_login():
    return response.json(dict(
        logged_in = auth.user_id is not None
        ))


def get_graphs():
    start_i = int(request.vars.start_i) if request.vars.start_i is not None else 0
    end_i = int(request.vars.end_i) if request.vars.end_i is not None else 0
    chart_data = []
    chart_options = []
    user_names = []
    posted_time = []
    updated_time = []
    can_delete = []
    fields = []
    selected = []
    has_more = False
    rows = db(db.saved_graphs).select(limitby=(start_i, end_i+1), orderby=~db.saved_graphs._id)
    for i, r in enumerate(rows):
        if i < end_i - start_i:
            chart_options.append(r.chart_options)
            chart_data.append([r.chart_plot])
            user_names.append(get_user_name_from_email(r.user_email))
            posted_time.append(r.created_on)
            updated_time.append(r.updated_on)
            can_delete.append(r.user_email == auth.user.email)
            fields.append(r.col_name)
            selected.append(r.selected)
        else:
            has_more = True


    return response.json(dict(
                chart_data=chart_data,
                chart_options=chart_options,
                user_names=user_names,
                posted_time=posted_time,
                updated_time=updated_time,
                can_delete=can_delete,
                fields=fields,
                selected=selected,
                has_more=has_more
                ))


# not being used as of this moment
def check_upload_status():
    print upload_complete
    return response.json(dict(
        upload_status = upload_complete
        ))

def start_clustering():
    k = int(request.vars.input_k)
    path = db(db.import_data).select().last().file_path
    name = db(db.import_data).select().last().file_name
    data_list = []
    d_offset = int(request.vars.d_offset)

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

    data = perform_clustering(data_list, selected_field, k, request.vars['num_iters'], 
                       [request.vars['x_lower'], request.vars['x_upper'], 
                        request.vars['y_lower'], request.vars['y_upper']], d_offset)

    nd_cluster_centers = list(data[2])
    cluster_centers = [d.tolist() for d in nd_cluster_centers]

    return response.json(dict(
        points=data[0].keys(),
        values=data[0].values(),
        labels=data[1].tolist(),
        cluster_centers=cluster_centers,
        file_name=name
        ))


def perform_clustering(data_list, selected_field, k, iterations, bounds_list, d_offset):
    processed_data = process_data(data_list, selected_field, bounds_list, d_offset)
    pairs_list = processed_data.keys()
    coordinate_list = [[x,y] for x,y in pairs_list]
    # print coordinate_list
    X = np.array(coordinate_list)
    iterations = int(iterations)
    kmeans = KMeans(n_clusters=k, random_state=0, max_iter=iterations).fit(X)
    # print kmeans.labels_
    # print kmeans.cluster_centers_


    return [processed_data, kmeans.labels_, kmeans.cluster_centers_]
    # pseudocode:
    # return dict where selected field value maps to x,y center coordinates
    # return all labels
    # return all clusters
    # return kmeans
    # return coordinate list?? or just add all to db


def process_data(data_list, selected_field, bounds_list, d_offset):
    coordinates_to_data_dict = {}
    grouped_data = group_data(data_list, selected_field)
    x_lower, x_upper = int(bounds_list[0]), int(bounds_list[1])
    y_lower, y_upper = int(bounds_list[2]), int(bounds_list[3])
    # a mapping from cluster # to 
    centers = {}
    for group in grouped_data:
        x_center_group = random.uniform(x_lower, x_upper)
        y_center_group = random.uniform(y_lower, y_upper)
        for data in group:
            x_single_lower = x_center_group - d_offset if x_center_group - d_offset > x_lower else x_lower
            x_single_upper = x_center_group + d_offset if x_center_group + d_offset < x_upper else x_upper
            y_single_lower = y_center_group - d_offset if y_center_group - d_offset > y_lower else y_lower
            y_single_upper = y_center_group + d_offset if y_center_group + d_offset < y_upper else y_upper
            x = random.uniform(x_single_lower, x_single_upper)
            y = random.uniform(y_single_lower, y_single_upper)
            coordinates_to_data_dict[x,y] = data

    # print coordinates_to_data_dict
    # print grouped_data
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

    # num clusters should depend on how many differnt values there are
    # upper bound should be different values * 3 for suggested
    # num iters should default to 300
    # new cluster parameter should depend on the length of the smallest input


    return response.json(dict(
        field_list=fields,
        f_index=[i for i in xrange(len(fields))]
        ))

def preprocess_data():
    selected_field = request.vars['checked_fields[]']
    path = db(db.import_data).select().last().file_path
    name = db(db.import_data).select().last().file_name
    field_vals = []

    with open(path, 'rb') as csvfile:
        reader = csv.reader(csvfile)
        i = 0
        field_i = -1
        for row in reader:
            if i == 0:
                field_i = row.index(selected_field)
            else:
                field_vals.append(row[field_i])
            i += 1

    k_input=len(set(field_vals))
    k_input_max=len(field_vals)

    val_lengths = [len(f) for f in field_vals]
    average_length = int(sum(val_lengths)/len(val_lengths))

    return response.json(dict(
        k_input=str(k_input),
        k_input_max=str(k_input_max),
        x_upper=str(k_input*3),
        x_upper_max=str(k_input_max*3),
        y_upper=str(k_input*3),
        y_upper_max=str(k_input_max*3),
        new_clust_param=str(30*average_length),
        new_clust_param_max=str(50*average_length),
        file_name=name
        ))


def add_to_feed():
    # print request.vars
    # print request.vars['checked_fields[]']
    db.saved_graphs.insert(user_id=auth.user_id,
                           chart_plot=request.vars.chart_plot,
                           chart_options=request.vars.chart_options,
                           col_name=request.vars['fields[]'],
                           selected=request.vars['checked_fields[]'],
                           d_offset=request.vars.d_offset)
    # print db(db.saved_graphs).select().last().chart_options
    # print db(db.saved_graphs).select().last().chart_plot

    return ""

#copied and pasted from hw2
def get_user_name_from_email(email):
    """Returns a string corresponding to the user first and last names,
    given the user email."""
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])