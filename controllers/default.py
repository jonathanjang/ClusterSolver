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


    form = SQLFORM(db.importdata)
    if form.process().accepted:
        path = request.folder + "/uploads/" + form.vars.datafile
        # db.csv_data.import_from_csv_file(open(path, 'rb'), delimiter=',')
        csv_parsing(path)

    return dict(form=form)

def query():
    # file = db(db.import.datafile != None).select()
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

# FIXME: this function will most likely need to be moved into another file
# function arguments may need to be modified for a delimiter value
def csv_parsing(path):
    with open(path, 'rb') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            print row



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


