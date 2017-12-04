function getMovieData(query) {
    var baseURI = "http://localhost:8081/";
    url = baseURI + query;
    return new Prmoise((resolove, reject) => {
        xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => resolove(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}

function getSimilar(id) {
    getMovieData(id).then(function(response) {
        updatResult(response);
    }, function(Error) {
        console.log(Error);
    });
}

function updateResult(data) {
    var movies = JSON.parse(data).movies;
    var rowId;
    $("#result").empty();
    for (i in movies){
        if(i % 4 == 0) {
            rowId = "row" + i/4;
            $("#result").append('<div class ="row" id="'+ rowId + '">');
        }
        $("#"+rowId).append('<div class="col s12 m4 l3" id ="' + movies[i]['id'] + '">\
            <div class="card">\
            <div class="card-image waves-effect waves-block waves-light">\
                <img class="activator" src="http://image.tmdb.org/t/p/w342' + movies[i]['poster_path'] +'">\
            </div>\
            <div class="card-content">\
                <span class="card-title activator grey-text text-darken-4">' + movies[i]['original_title'] + '<i class="material-icons right">more_vert</i></span>\
                <button class="btn waves-effect waves-light" onclick="getMovieData(' + movies[i]['id'] + ')">Get Similar Movie</button>\
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
    
}

function hello(){
    alert("hello");
}

var myJSON = '{"movies":[{"id": "123","poster_path": "/vzmL6fP7aPKNKPRTFnZmiUfciyV.jpg","overview": "abcdefg","original_title": "movie1","language": "English", "release_date": "10/30/95", "genre_list": ["Comedy", "Drama", "Romance"],"popularity": 21.946,"vote_average": 7.7},{"id": "145","poster_path": "/vzmL6fP7aPKNKPRTFnZmiUfciyV.jpg","overview": "abcdefg","original_title": "movie2","language": "English", "release_date": "10/30/97", "genre_list": ["Animation", "Comedy", "Family"],"popularity": 21.946,"vote_average": 7.7}]}';
//var myObj = JSON.parse(myJSON);
//document.getElementById("demo").innerHTML = myObj.movies[0]['id'];