import os
import json
import pickle
import pandas as pd
from scipy.spatial.distance import cosine
import numpy as np
from nltk.tokenize import word_tokenize

cat_name_list = ['cat1_children', 'cat2_nonmajor', 'cat3_goodnotfam', 'cat4',
                 'cat5', 'cat6', 'cat7', 'cat8']
filter_name_list = ['time', 'genre']
def load_pickle(name):
    filename = name+'_ii.pkl'
    with open(filename, 'rb') as f:
        result = pickle.load(f)
        print(filename, 'loaded.')
        return result

cat_ii_list = [load_pickle(name) for name in cat_name_list]
filter_ii_list = [load_pickle(name) for name in filter_name_list]
title_ii = load_pickle('title')
whole_data = pd.read_pickle('whole_data.pkl')
whole_index = set(range(len(whole_data)))
# print(whole_data.head())
# print(whole_index)

from flask import Flask, request, session, g, redirect, url_for, render_template, flash
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True

def compute_similarity(idx, df):
    current_feature = df.loc[idx][['feature1', 'feature2']].values
    matrix = df[['feature1', 'feature2']].values
    dis = []
    for i in range(matrix.shape[0]):
        dis.append(cosine(current_feature, matrix[i]))
    indices = np.argsort(dis)
    # test = np.asarray(indices, dtype='int')
    # print(test)
    # print('dis', np.asarray(dis)[test])
    return indices[1:11]

def dump_data(df):
    movies = []
    for idx, row in df.iterrows():
        current_dict = {}
        current_dict["id"] = str(idx)
        current_dict["poster_path"] = str(row['poster_path'])
        current_dict["overview"] = str(row["overview"])
        current_dict["original_title"] = str(row["original_title"])
        current_dict["original_language"] = str(row["original_language"])
        current_dict["release_date"] = str(row["release_date"])
        current_dict["genre_list"] = str(row["genre_list"])
        current_dict["popularity"] = str(row["popularity"])
        current_dict["vote_average"] = str(row["vote_average"])
        movies.append(current_dict)
    if len(movies) > 30:
        movies = movies[0:30]
    my_dict = {"movies": movies}
    return json.dumps(my_dict)

def select_category(cate_idx, indices, cat_val=None):
    global cat_ii_list
    if cate_idx == 0:
        return indices
    if cat_val is None:
        if cate_idx == 8:
            return indices & cat_ii_list[cate_idx - 1][False]
        return indices & cat_ii_list[cate_idx - 1][True]
    else:
        return indices & cat_ii_list[cate_idx - 1][cat_val]

@app.route('/movie', methods=['GET'])
def get_movie():
    cat = request.args.get('cat')
    sort = request.args.get('sort')
    # ascending = request.args.get('ascending')
    filter1 = request.args.get('filter1')
    filter2 = request.args.get('filter2')
    sortby = request.args.get('sort') # str
    ascending = request.args.get('ascending') # 1 / 0
    
    global whole_index
    global filter_ii_list
    global whole_data
    result = whole_index.copy()
    print('cat received', cat, type(cat))
    if '-' in cat:
        cate_num = cat.split('-')[0]
        cate_val = cat.split('-')[1]
        result = select_category(int(cate_num), result, cat_val=int(cate_val))
    else:
        result = select_category(int(cat), result, cat_val=None)
    # filter
    if filter1 is not None:
        filter1 = int(filter1)
        result = result & filter_ii_list[0][filter1]
    if filter2 is not None:
        result = result & filter_ii_list[1][filter2]

    result = sorted(list(result))
    if sortby is not None:
        result_df = whole_data.loc[result]
        ascending = True if ascending == '1' else False
        result_df = result_df.sort_values(sortby, ascending=ascending)
    else:
        result_df = whole_data.loc[result]
    return dump_data(result_df)

@app.route('/rec/<qid>', methods=['GET'])
def get_recommendation(qid):
    global whole_data
    recommendation_indices = compute_similarity(int(qid), whole_data) 
    return dump_data(whole_data.loc[recommendation_indices])

@app.route('/search', methods=["GET"])
def search():
    global whole_data
    global whole_index
    global title_ii
    sort = request.args.get('sort')
    # ascending = request.args.get('ascending')
    filter1 = request.args.get('filter1')
    filter2 = request.args.get('filter2')
    sortby = request.args.get('sort') # str
    ascending = request.args.get('ascending') # 1 / 0

    query = request.args.get("q")
    query = query.lower()
    print('query', query)
    toks = query.split('+')
    result = whole_index.copy()
    for tok in toks:
        if tok not in title_ii:
            result = []
            break
        else:
            result = result & title_ii[tok]

    # filter
    if filter1 is not None:
        filter1 = int(filter1)
        result = result & filter_ii_list[0][filter1]
    if filter2 is not None:
        result = result & filter_ii_list[1][filter2]

    result = sorted(list(result))
    if sortby is not None:
        result_df = whole_data.loc[result]
        ascending = True if ascending == '1' else False
        result_df = result_df.sort_values(sortby, ascending=ascending)
    else:
        result_df = whole_data.loc[result]

    if len(result) == 0:
        return json.dumps({"movies":"No result"})
    else:
        return dump_data(whole_data.loc[result])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8082)