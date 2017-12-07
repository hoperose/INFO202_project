var currCat = "cat=0";
var recId = -1;
var searchStr = null;
var filterGenre = null;
var filterTime = null;
var mode = "movie"; //search, rec, movie
function getMovieData(query) {
    var baseURI = "http://localhost:8082/";
    url = baseURI + query;
    //console.log(url);
    return new Promise((resolove, reject) => {
        xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => resolove(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}

function getMovieDataOld(query, done) {
    var baseURI = "http://localhost:8082/";
    url = baseURI + query;
    //console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function () {
      done(null, xhr.response);
    };
    xhr.onerror = function () {
      done(xhr.response);
    };
    xhr.send();
}

/*
function getSimilar(id) {
    var query = "rec/" + id;
    console.log(query);
    getMovieDataOld(query).then(function(response) {
        updateResult(response);
    }, function(Error) {
        console.log(Error);
    });
}*/

function search(userInput) {
    userInput = userInput.replace(/ /g,"+");
    searchStr = userInput;
    mode = "search";
    var query = "search/" + userInput;
    //console.log(query);
    getMovieDataOld(query, function(err, data) {
        if(err) {throw err;}
        console.log(data);
        resetFilter();
        updateResult(data);
  })};

function getCategory(input) {
    var query = "movie?"+input;
    mode = "movie";
    console.log(query);
    getMovieDataOld(query, function(err, data) {
        if(err) {throw err;}
        console.log(data);
        resetFilter();
        updateResult(data);
  })};

  function getSimilar(id) {
    recId = id;
    mode = "rec";
    var query = "rec/" + id;
    //console.log(query);
    getMovieDataOld(query, function(err, data) {
        if(err) {throw err;}
        console.log(data);
        resetFilter();
        updateResult(data);
  })};

function refreshMovie(query) {
    getMovieDataOld(query, function(err, data) {
        if(err) {throw err;}
        console.log(data);
        resetFilter();
        updateResult(data);
  });
}

function resetFilter() {
    filterGenre = null;
    filterTime = null;
}

function resetMode() {
    mode = "movie";
}

function updateResult(data) {
    $("#result").empty();
    var movies = JSON.parse(data).movies;
    if (movies == "No result" || movies == "") {
        $("#result").empty();
        $("#result").append('<h5 class="white-text"> Oops, sorry, there is no search result for you : ( </h5>');
        return;
    }
    var movies = JSON.parse(data).movies;
    var rowId;
    
    for (i in movies){
        if(i % 4 == 0) {
            rowId = "row" + i/4;
            $("#result").append('<div class ="row" id="'+ rowId + '">');
        }
        $("#"+rowId).append('<div class="col s6 m3" id ="' + movies[i]['id'] + '">\
            <div class="card hoverable">\
            <div class="card-image waves-effect waves-block waves-light">\
                <img class="activator" src="http://image.tmdb.org/t/p/w342' + movies[i]['poster_path'] +'">\
            </div>\
            <div class="card-content">\
                <span class="one-line card-title activator grey-text text-darken-4">' + movies[i]['original_title'] + '<i class="material-icons right"></i></span>\
                <button class="btn waves-effect waves-light" onclick="getSimilar(' + movies[i]['id'] + ')">Get Similar Movie</button>\
            </div>\
            <div class="card-reveal">\
                <span class="card-title grey-text text-darken-4">' + movies[i]['original_title'] + '<i class="material-icons right">close</i></span>\
                <p>' + movies[i]['overview'] + '</p>\
            </div>\
            </div>\
        </div>');
        ;
    }
    //var keyword = response['Predictions'][0]['Tag'];
    $('.one-line').ellipsis({lines: 1});
}


var myJSON = '{"movies":[{"id": "123","poster_path": "/vzmL6fP7aPKNKPRTFnZmiUfciyV.jpg","overview": "abcdefg","original_title": "movie1","language": "English", "release_date": "10/30/95", "genre_list": ["Comedy", "Drama", "Romance"],"popularity": 21.946,"vote_average": 7.7},{"id": "145","poster_path": "/vzmL6fP7aPKNKPRTFnZmiUfciyV.jpg","overview": "abcdefg","original_title": "movie2","language": "English", "release_date": "10/30/97", "genre_list": ["Animation", "Comedy", "Family"],"popularity": 21.946,"vote_average": 7.7}]}';
//var myObj = JSON.parse(myJSON);
//document.getElementById("demo").innerHTML = myObj.movies[0]['id'];

$(".filter1").click(function(e){
    var query;
    console.log(e.target.id);
    switch(mode) {
        case 'movie':
            query = "movie?" + currCat + "&filter1=";
            break;
        case 'search':
            query = "search/" + searchStr + "&filter1=";
            break;
        case 'rec':
            query = "rec/" + recId + "&filter1=";
            break;
        default:
            console.log("mode error");
    }
    filterTime = e.target.id;
    switch(filterTime) {
        case 'ft1':
            filterTime = 1;
            break;
        case 'ft2':
            filterTime = 2;
            break;
        case 'ft3':
            filterTime = 3;
            break;
        default:
            console.log("filter error");
    }
    query = query + filterTime;
    if(filterGenre != null)
        query = query + "&filter2=" + filterGenre;
    refreshMovie(query);
})

$(".filter2").click(function(e){
    var query;
    console.log(e.target.id);
    filterGenre = e.target.id;
    switch(mode) {
        case 'movie':
            query = "movie?" + currCat + "&filter2=";
            break;
        case 'search':
            query = "search/" + searchStr + "&filter2=";
            break;
        case 'rec':
            query = "rec/" + recId + "&filter2=";
            break;
        default:
            console.log("mode error");
    }
    query = query + filterGenre;
    if(filterTime != null)
        query = query + "&filter1=" + filterTime;
    refreshMovie(query);
})

$("#searchbar").submit(function (e){
    console.log($("#search").val());
    e.preventDefault();
    search($("#search").val());
  });

$("input").click(function (e) {
    var sortby;
    var query;
    switch(mode) {
        case 'movie':
            query = "movie?" + currCat;
            break;
        case 'search':
            query = "search/" + searchStr;
            break;
        case 'rec':
            query = "rec/" + recId;
            break;
        default:
            console.log("mode error");
    }

    switch($("#sort input:radio:checked").val()){
        case '0':
            sortby = "sort=release_date&ascending=0";
            break;
        case '1':
            sortby = "sort=release_date&ascending=1";
            break;
        case '2':
            sortby = "sort=popularity&ascending=0";
            break;
        case '3':
            sortby = "sort=popularity&ascending=1";
            break;
        case '4':
            sortby = "sort=vote_average&ascending=0";
            break;
        case '5':
            sortby = "sort=vote_average&ascending=1";
            break;
        default:
        sortby = "sort=release_date&ascending=0";
    }
    
    query = query + '&'+sortby;
    if (filterGenre != null)
        query = query + "&filter2=" + filterGenre;
    if (filterTime != null)
        query = query + "&filter1=" + filterTime;
    refreshMovie(query);
});

$('#start').click(function (e){
    console.log('start');
    $('#landing').hide();
    $('#category').show();
    resetFilter();
    
  });
  
$('.cat').click(function (e) {
    currCat = e.target.id;
    console.log(currCat);
    var query = "movie?" + currCat;
    getCategory(currCat)
});
