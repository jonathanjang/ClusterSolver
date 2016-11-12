# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------

import csv
import pprint
import os

def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """

    # form = SQLFORM(db.importdata)
    # if form.process().accepted:
    #     file = db(db.importdata.filename != None).select().first().filename
    #     print file

    # print request


    # FROM: Rakshit's OH :)
    # print form.vars
    # for k,v in request.iteritems():
    #     print "{} -- {}".format(k,v)
    # pprint.pprint(request.file)
    # print request.folder
    # db.csv_data.import_from_csv_file(open("{}/uploads/{}".format(request.folder,form.vars.datafile),'rb'), 
    #     delimiter=',')
    # print db.tables

    # db.csv_data.import_from_csv_file(open(path, 'rb'), delimiter=',')

    form = SQLFORM(db.importdata)
    if form.process().accepted:
        path = request.folder + "/uploads/" + form.vars.datafile
        csv_parsing(path)

    return dict(form=form)

def query():
    return dict()


def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict()

def csv_parsing(path):
    with open(path, 'rb') as csvfile:
        reader = csv.reader(csvfile)
        first = True
        field_names = []
        i = 0
        for row in reader:
            if i == 0:
                field_names = row
                new_table(row)
            else:
                insert_row(row, field_names)
            i += 1


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

@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


